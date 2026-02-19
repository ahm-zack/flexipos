import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '.env.local') });

import { db, users, businessUsers } from './lib/db';
import { eq } from 'drizzle-orm';

async function checkUser(email: string) {
    console.log(`\n🔍 Checking user: ${email}\n`);

    // Check users table
    const userRecords = await db.select().from(users).where(eq(users.email, email));

    if (userRecords.length === 0) {
        console.log('❌ User NOT found in users table');
    } else {
        console.log('✅ User found in users table:');
        userRecords.forEach(u => {
            console.log(`   ID: ${u.id}`);
            console.log(`   Email: ${u.email}`);
            console.log(`   Name: ${u.fullName || 'N/A'}`);
            console.log(`   Role: ${u.role}`);
            console.log(`   Active: ${u.isActive}\n`);

            // Check business_users table
            db.select().from(businessUsers).where(eq(businessUsers.userId, u.id))
                .then(buRecords => {
                    if (buRecords.length === 0) {
                        console.log('❌ User NOT found in business_users table (ORPHANED!)');
                    } else {
                        console.log('✅ User found in business_users table:');
                        buRecords.forEach(bu => {
                            console.log(`   Business User ID: ${bu.id}`);
                            console.log(`   Business ID: ${bu.businessId}`);
                            console.log(`   Role: ${bu.role}`);
                            console.log(`   Active: ${bu.isActive}`);
                        });
                    }
                });
        });
    }
}

checkUser('ahmed@zicas.dev').then(() => process.exit(0));
