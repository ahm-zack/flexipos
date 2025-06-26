# POS Dashboard - Project Structure & Files

## 📁 Project Organization

### 🗂️ Core Application Files

```
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with auth & navbar
│   ├── page.tsx                 # Homepage
│   ├── admin/users/             # User management pages
│   │   ├── page.tsx            # Users list page
│   │   ├── new/page.tsx        # Create user page
│   │   └── actions.ts          # Server actions for user CRUD
│   ├── auth/confirm/           # Email confirmation
│   ├── login/                  # Login page & actions
│   └── private/                # Protected route example
├── components/                  # Reusable UI components
│   ├── navbar.tsx              # Navigation bar with role-based visibility
│   ├── ui/                     # shadcn/ui components
│   └── admin/users/            # User management components
│       ├── create-user-form.tsx
│       └── users-table.tsx
├── lib/                        # Core business logic
│   ├── schemas.ts              # Zod validation schemas
│   ├── user-service.ts         # User CRUD operations
│   └── utils.ts                # Utility functions
└── utils/supabase/             # Supabase client configuration
    ├── client.ts               # Client-side Supabase
    ├── server.ts               # Server-side Supabase
    └── middleware.ts           # Auth middleware
```

### 🗄️ Database & Migration

```
supabase/
├── config.toml                 # Supabase local config
└── migrations/
    └── 001_create_users_table.sql  # Clean single migration
```

## 📋 Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'manager', 'cashier', 'kitchen')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Sample Data

- **superadmin@example.com** - Super Admin User (can see Users link)
- **admin@example.com** - Admin User
- **manager@example.com** - Manager User
- **cashier@example.com** - Cashier User
- **kitchen@example.com** - Kitchen User

## 🔒 Role-Based Access

### Navigation Visibility

- **Users Link**: Only visible to `superadmin` role
- Other navigation items: Visible to all authenticated users

### Role Hierarchy

1. **superadmin** - Full system access, can manage users
2. **admin** - Administrative functions
3. **manager** - Store management
4. **cashier** - Point-of-sale operations
5. **kitchen** - Kitchen/preparation tasks

## 🛠️ Development Commands

```bash
# Start local development
npm run dev                     # Next.js dev server
supabase start                  # Local Supabase instance
supabase db reset --local       # Reset database with migrations

# Build & Deploy
npm run build                   # Build production app
npm run start                   # Start production server

# Database Management
supabase status                 # Check Supabase status
supabase studio                 # Open database studio (localhost:54323)
```

## 🚀 Environment

### Local Development URLs

- **App**: http://localhost:3001
- **Supabase Studio**: http://127.0.0.1:54323
- **API**: http://127.0.0.1:54321

### Environment Variables (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon_key]"
SUPABASE_SERVICE_ROLE_KEY="[service_role_key]"
```

## ✅ Project Status

### ✨ Completed Features

- [x] Single users table with built-in roles
- [x] Clean, organized file structure
- [x] Role-based navbar visibility (superadmin only sees Users)
- [x] User CRUD operations (Create, Read, Update, Delete)
- [x] Proper error handling and validation
- [x] TypeScript build passing
- [x] Local Supabase development environment

### 🎯 Key Benefits

- **Simplified**: No complex RBAC system
- **Clean**: Single migration, organized files
- **Secure**: Role-based access control
- **Maintainable**: Clear separation of concerns
- **Type-safe**: Full TypeScript support

### 📂 Removed Files (Cleaned Up)

- ❌ `lib/schemas-simple.ts` (duplicate)
- ❌ `lib/user-service-simple.ts` (duplicate)
- ❌ `supabase/migrations/001_initial_schema.sql` (complex RBAC)
- ❌ `supabase/migrations/002_simple_users_table.sql` (redundant)
- ❌ Old backup files and test scripts

## 🎉 Ready for Production!

Your POS Dashboard is now clean, organized, and ready for deployment with a simplified user management system.
