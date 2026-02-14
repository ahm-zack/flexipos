import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { db } from '@/lib/db';
import { businesses, businessUsers, users } from '@/lib/db/schema';

export async function POST(request: Request) {
    // Temporarily disabled
    return NextResponse.json(
        { error: 'Signup is currently disabled. Please contact the administrator.' },
        { status: 503 }
    );
    
    /* Commented out until we fix the signup flow
    try {
        const body = await request.json();
        const { email, password, business } = body;

        // Validate input
        if (!email || !password || !business) {
            return NextResponse.json(
                { error: 'Email, password, and business information are required' },
                { status: 400 }
            );
        }

        if (!business.name || !business.type) {
            return NextResponse.json(
                { error: 'Business name and type are required' },
                { status: 400 }
            );
        }

        // Create Supabase client
        const supabase = await createClient();

        // Step 1: Create the user account
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/`,
            },
        });

        if (authError) {
            return NextResponse.json(
                { error: authError.message },
                { status: 400 }
            );
        }

        if (!authData.user) {
            return NextResponse.json(
                { error: 'Failed to create user account' },
                { status: 500 }
            );
        }

        const userId = authData.user.id;

        // Step 1.5: Create user record in users table (required for foreign key)
        try {
            await db.insert(users).values({
                id: userId,
                email: authData.user.email!,
                fullName: business.name, // Use business name as initial full name
                role: 'user',
                isActive: true,
            });
            console.log('User record created in users table');
        } catch (userError) {
            console.error('Error creating user record:', userError);
            // Continue anyway as this might already exist
        }

        // Step 2: Create the business record
        try {
            console.log('Creating business with data:', {
                name: business.name,
                slug: business.slug,
                type: business.type,
            });

            const [newBusiness] = await db.insert(businesses).values({
                name: business.name,
                slug: business.slug,
                type: business.type as any, // Type assertion to handle enum
                address: business.address || {},
                contact: business.contact || {},
                settings: business.settings || {},
                branding: business.branding || {},
                vatSettings: business.vatSettings || {},
                timezone: business.timezone || 'Asia/Riyadh',
                currency: business.currency || 'SAR',
                language: business.language || 'ar',
                isActive: true,
            }).returning();

            if (!newBusiness) {
                // Rollback: Delete the user account
                console.error('No business returned from insert');
                const adminClient = createAdminClient();
                await adminClient.auth.admin.deleteUser(userId);
                return NextResponse.json(
                    { error: 'Failed to create business' },
                    { status: 500 }
                );
            }

            console.log('Business created successfully:', newBusiness.id);

            // Step 3: Link user to business as owner
            await db.insert(businessUsers).values({
                businessId: newBusiness.id,
                userId: userId,
                role: 'owner' as any, // Type assertion to handle enum
                permissions: {},
                isActive: true,
                joinedAt: new Date(),
            });

            console.log('User linked to business successfully');

            return NextResponse.json({
                success: true,
                data: {
                    user: {
                        id: authData.user.id,
                        email: authData.user.email,
                    },
                    business: {
                        id: newBusiness.id,
                        name: newBusiness.name,
                        slug: newBusiness.slug,
                    },
                },
            });
        } catch (dbError) {
            console.error('Error details:', JSON.stringify(dbError, null, 2));

            // Rollback: Delete the user account
            try {
                const adminClient = createAdminClient();
                await adminClient.auth.admin.deleteUser(userId);
                console.log('User account rolled back successfully');
            } catch (rollbackError) {
                console.error('Failed to rollback user account:', rollbackError);
            }

            // Check if it's a unique constraint error (slug already exists)
            if (dbError instanceof Error && dbError.message.includes('unique')) {
                return NextResponse.json(
                    { error: 'Business name already exists. Please choose a different name.' },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { error: `Failed to create business record: ${dbError instanceof Error ? dbError.message : 'Unknown error'}` },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
    */
}
