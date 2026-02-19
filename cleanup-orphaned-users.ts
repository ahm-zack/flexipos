/**
 * Cleanup script for orphaned users
 * Run with: npx tsx cleanup-orphaned-users.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '.env.local') });

import { db, users, businessUsers } from './lib/db';
import { eq, sql } from 'drizzle-orm';

async function main() {
    console.log('🔍 Finding orphaned users...\n');

    // Find users without business_users relationship
    const orphanedUsers = await db
        .select({
            id: users.id,
            email: users.email,
            fullName: users.fullName,
            createdAt: users.createdAt,
        })
        .from(users)
        .leftJoin(businessUsers, eq(users.id, businessUsers.userId))
        .where(sql`${businessUsers.id} IS NULL`);

    if (orphanedUsers.length === 0) {
        console.log('✅ No orphaned users found!');
        return;
    }

    console.log(`Found ${orphanedUsers.length} orphaned user(s):\n`);
    orphanedUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.fullName || 'No name'})`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log();
    });

    console.log('\n⚠️  To clean up these users:');
    console.log('1. Delete them from the users table (will be done automatically)');
    console.log('2. Manually delete them from Supabase Auth admin dashboard\n');

    // Uncomment to actually delete:
    // for (const user of orphanedUsers) {
    //   await db.delete(users).where(eq(users.id, user.id));
    //   console.log(`✅ Deleted user: ${user.email}`);
    // }
}

main()
    .then(() => {
        console.log('\n✅ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
