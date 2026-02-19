/**
 * Cleanup ALL orphaned users from both directions
 * Run with: npx tsx cleanup-all-orphans.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '.env.local') });

import { db, users, businessUsers } from './lib/db';
import { eq, sql } from 'drizzle-orm';
import { createAdminClient } from './utils/supabase/admin';

async function cleanupAllOrphans() {
    console.log('🧹 Starting comprehensive orphaned user cleanup...\n');

    // PART 1: Find users in database without business relationships
    console.log('📋 PART 1: Checking for orphaned users in database...\n');

    const orphanedDbUsers = await db
        .select({
            id: users.id,
            email: users.email,
            fullName: users.fullName,
        })
        .from(users)
        .leftJoin(businessUsers, eq(users.id, businessUsers.userId))
        .where(sql`${businessUsers.id} IS NULL`);

    if (orphanedDbUsers.length > 0) {
        console.log(`Found ${orphanedDbUsers.length} orphaned user(s) in database:\n`);

        for (const user of orphanedDbUsers) {
            console.log(`  🗑️  Deleting: ${user.email} (${user.fullName || 'No name'})`);

            // Delete from users table
            await db.delete(users).where(eq(users.id, user.id));

            // Try to delete from auth
            try {
                const adminClient = createAdminClient();
                await adminClient.auth.admin.deleteUser(user.id);
                console.log(`     ✅ Deleted from both database and auth\n`);
            } catch (authError) {
                console.log(`     ✅ Deleted from database (not found in auth)\n`);
            }
        }
    } else {
        console.log('✅ No orphaned users found in database\n');
    }

    // PART 2: Find auth users without database entries
    console.log('📋 PART 2: Checking for orphaned users in auth...\n');

    try {
        const adminClient = createAdminClient();
        const { data: authData } = await adminClient.auth.admin.listUsers();
        const authUsers = authData?.users || [];

        let orphanedAuthCount = 0;

        for (const authUser of authUsers) {
            // Check if this auth user exists in our database
            const dbUser = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);

            if (dbUser.length === 0) {
                orphanedAuthCount++;
                console.log(`  🗑️  Deleting orphaned auth user: ${authUser.email}`);
                await adminClient.auth.admin.deleteUser(authUser.id);
                console.log(`     ✅ Deleted from auth\n`);
            }
        }

        if (orphanedAuthCount === 0) {
            console.log('✅ No orphaned users found in auth\n');
        } else {
            console.log(`✅ Cleaned up ${orphanedAuthCount} orphaned auth user(s)\n`);
        }
    } catch (error) {
        console.error('❌ Error checking auth users:', error);
    }

    console.log('✅ Cleanup complete!\n');
}

cleanupAllOrphans()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
