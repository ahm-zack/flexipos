import { db, users, User, NewUser, businessUsers, BusinessUser } from '@/lib/db';
import { createAdminClient } from '@/utils/supabase/admin';
import { eq, and } from 'drizzle-orm';

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
    // Check if user already exists in database
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userData.id!)
    });

    if (existingUser) {
      console.log('User already exists in database:', userData.id);
      // Update the existing user instead
      const [updatedUser] = await db
        .update(users)
        .set({
          ...userData,
          updatedAt: new Date()
        })
        .where(eq(users.id, userData.id!))
        .returning();

      // Sync role to custom claims
      if (updatedUser && updatedUser.role) {
        await syncRoleToCustomClaims(updatedUser.id, updatedUser.role);
      }

      return { success: true, data: updatedUser };
    }

    // Insert new user
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
    if (userData.role && updatedUser.role) {
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
        if (user.role) {
          await syncRoleToCustomClaims(user.id, user.role);
        }
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

// ================================
// BUSINESS USERS CRUD (SaaS Multi-tenant)
// ================================

/**
 * Extended business user with user details
 */
export interface BusinessUserWithDetails extends BusinessUser {
  user: User;
}

/**
 * Get all business users with user details (for SaaS)
 */
export async function getBusinessUsers(businessId: string): Promise<ApiResponse<BusinessUserWithDetails[]>> {
  try {
    const result = await db
      .select({
        // BusinessUser fields
        id: businessUsers.id,
        businessId: businessUsers.businessId,
        userId: businessUsers.userId,
        role: businessUsers.role,
        permissions: businessUsers.permissions,
        isActive: businessUsers.isActive,
        invitedAt: businessUsers.invitedAt,
        joinedAt: businessUsers.joinedAt,
        createdAt: businessUsers.createdAt,
        updatedAt: businessUsers.updatedAt,
        // User fields (nested)
        user: {
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          avatarUrl: users.avatarUrl,
          phone: users.phone,
          role: users.role,
          isActive: users.isActive,
          metadata: users.metadata,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        }
      })
      .from(businessUsers)
      .innerJoin(users, eq(businessUsers.userId, users.id))
      .where(eq(businessUsers.businessId, businessId))
      .orderBy(businessUsers.createdAt);

    return { success: true, data: result as BusinessUserWithDetails[] };
  } catch (error) {
    console.error('Error fetching business users:', error);
    return { success: false, error: 'Failed to fetch business users' };
  }
}

/**
 * Get business user by ID with user details
 */
export async function getBusinessUserById(id: string): Promise<ApiResponse<BusinessUserWithDetails>> {
  try {
    const [result] = await db
      .select({
        // BusinessUser fields
        id: businessUsers.id,
        businessId: businessUsers.businessId,
        userId: businessUsers.userId,
        role: businessUsers.role,
        permissions: businessUsers.permissions,
        isActive: businessUsers.isActive,
        invitedAt: businessUsers.invitedAt,
        joinedAt: businessUsers.joinedAt,
        createdAt: businessUsers.createdAt,
        updatedAt: businessUsers.updatedAt,
        // User fields (nested)
        user: {
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          avatarUrl: users.avatarUrl,
          phone: users.phone,
          role: users.role,
          isActive: users.isActive,
          metadata: users.metadata,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        }
      })
      .from(businessUsers)
      .innerJoin(users, eq(businessUsers.userId, users.id))
      .where(eq(businessUsers.id, id));

    if (!result) {
      return { success: false, error: 'Business user not found' };
    }

    return { success: true, data: result as BusinessUserWithDetails };
  } catch (error) {
    console.error('Error fetching business user:', error);
    return { success: false, error: 'Failed to fetch business user' };
  }
}

/**
 * Get business user by user ID and business ID
 */
export async function getBusinessUserByUserId(
  userId: string,
  businessId: string
): Promise<ApiResponse<BusinessUserWithDetails>> {
  try {
    const [result] = await db
      .select({
        // BusinessUser fields
        id: businessUsers.id,
        businessId: businessUsers.businessId,
        userId: businessUsers.userId,
        role: businessUsers.role,
        permissions: businessUsers.permissions,
        isActive: businessUsers.isActive,
        invitedAt: businessUsers.invitedAt,
        joinedAt: businessUsers.joinedAt,
        createdAt: businessUsers.createdAt,
        updatedAt: businessUsers.updatedAt,
        // User fields (nested)
        user: {
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          avatarUrl: users.avatarUrl,
          phone: users.phone,
          role: users.role,
          isActive: users.isActive,
          metadata: users.metadata,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        }
      })
      .from(businessUsers)
      .innerJoin(users, eq(businessUsers.userId, users.id))
      .where(
        and(
          eq(businessUsers.userId, userId),
          eq(businessUsers.businessId, businessId)
        )
      );

    if (!result) {
      return { success: false, error: 'Business user not found' };
    }

    return { success: true, data: result as BusinessUserWithDetails };
  } catch (error) {
    console.error('Error fetching business user by user ID:', error);
    return { success: false, error: 'Failed to fetch business user' };
  }
}

/**
 * Create a new business user (assign user to business)
 * This creates both the user in users table and the business relationship
 */
export async function createBusinessUser(
  businessId: string,
  userData: {
    email: string;
    fullName?: string;
    password: string;
    role: string;
    permissions?: Record<string, unknown>;
  }
): Promise<ApiResponse<BusinessUserWithDetails>> {
  try {
    console.log('🔵 Step 0: Checking if user already exists:', userData.email);

    // Check if user already exists in our database
    const existingUser = await db.select().from(users).where(eq(users.email, userData.email)).limit(1);
    if (existingUser.length > 0) {
      console.log('⚠️  User already exists in users table with ID:', existingUser[0].id);

      // Check if they have a business relationship
      const existingBusinessUser = await db
        .select()
        .from(businessUsers)
        .where(eq(businessUsers.userId, existingUser[0].id))
        .limit(1);

      if (existingBusinessUser.length > 0) {
        return {
          success: false,
          error: `User with email ${userData.email} already exists in this business`
        };
      } else {
        // Auto-cleanup orphaned user
        console.log('🧹 User is orphaned (no business relationship). Auto-cleaning up...');
        const orphanedUserId = existingUser[0].id;

        try {
          // Delete from users table
          await db.delete(users).where(eq(users.id, orphanedUserId));
          console.log('✅ Deleted orphaned user from users table');

          // Try to delete from auth (might not exist)
          const adminClient = createAdminClient();
          try {
            await adminClient.auth.admin.deleteUser(orphanedUserId);
            console.log('✅ Deleted orphaned user from Supabase Auth');
          } catch {
            console.log('ℹ️  Orphaned user not found in auth (already cleaned or never created)');
          }

          console.log('✅ Orphaned user cleanup complete. Proceeding with user creation...');
        } catch (cleanupError) {
          console.error('❌ Failed to clean up orphaned user:', cleanupError);
          return {
            success: false,
            error: `Failed to clean up orphaned user. Please contact support.`
          };
        }
      }
    }

    console.log('🔵 Step 1: Creating auth user for:', userData.email);
    // Step 1: Create auth user with auto-recovery for orphaned users
    const adminClient = createAdminClient();

    let authData;
    let createAttempt = 0;
    const maxAttempts = 2;

    while (createAttempt < maxAttempts) {
      createAttempt++;

      const { data: authResult, error: authError } = await adminClient.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        app_metadata: {
          user_role: userData.role
        }
      });

      if (!authError) {
        authData = authResult;
        break;
      }

      // If auth creation failed and this was our first attempt, try to clean up orphaned auth user
      if (createAttempt === 1 && (authError.message?.includes('Database error') || authError.message?.includes('already exists'))) {
        console.log('⚠️  Auth creation failed, likely orphaned auth user. Attempting cleanup...');

        try {
          // Try to find the auth user by email using listUsers with filter
          const { data: listData } = await adminClient.auth.admin.listUsers();
          const orphanedAuthUser = listData?.users?.find((u) => u.email?.toLowerCase() === userData.email.toLowerCase());

          if (orphanedAuthUser) {
            console.log('🧹 Found orphaned auth user with ID:', orphanedAuthUser.id);

            // Check if this auth user has a corresponding entry in our users table
            const correspondingUser = await db.select().from(users).where(eq(users.id, orphanedAuthUser.id)).limit(1);

            if (correspondingUser.length === 0) {
              console.log('🧹 Auth user is orphaned (no entry in users table). Deleting...');
              await adminClient.auth.admin.deleteUser(orphanedAuthUser.id);
              console.log('✅ Deleted orphaned auth user. Retrying creation...');
              // Loop will retry creation
            } else {
              console.log('❌ Auth user exists with valid database entry');
              return {
                success: false,
                error: `User with email ${userData.email} already exists in the system`
              };
            }
          } else {
            console.log('⚠️  Could not find orphaned auth user to clean up');
            return { success: false, error: `Failed to create authentication user: ${authError.message}` };
          }
        } catch (cleanupError) {
          console.error('❌ Failed during orphaned auth user cleanup:', cleanupError);
          return { success: false, error: `Failed to create authentication user: ${authError.message}` };
        }
      } else {
        console.error('❌ Error creating auth user:', authError);
        return { success: false, error: `Failed to create authentication user: ${authError.message}` };
      }
    }

    if (!authData) {
      return { success: false, error: 'Failed to create authentication user after cleanup attempts' };
    }

    const userId = authData.user.id;
    console.log('✅ Step 1 complete: Auth user created with ID:', userId);

    let newUser;
    try {
      console.log('🔵 Step 2: Creating user in users table');
      // Step 2: Create user in users table
      [newUser] = await db.insert(users).values({
        id: userId,
        email: userData.email,
        fullName: userData.fullName,
        role: 'user', // Global role is just 'user' for SaaS
        isActive: true,
      }).returning();
      console.log('✅ Step 2 complete: User created in users table');

      console.log('🔵 Step 3: Creating business_users relationship for business:', businessId);
      // Step 3: Create business_users relationship
      const [businessUser] = await db.insert(businessUsers).values({
        businessId,
        userId,
        role: userData.role, // Business-specific role
        permissions: userData.permissions || {},
        isActive: true,
        joinedAt: new Date(),
      }).returning();
      console.log('✅ Step 3 complete: Business user relationship created');

      console.log('🔵 Step 4: Syncing role to custom claims');
      // Step 4: Sync role to custom claims
      await syncRoleToCustomClaims(userId, userData.role);
      console.log('✅ Step 4 complete: Role synced to custom claims');

      console.log('✅ ALL STEPS COMPLETE: User successfully created');
      // Return with user details
      return {
        success: true,
        data: {
          ...businessUser,
          user: newUser
        } as BusinessUserWithDetails
      };
    } catch (dbError) {
      // Rollback: clean up all created records
      console.error('❌ Database error during user creation, rolling back all changes:', dbError);

      // Delete from users table if it was created
      if (newUser) {
        try {
          await db.delete(users).where(eq(users.id, userId));
          console.log('✅ Cleaned up user from users table');
        } catch (cleanupError) {
          console.error('❌ Failed to clean up user from users table:', cleanupError);
        }
      }

      // Delete auth user
      try {
        await adminClient.auth.admin.deleteUser(userId);
        console.log('✅ Cleaned up auth user');
      } catch (cleanupError) {
        console.error('❌ Failed to clean up auth user:', cleanupError);
      }

      throw dbError;
    }
  } catch (error) {
    console.error('❌ Error creating business user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create business user';
    return { success: false, error: errorMessage };
  }
}

/**
 * Update business user (update business-specific settings)
 */
export async function updateBusinessUser(
  id: string,
  data: {
    role?: string;
    permissions?: Record<string, unknown>;
    isActive?: boolean;
  }
): Promise<ApiResponse<BusinessUserWithDetails>> {
  try {
    // Update business_users record
    const [updatedBusinessUser] = await db
      .update(businessUsers)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(businessUsers.id, id))
      .returning();

    if (!updatedBusinessUser) {
      return { success: false, error: 'Business user not found' };
    }

    // If role was updated, sync to custom claims
    if (data.role) {
      await syncRoleToCustomClaims(updatedBusinessUser.userId, data.role);
    }

    // Fetch user details
    const result = await getBusinessUserById(id);
    return result;
  } catch (error) {
    console.error('Error updating business user:', error);
    return { success: false, error: 'Failed to update business user' };
  }
}

/**
 * Update user profile (update global user data)
 */
export async function updateUserProfile(
  userId: string,
  data: {
    fullName?: string;
    phone?: string;
    avatarUrl?: string;
  }
): Promise<ApiResponse<User>> {
  try {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return { success: false, error: 'User not found' };
    }

    return { success: true, data: updatedUser };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: 'Failed to update user profile' };
  }
}

/**
 * Delete business user (remove from business, optionally delete user entirely)
 */
export async function deleteBusinessUser(
  id: string,
  options?: { deleteUserCompletely?: boolean }
): Promise<ApiResponse<void>> {
  try {
    // Get business user first
    const businessUserResult = await getBusinessUserById(id);
    if (!businessUserResult.success || !businessUserResult.data) {
      return { success: false, error: 'Business user not found' };
    }

    const userId = businessUserResult.data.userId;

    // Delete from business_users table
    const [deletedBusinessUser] = await db
      .delete(businessUsers)
      .where(eq(businessUsers.id, id))
      .returning();

    if (!deletedBusinessUser) {
      return { success: false, error: 'Business user not found' };
    }

    // If requested, delete user completely from all tables and auth
    if (options?.deleteUserCompletely) {
      // Check if user belongs to other businesses
      const otherBusinesses = await db
        .select()
        .from(businessUsers)
        .where(eq(businessUsers.userId, userId));

      if (otherBusinesses.length === 0) {
        // User doesn't belong to any other business, safe to delete completely
        await db.delete(users).where(eq(users.id, userId));

        // Delete from auth
        const adminClient = createAdminClient();
        const { error: authError } = await adminClient.auth.admin.deleteUser(userId);

        if (authError) {
          console.error('Error deleting user from auth:', authError);
          return {
            success: false,
            error: `Business user removed but failed to delete from authentication: ${authError.message}`
          };
        }
      } else {
        console.log(`User ${userId} still belongs to ${otherBusinesses.length} other business(es), not deleting user record`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting business user:', error);
    return { success: false, error: 'Failed to delete business user' };
  }
}

/**
 * Get current user's business ID (for SaaS multi-tenancy)
 * Returns the first business the user belongs to
 */
export async function getCurrentUserBusinessId(userId: string): Promise<ApiResponse<string>> {
  try {
    const [businessUser] = await db
      .select()
      .from(businessUsers)
      .where(eq(businessUsers.userId, userId))
      .limit(1);

    if (!businessUser) {
      return { success: false, error: 'User is not associated with any business' };
    }

    return { success: true, data: businessUser.businessId };
  } catch (error) {
    console.error('Error getting user business:', error);
    return { success: false, error: 'Failed to get user business' };
  }
}
