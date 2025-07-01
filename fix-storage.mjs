// Quick Storage Fix Script
// This will help identify and fix common storage issues

import { createClient } from '@supabase/supabase-js';

// Check environment variables
console.log('Environment check:');
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'Missing');
console.log('ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function quickStorageFix() {
  try {
    console.log('\n1. Testing connection...');
    
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Connection error:', error);
      
      // Common fixes
      console.log('\n🔧 Possible fixes:');
      console.log('1. Check if Supabase is running (if using local dev)');
      console.log('2. Verify your .env.local file has correct URLs');
      console.log('3. Make sure storage is enabled in your Supabase project');
      console.log('4. Check if you\'re using the correct project URL');
      
      return;
    }
    
    console.log('✅ Connection successful');
    console.log('Available buckets:', buckets?.map(b => b.id));
    
    // Check specific bucket
    const hasBucket = buckets?.some(b => b.id === 'menu-items-images');
    
    if (!hasBucket) {
      console.log('\n❌ Bucket "menu-items-images" not found');
      console.log('Creating bucket...');
      
      const { error: createError } = await supabase.storage.createBucket('menu-items-images', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        console.error('Failed to create bucket:', createError);
      } else {
        console.log('✅ Bucket created successfully');
      }
    } else {
      console.log('✅ Bucket exists');
    }
    
  } catch (err) {
    console.error('Script error:', err);
  }
}

quickStorageFix();
