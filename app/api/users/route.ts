import { NextRequest, NextResponse } from 'next/server';
import {
  getBusinessUsers,
  createBusinessUser,
  getCurrentUserBusinessId
} from '@/lib/user-service';
import { requireAdmin } from '@/lib/auth';
import { CreateUserSchema } from '@/lib/schemas';

export async function GET() {
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

    // Get current user's business
    const businessResult = await getCurrentUserBusinessId(user.id);
    if (!businessResult.success || !businessResult.data) {
      return NextResponse.json(
        { success: false, error: 'User is not associated with any business' },
        { status: 400 }
      );
    }

    // Fetch business users for the current business
    const result = await getBusinessUsers(businessResult.data);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authorized (admin or higher)
    const { authorized, user, error: authCheckError } = await requireAdmin();

    if (!authorized || !user) {
      console.error('Unauthorized user creation attempt:', authCheckError);
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only admins can create users' },
        { status: 403 }
      );
    }

    // Get current user's business
    const businessResult = await getCurrentUserBusinessId(user.id);
    if (!businessResult.success || !businessResult.data) {
      return NextResponse.json(
        { success: false, error: 'User is not associated with any business' },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log('📝 Received user creation request:', { email: body.email, role: body.role });

    // Validate the data (map 'name' to 'fullName')
    const validatedData = CreateUserSchema.parse({
      email: body.email,
      fullName: body.name || body.fullName,
      role: body.role,
    });

    // Validate password
    if (!body.password || body.password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed, creating user in business:', businessResult.data);
    // Create business user (includes auth user, users table, and business_users table)
    const result = await createBusinessUser(
      businessResult.data,
      {
        email: validatedData.email,
        fullName: validatedData.fullName,
        password: body.password,
        role: validatedData.role,
        permissions: body.permissions || {},
      }
    );

    if (!result.success) {
      console.error('❌ Failed to create user:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    console.log('✅ User created successfully:', result.data?.user?.email);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
