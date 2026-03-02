/**
 * User Service — Supabase-native replacement for the former Drizzle-based
 * user-service-drizzle.ts. Exports the same public API and camelCase types
 * so all existing callers continue to work without changes.
 */
import { createAdminClient } from '@/utils/supabase/admin';

// ================================
// SHARED TYPES
// ================================

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

export type UserRole = 'superadmin' | 'admin' | 'manager' | 'staff';

export interface User {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    phone: string | null;
    role: string | null;
    isActive: boolean | null;
    metadata: unknown;
    createdAt: string;
    updatedAt: string;
}

export type NewUser = Partial<User>;

export interface BusinessUser {
    id: string;
    businessId: string;
    userId: string;
    role: string;
    permissions: unknown;
    isActive: boolean | null;
    invitedAt: string | null;
    joinedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface BusinessUserWithDetails extends BusinessUser {
    user: User;
}

// ================================
// MAPPING HELPERS (snake_case → camelCase)
// ================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUser(row: Record<string, any>): User {
    return {
        id: row.id,
        email: row.email,
        fullName: row.full_name ?? null,
        avatarUrl: row.avatar_url ?? null,
        phone: row.phone ?? null,
        role: row.role ?? null,
        isActive: row.is_active ?? null,
        metadata: row.metadata ?? {},
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBusinessUser(row: Record<string, any>): BusinessUser {
    return {
        id: row.id,
        businessId: row.business_id,
        userId: row.user_id,
        role: row.role,
        permissions: row.permissions ?? {},
        isActive: row.is_active ?? null,
        invitedAt: row.invited_at ?? null,
        joinedAt: row.joined_at ?? null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

// ================================
// INTERNAL HELPERS
// ================================

async function syncRoleToCustomClaims(userId: string, role: string): Promise<void> {
    const maxRetries = 3;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const adminClient = createAdminClient();
            const { error } = await adminClient.auth.admin.updateUserById(userId, {
                app_metadata: {
                    user_role: role,
                    role_synced_at: new Date().toISOString(),
                },
            });

            if (error) {
                lastError = error;
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                    continue;
                }
                throw error;
            }

            console.log(`✅ Synced role '${role}' to custom claims for user ${userId} (attempt ${attempt})`);
            return;
        } catch (error) {
            lastError = error;
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    console.error(`❌ Failed to sync role to custom claims after ${maxRetries} attempts for user ${userId}:`, lastError);
}

// ================================
// USERS CRUD
// ================================

export async function getUsers(): Promise<ApiResponse<User[]>> {
    try {
        const adminClient = createAdminClient();
        const { data, error } = await adminClient.from('users').select('*').order('created_at');
        if (error) throw error;
        return { success: true, data: (data ?? []).map(mapUser) };
    } catch (error) {
        console.error('Error fetching users:', error);
        return { success: false, error: 'Failed to fetch users' };
    }
}

export async function getUserById(id: string): Promise<ApiResponse<User>> {
    try {
        const adminClient = createAdminClient();
        const { data, error } = await adminClient.from('users').select('*').eq('id', id).single();
        if (error || !data) return { success: false, error: 'User not found' };
        return { success: true, data: mapUser(data) };
    } catch (error) {
        console.error('Error fetching user:', error);
        return { success: false, error: 'Failed to fetch user' };
    }
}

export async function getUserByEmail(email: string): Promise<ApiResponse<User>> {
    try {
        const adminClient = createAdminClient();
        const { data, error } = await adminClient.from('users').select('*').eq('email', email).maybeSingle();
        if (error) throw error;
        if (!data) return { success: false, error: 'User not found' };
        return { success: true, data: mapUser(data) };
    } catch (error) {
        console.error('Error fetching user by email:', error);
        return { success: false, error: 'Failed to fetch user' };
    }
}

export async function createUser(userData: NewUser & { id?: string; email: string }): Promise<ApiResponse<User>> {
    try {
        const adminClient = createAdminClient();

        if (userData.id) {
            const { data: existing } = await adminClient.from('users').select('id').eq('id', userData.id).maybeSingle();
            if (existing) {
                const { data, error } = await adminClient
                    .from('users')
                    .update({
                        email: userData.email,
                        full_name: userData.fullName,
                        avatar_url: userData.avatarUrl,
                        phone: userData.phone,
                        role: userData.role,
                        is_active: userData.isActive,
                        metadata: userData.metadata,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', userData.id)
                    .select()
                    .single();
                if (error || !data) throw error;
                const user = mapUser(data);
                if (user.role) await syncRoleToCustomClaims(user.id, user.role);
                return { success: true, data: user };
            }
        }

        const { data, error } = await adminClient
            .from('users')
            .insert({
                id: userData.id,
                email: userData.email,
                full_name: userData.fullName,
                avatar_url: userData.avatarUrl,
                phone: userData.phone,
                role: userData.role,
                is_active: userData.isActive ?? true,
                metadata: userData.metadata ?? {},
            })
            .select()
            .single();
        if (error || !data) throw error;
        const user = mapUser(data);
        if (user.role) await syncRoleToCustomClaims(user.id, user.role);
        return { success: true, data: user };
    } catch (error) {
        console.error('Error creating user:', error);
        return { success: false, error: 'Failed to create user' };
    }
}

export async function updateUser(id: string, userData: Partial<NewUser>): Promise<ApiResponse<User>> {
    try {
        const adminClient = createAdminClient();
        const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (userData.email !== undefined) updateData.email = userData.email;
        if (userData.fullName !== undefined) updateData.full_name = userData.fullName;
        if (userData.avatarUrl !== undefined) updateData.avatar_url = userData.avatarUrl;
        if (userData.phone !== undefined) updateData.phone = userData.phone;
        if (userData.role !== undefined) updateData.role = userData.role;
        if (userData.isActive !== undefined) updateData.is_active = userData.isActive;
        if (userData.metadata !== undefined) updateData.metadata = userData.metadata;

        const { data, error } = await adminClient.from('users').update(updateData).eq('id', id).select().single();
        if (error || !data) return { success: false, error: 'User not found' };
        const user = mapUser(data);
        if (userData.role && user.role) await syncRoleToCustomClaims(user.id, user.role);
        return { success: true, data: user };
    } catch (error) {
        console.error('Error updating user:', error);
        return { success: false, error: 'Failed to update user' };
    }
}

export async function deleteUser(id: string): Promise<ApiResponse<void>> {
    try {
        const adminClient = createAdminClient();
        const { data, error } = await adminClient.from('users').delete().eq('id', id).select().single();
        if (error || !data) return { success: false, error: 'User not found' };

        const { error: authError } = await adminClient.auth.admin.deleteUser(id);
        if (authError) {
            console.error('Error deleting user from auth:', authError);
            return {
                success: false,
                error: `User deleted from database but failed to delete from authentication: ${authError.message}`,
            };
        }
        return { success: true };
    } catch (error) {
        console.error('Error in deleteUser:', error);
        return { success: false, error: 'Failed to delete user' };
    }
}

export async function initializeCustomClaims(): Promise<ApiResponse<{ synced: number }>> {
    try {
        const adminClient = createAdminClient();
        const { data: allUsers, error } = await adminClient.from('users').select('id, role');
        if (error) throw error;
        let syncedCount = 0;
        for (const user of allUsers ?? []) {
            try {
                if (user.role) await syncRoleToCustomClaims(user.id, user.role);
                syncedCount++;
            } catch (err) {
                console.error(`Failed to sync user ${user.id}:`, err);
            }
        }
        return { success: true, data: { synced: syncedCount } };
    } catch (error) {
        console.error('Error initializing custom claims:', error);
        return { success: false, error: 'Failed to initialize custom claims' };
    }
}

// ================================
// BUSINESS USERS CRUD (Multi-tenant)
// ================================

export async function getBusinessUsers(businessId: string): Promise<ApiResponse<BusinessUserWithDetails[]>> {
    try {
        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from('business_users')
            .select('*, user:users(*)')
            .eq('business_id', businessId)
            .order('created_at');
        if (error) throw error;
        const result: BusinessUserWithDetails[] = (data ?? []).map(row => ({
            ...mapBusinessUser(row),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            user: mapUser(row.user as Record<string, any>),
        }));
        return { success: true, data: result };
    } catch (error) {
        console.error('Error fetching business users:', error);
        return { success: false, error: 'Failed to fetch business users' };
    }
}

export async function getBusinessUserById(id: string): Promise<ApiResponse<BusinessUserWithDetails>> {
    try {
        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from('business_users')
            .select('*, user:users(*)')
            .eq('id', id)
            .single();
        if (error || !data) return { success: false, error: 'Business user not found' };
        return {
            success: true,
            data: {
                ...mapBusinessUser(data),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                user: mapUser(data.user as Record<string, any>),
            },
        };
    } catch (error) {
        console.error('Error fetching business user:', error);
        return { success: false, error: 'Failed to fetch business user' };
    }
}

export async function getBusinessUserByUserId(
    userId: string,
    businessId: string,
): Promise<ApiResponse<BusinessUserWithDetails>> {
    try {
        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from('business_users')
            .select('*, user:users(*)')
            .eq('user_id', userId)
            .eq('business_id', businessId)
            .single();
        if (error || !data) return { success: false, error: 'Business user not found' };
        return {
            success: true,
            data: {
                ...mapBusinessUser(data),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                user: mapUser(data.user as Record<string, any>),
            },
        };
    } catch (error) {
        console.error('Error fetching business user by user ID:', error);
        return { success: false, error: 'Failed to fetch business user' };
    }
}

export async function createBusinessUser(
    businessId: string,
    userData: {
        email: string;
        fullName?: string;
        password: string;
        role: string;
        permissions?: Record<string, unknown>;
    },
): Promise<ApiResponse<BusinessUserWithDetails>> {
    const adminClient = createAdminClient();

    try {
        // Check if user already exists in database
        const { data: existingUser } = await adminClient
            .from('users')
            .select('id')
            .eq('email', userData.email)
            .maybeSingle();

        if (existingUser) {
            const { data: existingBU } = await adminClient
                .from('business_users')
                .select('id')
                .eq('user_id', existingUser.id)
                .eq('business_id', businessId)   // scope to THIS business only
                .maybeSingle();

            if (existingBU) {
                return { success: false, error: `User with email ${userData.email} already exists in this business` };
            }

            // Orphaned user — clean up before recreating
            console.log('🧹 Orphaned user detected, cleaning up:', existingUser.id);
            await adminClient.from('users').delete().eq('id', existingUser.id);
            try { await adminClient.auth.admin.deleteUser(existingUser.id); } catch { /* may not exist in auth */ }
        }

        // Create auth user (with orphaned-auth recovery)
        let authData: { user: { id: string } } | null = null;
        let createAttempt = 0;
        const maxAttempts = 2;

        while (createAttempt < maxAttempts) {
            createAttempt++;
            const { data: authResult, error: authError } = await adminClient.auth.admin.createUser({
                email: userData.email,
                password: userData.password,
                email_confirm: true,
                app_metadata: { user_role: userData.role },
            });

            if (!authError) {
                authData = authResult;
                break;
            }

            if (
                createAttempt === 1 &&
                (authError.message?.includes('Database error') || authError.message?.includes('already exists'))
            ) {
                const { data: listData } = await adminClient.auth.admin.listUsers();
                const orphaned = listData?.users?.find(u => u.email?.toLowerCase() === userData.email.toLowerCase());
                if (orphaned) {
                    const { data: inDb } = await adminClient.from('users').select('id').eq('id', orphaned.id).maybeSingle();
                    if (!inDb) {
                        console.log('🧹 Orphaned auth user found, deleting:', orphaned.id);
                        await adminClient.auth.admin.deleteUser(orphaned.id);
                        continue; // retry
                    }
                }
            }

            return { success: false, error: `Failed to create authentication user: ${authError.message}` };
        }

        if (!authData) return { success: false, error: 'Failed to create authentication user after cleanup attempts' };

        const userId = authData.user.id;
        let insertedUser: Record<string, unknown> | null = null;

        try {
            // Use upsert: the on_auth_user_created trigger may have already inserted
            // this row by the time we get here, so INSERT ... ON CONFLICT is needed.
            const { data: newUser, error: userErr } = await adminClient
                .from('users')
                .upsert(
                    { id: userId, email: userData.email, full_name: userData.fullName ?? null, role: 'staff', is_active: true },
                    { onConflict: 'id' }
                )
                .select()
                .single();
            if (userErr || !newUser) throw userErr;
            insertedUser = newUser;

            const { data: businessUser, error: buErr } = await adminClient
                .from('business_users')
                .insert({
                    business_id: businessId,
                    user_id: userId,
                    role: userData.role,
                    permissions: userData.permissions ?? {},
                    is_active: true,
                    joined_at: new Date().toISOString(),
                })
                .select()
                .single();
            if (buErr || !businessUser) throw buErr;

            await syncRoleToCustomClaims(userId, userData.role);

            return {
                success: true,
                data: {
                    ...mapBusinessUser(businessUser),
                    user: mapUser(insertedUser!),
                },
            };
        } catch (dbError) {
            // Rollback — delete auth first; the FK CASCADE will clean public.users automatically.
            // We also attempt the explicit public.users delete as a safety net for DBs without the cascade.
            console.error('❌ DB error during user creation, rolling back:', dbError);
            try {
                await adminClient.auth.admin.deleteUser(userId);
            } catch (authRollbackErr) {
                console.error('⚠️ Failed to rollback auth user:', authRollbackErr);
            }
            try {
                // Safety net: explicit delete in case cascade is not yet applied in this environment
                await adminClient.from('users').delete().eq('id', userId);
            } catch (dbRollbackErr) {
                console.error('⚠️ Failed to rollback public.users row:', dbRollbackErr);
            }
            throw dbError;
        }
    } catch (error) {
        console.error('❌ Error creating business user:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create business user' };
    }
}

export async function updateBusinessUser(
    id: string,
    data: { role?: string; permissions?: Record<string, unknown>; isActive?: boolean },
): Promise<ApiResponse<BusinessUserWithDetails>> {
    try {
        const adminClient = createAdminClient();
        const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (data.role !== undefined) updateData.role = data.role;
        if (data.permissions !== undefined) updateData.permissions = data.permissions;
        if (data.isActive !== undefined) updateData.is_active = data.isActive;

        const { data: updated, error } = await adminClient
            .from('business_users')
            .update(updateData)
            .eq('id', id)
            .select('user_id')
            .single();
        if (error || !updated) return { success: false, error: 'Business user not found' };

        if (data.role) await syncRoleToCustomClaims(updated.user_id, data.role);
        return getBusinessUserById(id);
    } catch (error) {
        console.error('Error updating business user:', error);
        return { success: false, error: 'Failed to update business user' };
    }
}

export async function updateUserProfile(
    userId: string,
    data: { fullName?: string; phone?: string; avatarUrl?: string },
): Promise<ApiResponse<User>> {
    try {
        const adminClient = createAdminClient();
        const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (data.fullName !== undefined) updateData.full_name = data.fullName;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;

        const { data: updated, error } = await adminClient.from('users').update(updateData).eq('id', userId).select().single();
        if (error || !updated) return { success: false, error: 'User not found' };
        return { success: true, data: mapUser(updated) };
    } catch (error) {
        console.error('Error updating user profile:', error);
        return { success: false, error: 'Failed to update user profile' };
    }
}

export async function deleteBusinessUser(
    id: string,
    options?: { deleteUserCompletely?: boolean },
): Promise<ApiResponse<void>> {
    try {
        const businessUserResult = await getBusinessUserById(id);
        if (!businessUserResult.success || !businessUserResult.data) {
            return { success: false, error: 'Business user not found' };
        }
        const userId = businessUserResult.data.userId;

        const adminClient = createAdminClient();
        const { error } = await adminClient.from('business_users').delete().eq('id', id);
        if (error) return { success: false, error: 'Failed to delete business user' };

        if (options?.deleteUserCompletely) {
            const { data: others } = await adminClient.from('business_users').select('id').eq('user_id', userId);
            if (!others || others.length === 0) {
                await adminClient.from('users').delete().eq('id', userId);
                const { error: authError } = await adminClient.auth.admin.deleteUser(userId);
                if (authError) {
                    return {
                        success: false,
                        error: `Business user removed but failed to delete from authentication: ${authError.message}`,
                    };
                }
            } else {
                console.log(`User ${userId} still belongs to ${others.length} other business(es), not deleting user record`);
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting business user:', error);
        return { success: false, error: 'Failed to delete business user' };
    }
}

export async function getCurrentUserBusinessId(userId: string): Promise<ApiResponse<string>> {
    try {
        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from('business_users')
            .select('business_id')
            .eq('user_id', userId)
            .limit(1)
            .single();
        if (error || !data) return { success: false, error: 'User is not associated with any business' };
        return { success: true, data: data.business_id };
    } catch (error) {
        console.error('Error getting user business:', error);
        return { success: false, error: 'Failed to get user business' };
    }
}
