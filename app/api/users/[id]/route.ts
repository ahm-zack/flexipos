import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser, deleteUser } from '@/lib/user-service-drizzle';
import { requireSuperAdmin } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authorized (super admin only)
    const { authorized, error: authCheckError } = await requireSuperAdmin();
    
    if (!authorized) {
      console.error('Unauthorized API access attempt:', authCheckError);
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only super admins can access users' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const result = await getUserById(id);
    
    if (!result.success) {
      return NextResponse.json(result, { status: result.error === 'User not found' ? 404 : 500 });
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
    // Check if user is authorized (super admin only)
    const { authorized, error: authCheckError } = await requireSuperAdmin();
    
    if (!authorized) {
      console.error('Unauthorized user update attempt:', authCheckError);
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only super admins can update users' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    
    const result = await updateUser(id, body);
    
    if (!result.success) {
      return NextResponse.json(result, { status: result.error === 'User not found' ? 404 : 500 });
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
    // Check if user is authorized (super admin only)
    const { authorized, error: authCheckError } = await requireSuperAdmin();
    
    if (!authorized) {
      console.error('Unauthorized user deletion attempt:', authCheckError);
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only super admins can delete users' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const result = await deleteUser(id);
    
    if (!result.success) {
      return NextResponse.json(result, { status: result.error === 'User not found' ? 404 : 500 });
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
