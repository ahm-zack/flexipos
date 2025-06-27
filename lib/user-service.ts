import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
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
   * Create a new user and sync role to custom claims
   * Uses admin client to bypass RLS since only super admins can create users
   */
  async createUser(userData: CreateUser): Promise<ApiResponse<User>> {
    try {
      // Use admin client for user creation to bypass RLS
      const adminClient = createAdminClient();
      const { data, error } = await adminClient
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return { success: false, error: error.message };
      }

      // Note: Role sync to JWT custom claims is now handled in createUserAction
      // when creating the auth user, so we don't need to sync again here

      return { success: true, data };
    } catch (error) {
      console.error('Error in createUser:', error);
      return { success: false, error: 'Failed to create user' };
    }
  }

  /**
   * Update user and sync role to custom claims if role changed
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

      // If role was updated, sync to custom claims
      if (userData.role) {
        await this.syncRoleToCustomClaims(data.id, data.role);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in updateUser:', error);
      return { success: false, error: 'Failed to update user' };
    }
  }

  /**
   * Delete user from both users table and authentication
   * Uses admin client to bypass RLS and delete from auth
   */
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    try {
      // Use admin client for all operations
      const adminClient = createAdminClient();
      
      // First, delete the user from the users table
      const { error: dbError } = await adminClient
        .from('users')
        .delete()
        .eq('id', id);

      if (dbError) {
        console.error('Error deleting user from database:', dbError);
        return { success: false, error: dbError.message };
      }

      // Then, delete the user from Supabase auth using admin client
      try {
        const { error: authError } = await adminClient.auth.admin.deleteUser(id);

        if (authError) {
          console.error('Error deleting user from auth:', authError);
          // Even if auth deletion fails, the user is already deleted from the database
          // We should still report this as a partial failure
          return { 
            success: false, 
            error: `User deleted from database but failed to delete from authentication: ${authError.message}` 
          };
        }
      } catch (adminError) {
        console.error('Error deleting auth user:', adminError);
        return { 
          success: false, 
          error: `User deleted from database but failed to delete from authentication: ${adminError instanceof Error ? adminError.message : 'Unknown error'}` 
        };
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

  /**
   * Sync user role to JWT custom claims (following Supabase RBAC guide)
   */
  private async syncRoleToCustomClaims(userId: string, role: string): Promise<void> {
    try {
      const adminClient = createAdminClient();
      
      // Update user metadata in auth.users table using admin client
      const { error } = await adminClient.auth.admin.updateUserById(userId, {
        app_metadata: {
          user_role: role
        }
      });

      if (error) {
        console.error('Error syncing role to custom claims:', error);
        throw error;
      }

      console.log(`Successfully synced role '${role}' to custom claims for user ${userId}`);
    } catch (error) {
      console.error('Failed to sync role to custom claims:', error);
      // Don't throw here - we want the user creation/update to succeed even if sync fails
    }
  }

  /**
   * Initialize custom claims for all existing users
   * This should be run once after implementing RBAC
   */
  async initializeCustomClaims(): Promise<ApiResponse<{ synced: number }>> {
    try {
      const supabase = await createClient();
      
      // Get all users from the database
      const { data: users, error } = await supabase
        .from('users')
        .select('id, role');

      if (error) {
        return { success: false, error: error.message };
      }

      let syncedCount = 0;
      
      // Sync each user's role to custom claims
      for (const user of users || []) {
        try {
          await this.syncRoleToCustomClaims(user.id, user.role);
          syncedCount++;
        } catch (error) {
          console.error(`Failed to sync user ${user.id}:`, error);
        }
      }

      return { 
        success: true, 
        data: { synced: syncedCount } 
      };
    } catch (error) {
      console.error('Error initializing custom claims:', error);
      return { success: false, error: 'Failed to initialize custom claims' };
    }
  }
}

export const userService = new UserService();
