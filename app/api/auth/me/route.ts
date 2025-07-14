import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/user-service-drizzle';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        // Get the current authenticated user
        const { user: currentUser, error } = await getCurrentUser();

        if (error || !currentUser?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Get full user data from database
        const userResult = await getUserByEmail(currentUser.email);

        if (!userResult.success || !userResult.data) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                id: userResult.data.id,
                name: userResult.data.name,
                email: userResult.data.email,
                role: currentUser.role,
            }
        });
    } catch (error) {
        console.error('Error getting current user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
