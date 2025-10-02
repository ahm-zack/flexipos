# FlexiPOS Dynamic Login Information 🔐

## Database Setup Complete ✅

Your dynamic FlexiPOS database now has automatic user management with triggers that create user records whenever someone signs up through Supabase Auth.

## Admin Login Credentials

### Test Admin Account

- **Email**: `admin@flexipos.com`
- **Password**: `admin123`
- **Role**: `admin`
- **Full Name**: `FlexiPOS Admin`

## Database Connection Details

### Supabase Configuration

```
API URL:         http://127.0.0.1:54421
Database URL:    postgresql://postgres:postgres@127.0.0.1:54422/postgres
Studio URL:      http://127.0.0.1:54425
GraphQL URL:     http://127.0.0.1:54421/graphql/v1
Storage URL:     http://127.0.0.1:54421/storage/v1/s3

Publishable Key: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
Secret Key:      REDACTED_ROTATE_THIS_KEY
```

## User Management System 🔄

### Automatic User Creation

The database now includes:

1. **Users Table**: Stores additional user information beyond Supabase Auth
2. **Triggers**: Automatically create/update/delete user records when auth changes occur
3. **Row Level Security**: Users can only access their own data
4. **Admin Function**: Create admin users programmatically

### Database Tables Created:

- ✅ `users` - Extended user profiles with roles
- ✅ `businesses` - Business entities
- ✅ `business_users` - User-business relationships
- ✅ `categories` - Dynamic menu categories
- ✅ `menu_items` - Universal menu items
- ✅ `modifiers` - Item customization options

### Trigger Functions:

- ✅ `handle_new_user()` - Creates user record on signup
- ✅ `handle_user_update()` - Updates user record on profile changes
- ✅ `handle_user_delete()` - Removes user record on account deletion
- ✅ `create_admin_user()` - Helper function to create admin accounts

## Testing the System 🧪

### Verified Features:

- ✅ Admin user created successfully
- ✅ Automatic trigger creates user records on auth signup
- ✅ User roles and permissions working
- ✅ Database relationships intact
- ✅ Sample business data populated

### Test User Created:

- **Email**: `test@example.com`
- **Full Name**: `Test User`
- **Role**: `user`
- **Avatar**: `https://example.com/avatar.jpg`

## Next Steps for Your App 🚀

### Environment Variables

Add these to your `.env.local`:

```env
# Dynamic FlexiPOS Database
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54421
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=REDACTED_ROTATE_THIS_KEY
```

### Login Process

1. Users sign up through your Next.js app using Supabase Auth
2. Trigger automatically creates a record in the `users` table
3. Business relationships can be created in `business_users` table
4. Users get access based on their business associations

### Admin Panel Access

With the admin account (`admin@flexipos.com`), you can:

- Manage all businesses
- Create new business accounts
- Assign users to businesses
- Configure dynamic categories and menu items

## Quick Access Commands 💻

```bash
# Check database status
cd /home/zex/projects/flexipos/supabase-dynamic
./dynamic-db-status.sh status

# Open Studio (database management)
./dynamic-db-status.sh studio

# Start/stop services
~/.local/bin/supabase start
~/.local/bin/supabase stop
```

---

**🎉 Ready for Integration**: Your dynamic database is now fully configured with user management and ready to be integrated into your Next.js FlexiPOS application!
