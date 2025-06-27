'use server';

import { revalidatePath } from 'next/cache';
import { userService } from '@/lib/user-service';
import { CreateUserSchema, AppRoleEnum } from '@/lib/schemas';
import { createAdminClient } from '@/utils/supabase/admin';
import { requireSuperAdmin } from '@/lib/auth';

export async function createUserAction(formData: FormData) {
  try {
    // First, verify the current user is authorized (super admin only)
    const { authorized, error: authCheckError } = await requireSuperAdmin();
    
    if (!authorized) {
      console.error('Unauthorized create user attempt:', authCheckError);
      return { success: false, error: 'Unauthorized: Only super admins can create users' };
    }

    // Extract form data
    const userData = {
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      password: formData.get('password') as string,
    };

    // Validate the data
    const validatedData = CreateUserSchema.parse({
      email: userData.email,
      name: userData.name,
      role: userData.role,
    });

    // Validate password
    if (!userData.password || userData.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }

    // Create Supabase auth user with the provided password using admin client
    const adminClient = createAdminClient();
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: validatedData.email,
      password: userData.password,
      email_confirm: true, // Skip email confirmation for admin-created users
      app_metadata: {
        user_role: validatedData.role // Set role in custom claims immediately
      }
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      return { success: false, error: `Failed to create authentication user: ${authError.message}` };
    }

    // Create the user in the users table with the auth user ID
    const userWithId = {
      ...validatedData,
      id: authData.user?.id || crypto.randomUUID()
    };

    const result = await userService.createUser(userWithId);

    if (!result.success) {
      return { success: false, error: result.error || 'Failed to create user' };
    }

    revalidatePath('/admin/users');
    return { 
      success: true, 
      message: `User ${validatedData.email} created successfully with role ${validatedData.role}. User can now log in immediately.` 
    };
  } catch (error) {
    console.error('Error creating user:', error);
    const message = error instanceof Error ? error.message : 'Failed to create user';
    return { success: false, error: message };
  }
}

export async function updateUserRoleAction(userId: string, role: string) {
  try {
    // First, verify the current user is authorized (super admin only)
    const { authorized, user: currentUser, error: authCheckError } = await requireSuperAdmin();
    
    if (!authorized) {
      console.error('Unauthorized update role attempt:', authCheckError);
      return { success: false, error: 'Unauthorized: Only super admins can update user roles' };
    }

    // Prevent users from changing their own role
    if (currentUser?.id === userId) {
      return { success: false, error: 'Cannot change your own role' };
    }

    // Validate role
    const validatedRole = AppRoleEnum.parse(role);

    // Update user role
    const result = await userService.updateUser(userId, { role: validatedRole });

    if (!result.success) {
      throw new Error(result.error || 'Failed to update user role');
    }

    revalidatePath('/admin/users');
    return { success: true, message: 'User role updated successfully' };
  } catch (error) {
    console.error('Error updating user role:', error);
    const message = error instanceof Error ? error.message : 'Failed to update user role';
    return { success: false, error: message };
  }
}

export async function deleteUserAction(userId: string) {
  try {
    // First, verify the current user is authorized (super admin only)
    const { authorized, user: currentUser, error: authError } = await requireSuperAdmin();
    
    if (!authorized) {
      console.error('Unauthorized delete attempt:', authError);
      return { success: false, error: 'Unauthorized: Only super admins can delete users' };
    }

    // Prevent users from deleting themselves
    if (currentUser?.id === userId) {
      return { success: false, error: 'Cannot delete your own account' };
    }

    // Get the user to be deleted to check if they exist
    const userToDeleteResult = await userService.getUserById(userId);
    if (!userToDeleteResult.success || !userToDeleteResult.data) {
      return { success: false, error: 'User not found' };
    }

    // Delete user from both database and authentication
    const result = await userService.deleteUser(userId);

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete user');
    }

    revalidatePath('/admin/users');
    return { 
      success: true, 
      message: `User ${userToDeleteResult.data.email} deleted successfully from both database and authentication system` 
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    return { success: false, error: message };
  }
}
