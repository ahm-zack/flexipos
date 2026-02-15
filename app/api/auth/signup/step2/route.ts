import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { businesses, businessUsers, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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

        // Verify user exists
        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId));

        if (!existingUser) {
            return NextResponse.json(
                { error: 'User not found. Please complete step 1 first.' },
                { status: 404 }
            );
        }

        // Check if user already has a business
        const existingBusinessUser = await db.query.businessUsers.findFirst({
            where: eq(businessUsers.userId, userId),
        });

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
        const [newBusiness] = await db.insert(businesses).values({
            name: business.name,
            slug: slug,
            description: business.description || null,
            phone: business.phone || null,
            address: business.address || null,
            email: business.email || existingUser.email,
            timezone: business.timezone || 'Asia/Riyadh',
            currency: business.currency || 'SAR',
            settings: business.settings || {},
            isActive: true,
        }).returning();

        if (!newBusiness) {
            return NextResponse.json(
                { error: 'Failed to create business' },
                { status: 500 }
            );
        }

        console.log('✅ Business created:', newBusiness.id);

        // Step 2: Link user to business as admin
        await db.insert(businessUsers).values({
            businessId: newBusiness.id,
            userId: userId,
            role: 'admin', // Owner of the business
            permissions: {},
            isActive: true,
            joinedAt: new Date(),
        });

        console.log('✅ Step 2 complete: Business created and user linked');

        // Update user's full name if business name provided
        if (business.name && existingUser.fullName === existingUser.email.split('@')[0]) {
            await db
                .update(users)
                .set({ fullName: business.name })
                .where(eq(users.id, userId));
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
