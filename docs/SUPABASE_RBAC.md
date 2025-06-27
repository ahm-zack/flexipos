# Supabase Custom Claims RBAC Implementation

## Overview

We have now implemented the **official Supabase recommended approach** for Role-Based Access Control (RBAC) using custom claims and Row Level Security (RLS).

## 🔄 **What Changed**

### Before (Insecure):

- ❌ Roles only in database table
- ❌ Every permission check required database query
- ❌ RLS policies were completely open (`USING (true)`)
- ❌ No JWT-based role validation

### After (Secure + Supabase Recommended):

- ✅ **Custom Claims in JWT** - Roles embedded in authentication token
- ✅ **Proper RLS Policies** - Database-level access control
- ✅ **Database Functions** - Server-side role validation
- ✅ **Automatic Sync** - Triggers keep JWT and database in sync

## 🛡️ **Security Implementation**

### 1. Custom Claims in JWT

```typescript
// Role is now stored in JWT custom claims
const userRole = authUser.app_metadata?.user_role as AppRole;
```

### 2. Database Functions

```sql
-- Check if user has required role or higher
CREATE FUNCTION has_role_or_higher(required_role TEXT) RETURNS BOOLEAN

-- Get current user's role from JWT
CREATE FUNCTION get_current_user_role() RETURNS TEXT

-- Sync role to JWT claims
CREATE FUNCTION set_user_role_claim(user_id UUID, role TEXT)
```

### 3. Proper RLS Policies

```sql
-- Only admins+ can view all users, others see only themselves
CREATE POLICY "Role-based user viewing" ON users
  FOR SELECT USING (has_role_or_higher('admin') OR auth.uid() = id);

-- Only super admins can create users
CREATE POLICY "Only super admins can create users" ON users
  FOR INSERT WITH CHECK (has_role_or_higher('superadmin'));

-- Role-based updates (super admins can update anyone)
CREATE POLICY "Role-based user updates" ON users
  FOR UPDATE USING (has_role_or_higher('superadmin') OR
                   (auth.uid() = id AND OLD.role = NEW.role));

-- Only super admins can delete users
CREATE POLICY "Only super admins can delete users" ON users
  FOR DELETE USING (has_role_or_higher('superadmin'));
```

### 4. Automatic Role Sync

```sql
-- Trigger syncs role changes to JWT claims
CREATE TRIGGER sync_user_role_trigger
  AFTER INSERT OR UPDATE OF role ON users
  FOR EACH ROW EXECUTE FUNCTION sync_user_role_to_auth();
```

## 🔧 **Role Hierarchy**

```json
{
  "cashier": 1,
  "kitchen": 1,
  "manager": 2,
  "admin": 3,
  "superadmin": 4
}
```

Higher numbers = more permissions. A user with role "admin" (3) can access anything requiring "manager" (2) or below.

## ✅ **Benefits of This Approach**

1. **Performance**: No database queries for role checks - everything in JWT
2. **Security**: Database-level access control via RLS
3. **Scalability**: JWT claims cached and don't expire until token refresh
4. **Supabase Standard**: Follows official Supabase documentation
5. **Offline Capable**: Role information available even without database connection

## 🔄 **How It Works**

1. **User Creation**:

   - User added to `users` table with role
   - Trigger automatically syncs role to `auth.users.raw_app_meta_data`
   - Next JWT includes role in custom claims

2. **Permission Check**:

   - Extract role from JWT claims (no database query needed)
   - Compare against required role using hierarchy
   - Database RLS policies enforce access at data level

3. **Role Updates**:
   - Update role in `users` table
   - Trigger syncs to JWT claims
   - User gets new permissions on next token refresh

## 🚀 **Migration Steps**

To apply this to your project:

1. **Run Migration**:

   ```bash
   supabase db push
   ```

2. **Existing Users**: The migration automatically syncs existing user roles to JWT claims

3. **Token Refresh**: Existing users need to refresh their tokens to get new claims (handled automatically on next login)

## 🔍 **Testing RBAC**

Test the security by:

1. Creating users with different roles
2. Trying to access admin functions as non-admin
3. Checking database policies via direct SQL queries
4. Verifying JWT tokens contain role claims

## 📚 **References**

- [Supabase Custom Claims Guide](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
