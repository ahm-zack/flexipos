import { db, users, User, NewUser } from '@/lib/db';
import { createAdminClient } from '@/utils/supabase/admin';
import { eq } from 'drizzle-orm';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export class DrizzleUserService {
  /**
   * Get all users with type safety
   */
  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const allUsers = await db.select().from(users).orderBy(users.createdAt);
      return { success: true, data: allUsers };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { success: false, error: 'Failed to fetch users' };
    }
  }

  /**
   * Get user by ID with type safety
   */
  async getUserById(id: string): Promise<ApiResponse<User>> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      return { success: true, data: user };
    } catch (error) {
      console.error('Error fetching user:', error);
      return { success: false, error: 'Failed to fetch user' };
    }
  }

  /**
   * Get user by email with type safety
   */
  async getUserByEmail(email: string): Promise<ApiResponse<User>> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      return { success: true, data: user };
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return { success: false, error: 'Failed to fetch user' };
    }
  }

  /**
   * Create a new user with full type safety
   */
  async createUser(userData: NewUser): Promise<ApiResponse<User>> {
    try {
      const [newUser] = await db.insert(users).values(userData).returning();
      return { success: true, data: newUser };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: 'Failed to create user' };
    }
  }

  /**
   * Update user with type safety
   */
  async updateUser(id: string, userData: Partial<NewUser>): Promise<ApiResponse<User>> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({ ...userData, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) {
        return { success: false, error: 'User not found' };
      }

      // If role was updated, sync to custom claims
      if (userData.role) {
        await this.syncRoleToCustomClaims(updatedUser.id, updatedUser.role);
      }

      return { success: true, data: updatedUser };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: 'Failed to update user' };
    }
  }

  /**
   * Delete user from both database and authentication
   */
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    try {
      // Delete from database using Drizzle
      const [deletedUser] = await db.delete(users).where(eq(users.id, id)).returning();

      if (!deletedUser) {
        return { success: false, error: 'User not found' };
      }

      // Delete from Supabase auth using admin client
      const adminClient = createAdminClient();
      const { error: authError } = await adminClient.auth.admin.deleteUser(id);

      if (authError) {
        console.error('Error deleting user from auth:', authError);
        return { 
          success: false, 
          error: `User deleted from database but failed to delete from authentication: ${authError.message}` 
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteUser:', error);
      return { success: false, error: 'Failed to delete user' };
    }
  }

  /**
   * Initialize custom claims for all existing users
   * This should be run once after implementing RBAC
   */
  async initializeCustomClaims(): Promise<ApiResponse<{ synced: number }>> {
    try {
      // Get all users from the database using Drizzle
      const allUsers = await db.select({ id: users.id, role: users.role }).from(users);

      let syncedCount = 0;
      
      // Sync each user's role to custom claims
      for (const user of allUsers) {
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

  /**
   * Sync user role to JWT custom claims
   */
  private async syncRoleToCustomClaims(userId: string, role: string): Promise<void> {
    try {
      const adminClient = createAdminClient();
      
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
}

export const drizzleUserService = new DrizzleUserService();
