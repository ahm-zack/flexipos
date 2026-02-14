import { NextRequest, NextResponse } from 'next/server';
import { getUsers, createUser } from '@/lib/user-service-drizzle';
import { createAdminClient } from '@/utils/supabase/admin';
import { requireAdmin } from '@/lib/auth';
import { CreateUserSchema } from '@/lib/schemas';

export async function GET() {
  try {
    // Check if user is authorized (admin or higher)
    const { authorized, error: authCheckError } = await requireAdmin();

    if (!authorized) {
      console.error('Unauthorized API access attempt:', authCheckError);
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only admins can access users' },
        { status: 403 }
      );
    }

    const result = await getUsers();

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
    const { authorized, error: authCheckError } = await requireAdmin();

    if (!authorized) {
      console.error('Unauthorized user creation attempt:', authCheckError);
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only admins can create users' },
        { status: 403 }
      );
    }

    const body = await request.json();

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

    const adminClient = createAdminClient();

    // Check if user already exists in Supabase Auth
    const { data: existingAuthUsers } = await adminClient.auth.admin.listUsers();
    const existingAuthUser = existingAuthUsers?.users.find(u => u.email === validatedData.email);

    let userId: string;
    let authCreated = false;

    if (existingAuthUser) {
      console.log('Auth user already exists, using existing ID:', existingAuthUser.id);
      userId = existingAuthUser.id;
    } else {
      // Create Supabase auth user with the provided password
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: validatedData.email,
        password: body.password,
        email_confirm: true,
        app_metadata: {
          user_role: validatedData.role
        }
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        return NextResponse.json(
          { success: false, error: `Failed to create authentication user: ${authError.message}` },
          { status: 500 }
        );
      }

      userId = authData.user.id;
      authCreated = true;
    }

    // Create user in database using Drizzle
    const dbResult = await createUser({
      id: userId,
      email: validatedData.email,
      fullName: validatedData.fullName,
      role: validatedData.role,
    });

    if (!dbResult.success) {
      // If database creation fails and we just created the auth user, cleanup
      if (authCreated) {
        console.error('Database user creation failed, cleaning up auth user');
        await adminClient.auth.admin.deleteUser(userId);
      }

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
