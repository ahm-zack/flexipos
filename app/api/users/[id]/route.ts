import { NextRequest, NextResponse } from 'next/server';
import {
  getBusinessUserById,
  updateBusinessUser,
  updateUserProfile,
  deleteBusinessUser,
  getCurrentUserBusinessId
} from '@/lib/user-service';
import { requireAdmin } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authorized (admin or higher)
    const { authorized, user, error: authCheckError } = await requireAdmin();

    if (!authorized || !user) {
      console.error('Unauthorized API access attempt:', authCheckError);
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only admins can access users' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Get business user by ID (this is the business_users.id, not user.id)
    const result = await getBusinessUserById(id);

    if (!result.success) {
      return NextResponse.json(result, { status: result.error === 'Business user not found' ? 404 : 500 });
    }

    // Verify the business user belongs to the same business as the current user
    const businessResult = await getCurrentUserBusinessId(user.id);
    if (businessResult.success && businessResult.data &&
      result.data?.businessId !== businessResult.data) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Cannot access users from other businesses' },
        { status: 403 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/users/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authorized (admin or higher)
    const { authorized, user, error: authCheckError } = await requireAdmin();

    if (!authorized || !user) {
      console.error('Unauthorized user update attempt:', authCheckError);
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only admins can update users' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Get the business user first to verify permissions
    const businessUserResult = await getBusinessUserById(id);
    if (!businessUserResult.success || !businessUserResult.data) {
      return NextResponse.json(
        { success: false, error: 'Business user not found' },
        { status: 404 }
      );
    }

    // Verify the business user belongs to the same business as the current user
    const businessResult = await getCurrentUserBusinessId(user.id);
    if (businessResult.success && businessResult.data &&
      businessUserResult.data.businessId !== businessResult.data) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Cannot update users from other businesses' },
        { status: 403 }
      );
    }

    // Split updates into business-specific and user profile updates
    const businessUpdates: {
      role?: string;
      permissions?: Record<string, unknown>;
      isActive?: boolean;
    } = {};

    const profileUpdates: {
      fullName?: string;
      phone?: string;
      avatarUrl?: string;
    } = {};

    // Categorize the updates
    if (body.role !== undefined) businessUpdates.role = body.role;
    if (body.permissions !== undefined) businessUpdates.permissions = body.permissions;
    if (body.isActive !== undefined) businessUpdates.isActive = body.isActive;

    if (body.fullName !== undefined || body.name !== undefined) {
      profileUpdates.fullName = body.fullName || body.name;
    }
    if (body.phone !== undefined) profileUpdates.phone = body.phone;
    if (body.avatarUrl !== undefined) profileUpdates.avatarUrl = body.avatarUrl;

    // Update business-specific fields
    let result;
    if (Object.keys(businessUpdates).length > 0) {
      result = await updateBusinessUser(id, businessUpdates);
      if (!result.success) {
        return NextResponse.json(result, { status: 500 });
      }
    }

    // Update user profile fields
    if (Object.keys(profileUpdates).length > 0) {
      const profileResult = await updateUserProfile(
        businessUserResult.data.userId,
        profileUpdates
      );
      if (!profileResult.success) {
        return NextResponse.json(profileResult, { status: 500 });
      }
    }

    // Fetch the updated business user
    result = await getBusinessUserById(id);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in PATCH /api/users/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authorized (admin or higher)
    const { authorized, user, error: authCheckError } = await requireAdmin();

    if (!authorized || !user) {
      console.error('Unauthorized user deletion attempt:', authCheckError);
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only admins can delete users' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Get the business user first to verify permissions
    const businessUserResult = await getBusinessUserById(id);
    if (!businessUserResult.success || !businessUserResult.data) {
      return NextResponse.json(
        { success: false, error: 'Business user not found' },
        { status: 404 }
      );
    }

    // Verify the business user belongs to the same business as the current user
    const businessResult = await getCurrentUserBusinessId(user.id);
    if (businessResult.success && businessResult.data &&
      businessUserResult.data.businessId !== businessResult.data) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Cannot delete users from other businesses' },
        { status: 403 }
      );
    }

    // Delete business user (remove from business, and optionally delete user completely)
    const result = await deleteBusinessUser(id, {
      deleteUserCompletely: true  // Will only delete user if not in other businesses
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in DELETE /api/users/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
