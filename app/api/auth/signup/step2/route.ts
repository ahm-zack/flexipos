import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, business } = body;

        // Validate input
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required. Please complete step 1 first.' },
                { status: 400 }
            );
        }

        if (!business || !business.name) {
            return NextResponse.json(
                { error: 'Business name is required' },
                { status: 400 }
            );
        }

        const adminClient = createAdminClient();

        // Verify user exists
        const { data: existingUser } = await adminClient.from('users').select('id, email, full_name').eq('id', userId).maybeSingle();

        if (!existingUser) {
            return NextResponse.json(
                { error: 'User not found. Please complete step 1 first.' },
                { status: 404 }
            );
        }

        // Check if user already has a business
        const { data: existingBusinessUser } = await adminClient.from('business_users').select('id').eq('user_id', userId).maybeSingle();

        if (existingBusinessUser) {
            return NextResponse.json(
                { error: 'User already has a business assigned' },
                { status: 400 }
            );
        }

        const generateSlug = (name: string) => {
            return name
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        };

        const slug = business.slug || generateSlug(business.name);

        // Step 1: Create the business
        const { data: newBusiness, error: bizError } = await adminClient
            .from('businesses')
            .insert({
                name: business.name,
                slug,
                description: business.description || null,
                phone: business.phone || null,
                address: business.address || null,
                email: business.email || existingUser.email,
                timezone: business.timezone || 'Asia/Riyadh',
                currency: business.currency || 'SAR',
                settings: business.settings || {},
                is_active: true,
            })
            .select()
            .single();

        if (bizError || !newBusiness) {
            return NextResponse.json(
                { error: 'Failed to create business' },
                { status: 500 }
            );
        }

        console.log('✅ Business created:', newBusiness.id);

        // Step 2: Link user to business as admin
        await adminClient.from('business_users').insert({
            business_id: newBusiness.id,
            user_id: userId,
            role: 'admin',
            permissions: {},
            is_active: true,
            joined_at: new Date().toISOString(),
        });

        console.log('✅ Step 2 complete: Business created and user linked');

        // Update user's full name if still using the default (email prefix)
        const tempName = existingUser.email.split('@')[0];
        if (business.name && existingUser.full_name === tempName) {
            await adminClient.from('users').update({ full_name: business.name }).eq('id', userId);
        }

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    id: existingUser.id,
                    email: existingUser.email,
                },
                business: {
                    id: newBusiness.id,
                    name: newBusiness.name,
                    slug: newBusiness.slug,
                },
            },
        });
    } catch (error: unknown) {
        console.error('Signup Step 2 error:', error);

        // Check if it's a unique constraint error
        if (error instanceof Error && error.message.includes('unique')) {
            return NextResponse.json(
                { error: 'Business name already exists. Please choose a different name.' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'An unexpected error occurred while creating business' },
            { status: 500 }
        );
    }
}
