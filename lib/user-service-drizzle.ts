import { db, users, User, NewUser } from '@/lib/db';
import { createAdminClient } from '@/utils/supabase/admin';
import { eq } from 'drizzle-orm';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Sync user role to JWT custom claims with retry logic
 */
async function syncRoleToCustomClaims(userId: string, role: string): Promise<void> {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const adminClient = createAdminClient();
      
      const { error } = await adminClient.auth.admin.updateUserById(userId, {
        app_metadata: {
          user_role: role,
          role_synced_at: new Date().toISOString()
        }
      });

      if (error) {
        lastError = error;
        console.error(`Attempt ${attempt}: Error syncing role to custom claims:`, error);
        
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          continue;
        }
        throw error;
      }

      console.log(`✅ Successfully synced role '${role}' to custom claims for user ${userId} (attempt ${attempt})`);
      return;
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt}: Failed to sync role to custom claims:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // Log the final failure but don't throw - we don't want to break user operations
  console.error(`❌ CRITICAL: Failed to sync role to custom claims after ${maxRetries} attempts for user ${userId}:`, lastError);
  
  // In production, you might want to add this to a retry queue or send an alert
  // For now, we'll just log it as a critical error
}

/**
 * Get all users with type safety
 */
export async function getUsers(): Promise<ApiResponse<User[]>> {
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
export async function getUserById(id: string): Promise<ApiResponse<User>> {
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
export async function getUserByEmail(email: string): Promise<ApiResponse<User>> {
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
export async function createUser(userData: NewUser): Promise<ApiResponse<User>> {
  try {
    const [newUser] = await db.insert(users).values(userData).returning();
    
    // IMPORTANT: Always sync role to custom claims when creating a user
    if (newUser && newUser.role) {
      await syncRoleToCustomClaims(newUser.id, newUser.role);
    }
    
    return { success: true, data: newUser };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

/**
 * Update user with type safety
 */
export async function updateUser(id: string, userData: Partial<NewUser>): Promise<ApiResponse<User>> {
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
      await syncRoleToCustomClaims(updatedUser.id, updatedUser.role);
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
export async function deleteUser(id: string): Promise<ApiResponse<void>> {
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
export async function initializeCustomClaims(): Promise<ApiResponse<{ synced: number }>> {
  try {
    // Get all users from the database using Drizzle
    const allUsers = await db.select({ id: users.id, role: users.role }).from(users);

    let syncedCount = 0;
    
    // Sync each user's role to custom claims
    for (const user of allUsers) {
      try {
        await syncRoleToCustomClaims(user.id, user.role);
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
