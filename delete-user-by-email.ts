/**
 * Delete a specific user by email (cleanup orphaned users)
 * Usage: npx tsx delete-user-by-email.ts <email>
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '.env.local') });

import { db, users, businessUsers } from './lib/db';
import { eq } from 'drizzle-orm';
import { createAdminClient } from './utils/supabase/admin';

async function deleteUserByEmail(email: string) {
    console.log(`\n🔍 Searching for user: ${email}\n`);

    // Step 1: Find user in database
    const userRecords = await db.select().from(users).where(eq(users.email, email));

    if (userRecords.length === 0) {
        console.log('❌ User not found in users table');
        console.log('⚠️  User might still exist in Supabase Auth. Please check the Supabase dashboard.\n');
        return;
    }

    const user = userRecords[0];
    console.log('✅ Found user in users table:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.fullName || 'N/A'}`);
    console.log();

    // Step 2: Check business_users
    const businessUserRecords = await db
        .select()
        .from(businessUsers)
        .where(eq(businessUsers.userId, user.id));

    if (businessUserRecords.length > 0) {
        console.log('⚠️  User has business relationships. Deleting...');
        for (const bu of businessUserRecords) {
            await db.delete(businessUsers).where(eq(businessUsers.id, bu.id));
            console.log(`   ✅ Deleted business_users record: ${bu.id}`);
        }
    } else {
        console.log('ℹ️  User has no business relationships (orphaned)');
    }

    // Step 3: Delete from users table
    await db.delete(users).where(eq(users.id, user.id));
    console.log('✅ Deleted user from users table');

    // Step 4: Delete from Supabase Auth
    try {
        const adminClient = createAdminClient();
        const { error } = await adminClient.auth.admin.deleteUser(user.id);

        if (error) {
            if (error.message?.includes('not found') || error.status === 404) {
                console.log('ℹ️  User not found in Supabase Auth (already deleted or never created)');
            } else {
                console.error('❌ Error deleting from Supabase Auth:', error.message);
            }
        } else {
            console.log('✅ Deleted user from Supabase Auth');
        }
    } catch (authError) {
        console.error('❌ Failed to delete from Supabase Auth:', authError);
    }

    console.log('\n✅ User cleanup complete!\n');
}

const email = process.argv[2];

if (!email) {
    console.error('❌ Usage: npx tsx delete-user-by-email.ts <email>');
    process.exit(1);
}

deleteUserByEmail(email)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
