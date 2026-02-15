# ✅ Signup Process Refactored - 2-Step Flow

## Overview

The signup process has been completely refactored into a clean, organized 2-step flow that prevents failures and ensures data consistency.

## Architecture

### Old Flow (Problematic)

- ❌ Single endpoint tried to do everything at once
- ❌ Failed often due to transaction complexity
- ❌ Hard to debug where failures occurred
- ❌ Users lost when any step failed

### New Flow (Robust)

✅ **Step 1**: Create Auth User + Users Table Entry
✅ **Step 2**: Create Business + Link to User

## API Endpoints

### 1. POST `/api/auth/signup/step1`

**Purpose**: Create user account and authenticate

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (Success)**:

```json
{
  "success": true,
  "data": {
    "userId": "uuid-here",
    "email": "user@example.com"
  }
}
```

**What it does**:

1. Validates email and password
2. Checks if user already exists
3. Creates Supabase auth user
4. Creates entry in `users` table
5. Sets user role to 'admin'
6. Auto-confirms email
7. **Rollback**: If step 4 fails, deletes auth user

### 2. POST `/api/auth/signup/step2`

**Purpose**: Create business and link to user

**Request Body**:

```json
{
  "userId": "uuid-from-step1",
  "business": {
    "name": "My Business",
    "phone": "+966123456789",
    "address": "123 Main St, Riyadh, Saudi Arabia",
    "timezone": "Asia/Riyadh",
    "currency": "SAR"
  }
}
```

**Response (Success)**:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "business": {
      "id": "business-uuid",
      "name": "My Business",
      "slug": "my-business"
    }
  }
}
```

**What it does**:

1. Verifies userId exists in users table
2. Checks user doesn't already have a business
3. Generates slug from business name
4. Creates entry in `businesses` table with businessId
5. Creates entry in `business_users` table linking user to business
6. Sets user as 'admin' in business_users
7. Updates user's full name if needed

## UI Flow

### Page: `/signup`

**Step 1 - User Credentials:**

- Email input
- Password input
- Repeat password validation
- "Next" button calls `/api/auth/signup/step1`
- On success: Stores userId and moves to Step 2
- On error: Shows error message, user can retry

**Step 2 - Business Information:**

- Business name (required)
- Phone number (required)
- Address (optional)
- City (optional)
- Country (optional)
- "Back" button returns to Step 1 (data preserved)
- "Sign Up" button calls `/api/auth/signup/step2`
- On success: Redirects to login page
- On error: Shows error message, user can retry (account already created)

## Security Features

✅ **Multi-tenant Security**: All business data includes `businessId`
✅ **User Isolation**: Users linked to businesses via `business_users` table
✅ **Role-based Access**: Users assigned 'admin' role for their business
✅ **Email Validation**: Regex validation on email format
✅ **Password Strength**: Minimum 6 characters enforced
✅ **Duplicate Prevention**: Checks for existing users/businesses

## Database Tables Affected

### 1. `users` table

- Stores user authentication details
- Role set to 'admin' for signups
- **Does NOT have businessId** (users shared across businesses)

### 2. `businesses` table

- Stores business information
- Generates slug from name
- Sets default timezone and currency

### 3. `business_users` table (Junction)

- Links users to businesses
- Stores role per business relationship
- Allows multi-tenant access
- **Has businessId** for isolation

## Error Handling

### Step 1 Failures

- **Email already exists**: Returns 400, user informed
- **Invalid email format**: Returns 400, validation message
- **Weak password**: Returns 400, requirement shown
- **Auth creation fails**: Returns 400, error message shown
- **Database insert fails**: Rolls back auth user, returns 500

### Step 2 Failures

- **Missing userId**: Returns 400, redirects to step 1
- **User not found**: Returns 404, must complete step 1
- **Business name taken**: Returns 400, user can change name
- **User already has business**: Returns 400, prevent duplicates
- **Database error**: Returns 500, but user account exists (can retry)

## Benefits

### 🎯 Reliability

- Each step is independent and atomic
- Failed step 2 doesn't lose the user account
- Users can retry business creation

### 🔒 Security

- Complete multi-tenant isolation
- Proper role assignment
- Validation at every step

### 🐛 Debugging

- Clear separation of concerns
- Easy to identify where failures occur
- Detailed error messages

### 👥 User Experience

- Visual progress indicator (Step 1 of 2, Step 2 of 2)
- Can go back and forth between steps
- Clear error messages
- Account preserved even if business creation fails

## Testing Checklist

- [ ] Create account with valid email/password
- [ ] Try duplicate email (should fail gracefully)
- [ ] Try weak password (should show error)
- [ ] Complete step 1, then complete step 2
- [ ] Complete step 1, refresh page, try step 2 (should fail, session lost)
- [ ] Try duplicate business name (should show error)
- [ ] Complete signup and verify login works
- [ ] Check user entry in `users` table
- [ ] Check business entry in `businesses` table
- [ ] Check link entry in `business_users` table

## Migration Note

The old `/api/auth/signup` endpoint has been deprecated and returns HTTP 410 (Gone) with information about the new endpoints.

## Next Steps

Consider adding:

- Email verification flow
- Password reset functionality
- Welcome email after signup
- Business onboarding wizard
- Multi-user invitation system
