import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        const adminClient = createAdminClient();

        // Check if user already exists in auth
        const { data: existingUsers } = await adminClient.auth.admin.listUsers();
        const existingAuthUser = existingUsers?.users.find(u => u.email === email);

        if (existingAuthUser) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 400 }
            );
        }

        // Check if orphaned user exists in users table (from failed previous attempt)
        const { data: existingDbUser } = await adminClient.from('users').select('id').eq('email', email).maybeSingle();

        if (existingDbUser) {
            // Clean up orphaned user record
            console.log('🧹 Found orphaned user record, cleaning up:', existingDbUser.id);
            await adminClient.from('users').delete().eq('email', email);
            console.log('✅ Orphaned record cleaned');
        }

        console.log('📝 Creating auth user for:', email);

        // Step 1: Create the auth user
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email
            app_metadata: {
                user_role: 'admin', // Default role for new signups
            }
        });

        if (authError) {
            console.error('❌ Error creating auth user:', authError);
            return NextResponse.json(
                { error: authError.message },
                { status: 400 }
            );
        }

        if (!authData.user) {
            console.error('❌ No user data returned from auth creation');
            return NextResponse.json(
                { error: 'Failed to create user account' },
                { status: 500 }
            );
        }

        const userId = authData.user.id;
        console.log('✅ Auth user created with ID:', userId);

        // Verify the auth user was actually created by fetching it
        const { data: verifyUser, error: verifyError } = await adminClient.auth.admin.getUserById(userId);
        if (verifyError || !verifyUser.user) {
            console.error('❌ Auth user verification failed:', verifyError);
            return NextResponse.json(
                { error: 'Auth user was not created properly' },
                { status: 500 }
            );
        }
        console.log('✅ Auth user verified in database');

        // Check if this userId somehow already exists in users table (should never happen but let's be safe)
        const { data: existingUserById } = await adminClient.from('users').select('id').eq('id', userId).maybeSingle();

        if (existingUserById) {
            console.log('🧹 Found orphaned user record with this ID, cleaning up:', existingUserById.id);
            await adminClient.from('users').delete().eq('id', userId);
            console.log('✅ Orphaned record by ID cleaned');
        }

        // Step 2: Create/update user record in users table
        // The on_auth_user_created trigger may have already inserted this row,
        // so use upsert to avoid a duplicate-key conflict.
        console.log('📝 Upserting user record in users table');
        try {
            const { error: insertError } = await adminClient.from('users').upsert({
                id: userId,
                email: authData.user.email!,
                full_name: email.split('@')[0], // Temporary name, can be updated later
                role: 'admin',
                is_active: true,
            }, { onConflict: 'id' });
            if (insertError) throw insertError;

            console.log('✅ User record created in users table');
            console.log('✅ Step 1 complete: User created in auth and users table');

            return NextResponse.json({
                success: true,
                data: {
                    userId: userId,
                    email: authData.user.email,
                },
            });
        } catch (dbError) {
            // Rollback: Delete the auth user if database insert fails
            console.error('❌ Error creating user in database, rolling back:', dbError);

            try {
                console.log('🔄 Attempting to rollback auth user:', userId);
                await adminClient.auth.admin.deleteUser(userId);
                console.log('✅ Auth user rolled back successfully');
            } catch (rollbackError) {
                console.error('❌ Failed to rollback auth user:', rollbackError);
            }

            // Check if it's a duplicate key error (handles both native Error and PostgrestError)
            const isDuplicate =
                (dbError instanceof Error && dbError.message.includes('duplicate key')) ||
                (typeof dbError === 'object' && dbError !== null &&
                    ('code' in dbError && (dbError as { code: string }).code === '23505' ||
                        'message' in dbError && typeof (dbError as { message: string }).message === 'string' &&
                        (dbError as { message: string }).message.includes('duplicate key')));
            if (isDuplicate) {
                return NextResponse.json(
                    { error: 'A user with this email already exists in the database. Please try logging in or use a different email.' },
                    { status: 400 }
                );
            }

            const dbErrMsg = typeof dbError === 'object' && dbError !== null && 'message' in dbError
                ? (dbError as { message: string }).message
                : String(dbError);
            const dbErrCode = typeof dbError === 'object' && dbError !== null && 'code' in dbError
                ? (dbError as { code: string }).code
                : undefined;

            return NextResponse.json(
                { error: 'Failed to create user record. Please try again.', detail: dbErrMsg, code: dbErrCode },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Signup Step 1 error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
