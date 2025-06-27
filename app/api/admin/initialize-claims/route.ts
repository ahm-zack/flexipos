import { NextResponse } from 'next/server';
import { userService } from '@/lib/user-service';
import { requireSuperAdmin } from '@/lib/auth';

/**
 * Initialize custom claims for all existing users
 * This endpoint should be called once after implementing RBAC
 * Only accessible by super admins
 */
export async function POST() {
  try {
    // Check authorization
    const { authorized, error: authError } = await requireSuperAdmin();
    
    if (!authorized) {
      console.error('Unauthorized initialize-claims attempt:', authError);
      return NextResponse.json(
        { error: 'Unauthorized: Only super admins can initialize custom claims' },
        { status: 403 }
      );
    }

    // Initialize custom claims for all users
    const result = await userService.initializeCustomClaims();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced custom claims for ${result.data?.synced} users`,
      synced: result.data?.synced
    });

  } catch (error) {
    console.error('Error in initialize-claims API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
