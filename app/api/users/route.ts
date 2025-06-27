import { NextRequest, NextResponse } from 'next/server';
import { drizzleUserService } from '@/lib/user-service-drizzle';
import { createAdminClient } from '@/utils/supabase/admin';
import { requireSuperAdmin } from '@/lib/auth';
import { CreateUserSchema } from '@/lib/schemas';

export async function GET() {
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

    const result = await drizzleUserService.getUsers();
    
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
    // Check if user is authorized (super admin only)
    const { authorized, error: authCheckError } = await requireSuperAdmin();
    
    if (!authorized) {
      console.error('Unauthorized user creation attempt:', authCheckError);
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only super admins can create users' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate the data
    const validatedData = CreateUserSchema.parse({
      email: body.email,
      name: body.name,
      role: body.role,
    });

    // Validate password
    if (!body.password || body.password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Create Supabase auth user with the provided password using admin client
    const adminClient = createAdminClient();
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: validatedData.email,
      password: body.password,
      email_confirm: true, // Skip email confirmation for admin-created users
      app_metadata: {
        user_role: validatedData.role // Set role in custom claims immediately
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json(
        { success: false, error: `Failed to create authentication user: ${authError.message}` },
        { status: 500 }
      );
    }

    // Create user in database using Drizzle
    const dbResult = await drizzleUserService.createUser({
      id: authData.user.id,
      email: validatedData.email,
      name: validatedData.name,
      role: validatedData.role,
    });

    if (!dbResult.success) {
      // If database creation fails, cleanup the auth user
      console.error('Database user creation failed, cleaning up auth user');
      await adminClient.auth.admin.deleteUser(authData.user.id);
      
      return NextResponse.json(
        { success: false, error: dbResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json(dbResult, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
