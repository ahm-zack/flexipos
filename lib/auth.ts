import { createClient } from '@/utils/supabase/server';
import { AppRole } from '@/lib/schemas';
import { getUserByEmail } from '@/lib/user-service-drizzle';

export interface AuthUser {
  id: string;
  email: string;
  role: AppRole;
}

/**
 * Get the current authenticated user with their role from JWT custom claims
 * This follows Supabase's recommended RBAC approach using custom claims
 */
export async function getCurrentUser(): Promise<{ user: AuthUser | null; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return { user: null, error: 'Not authenticated' };
    }

    // Get role from JWT custom claims (Supabase recommended approach)
    const userRole = authUser.app_metadata?.user_role as AppRole;
    
    if (!userRole) {
      // AUTO-FIX: If no custom claim exists, try to sync from database
      console.warn('⚠️ User has no role in custom claims, attempting auto-sync:', authUser.id);
      
      try {
        // Get user role from database
        const userResult = await getUserByEmail(authUser.email || '');
        
        if (userResult.success && userResult.data?.role) {
          // CRITICAL: Directly sync to Supabase Auth admin API
          console.log('🔄 Auto-syncing role to custom claims...');
          
          const { createAdminClient } = await import('@/utils/supabase/admin');
          const adminClient = createAdminClient();
          
          const { error: syncError } = await adminClient.auth.admin.updateUserById(authUser.id, {
            app_metadata: {
              user_role: userResult.data.role,
              role_synced_at: new Date().toISOString()
            }
          });

          if (syncError) {
            console.error('❌ Failed to sync role to JWT:', syncError);
            throw syncError;
          }
          
          console.log('✅ Role synced successfully to JWT. User needs to refresh session.');
          
          // Return the user with the role from database
          // Note: The JWT will have the updated role after refresh/re-authentication
          return {
            user: {
              id: authUser.id,
              email: authUser.email || '',
              role: userResult.data.role,
            }
          };
        }
      } catch (syncError) {
        console.error('❌ Failed to auto-sync user role:', syncError);
      }
      
      // If auto-sync fails, return error
      return { user: null, error: 'User role not found in JWT claims. Please log out and log back in.' };
    }

    return {
      user: {
        id: authUser.id,
        email: authUser.email || '',
        role: userRole,
      }
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return { user: null, error: 'Failed to verify user' };
  }
}

/**
 * Check if current user has required role or higher
 */
export async function requireRole(requiredRole: AppRole): Promise<{ authorized: boolean; user?: AuthUser; error?: string }> {
  const { user, error } = await getCurrentUser();

  if (error || !user) {
    return { authorized: false, error: error || 'Not authenticated' };
  }

  // Define role hierarchy
  const roleHierarchy: Record<AppRole, number> = {
    'cashier': 1,
    'kitchen': 1,
    'manager': 2,
    'admin': 3,
    'superadmin': 4,
  };

  const userLevel = roleHierarchy[user.role];
  const requiredLevel = roleHierarchy[requiredRole];

  if (userLevel < requiredLevel) {
    return { 
      authorized: false, 
      user, 
      error: `Insufficient permissions. Required: ${requiredRole}, Current: ${user.role}` 
    };
  }

  return { authorized: true, user };
}

/**
 * Check if current user is super admin
 */
export async function requireSuperAdmin(): Promise<{ authorized: boolean; user?: AuthUser; error?: string }> {
  return requireRole('superadmin');
}

/**
 * Check if current user is admin or higher
 */
export async function requireAdmin(): Promise<{ authorized: boolean; user?: AuthUser; error?: string }> {
  return requireRole('admin');
}
