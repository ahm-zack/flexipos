'use server';

import { revalidatePath } from 'next/cache';
import { userService } from '@/lib/user-service';
import { CreateUserSchema, AppRoleEnum } from '@/lib/schemas';
import { createClient } from '@/utils/supabase/server';

export async function createUserAction(formData: FormData) {
  try {
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

    // Create Supabase auth user with the provided password
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: userData.password,
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
      message: 'User created successfully with the provided password' 
    };
  } catch (error) {
    console.error('Error creating user:', error);
    const message = error instanceof Error ? error.message : 'Failed to create user';
    return { success: false, error: message };
  }
}

export async function updateUserRoleAction(userId: string, role: string) {
  try {
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
    // Delete user
    const result = await userService.deleteUser(userId);

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete user');
    }

    revalidatePath('/admin/users');
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Error deleting user:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    return { success: false, error: message };
  }
}
