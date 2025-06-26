import { createClient } from '@/utils/supabase/server';
import { User, CreateUser, UpdateUser } from '@/lib/schemas';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export class UserService {
  /**
   * Get all users
   */
  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error in getUsers:', error);
      return { success: false, error: 'Failed to fetch users' };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<ApiResponse<User>> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in getUserById:', error);
      return { success: false, error: 'Failed to fetch user' };
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData: CreateUser): Promise<ApiResponse<User>> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in createUser:', error);
      return { success: false, error: 'Failed to create user' };
    }
  }

  /**
   * Update user
   */
  async updateUser(id: string, userData: UpdateUser): Promise<ApiResponse<User>> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in updateUser:', error);
      return { success: false, error: 'Failed to update user' };
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteUser:', error);
      return { success: false, error: 'Failed to delete user' };
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<ApiResponse<User>> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully

      if (error) {
        console.error('Error fetching user by email:', error);
        return { success: false, error: error.message };
      }

      // If no user found, return an appropriate response instead of an error
      if (!data) {
        return { success: false, error: 'User not found' };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      return { success: false, error: 'Failed to fetch user' };
    }
  }
}

export const userService = new UserService();
