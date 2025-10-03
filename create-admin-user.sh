#!/bin/bash

# Script to create admin user for FlexiPOS
# This uses a Node.js script to create the user properly

echo "Creating admin user for FlexiPOS..."

# Create a temporary Node.js script to create the user
cat > create_user.js << 'EOF'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54421'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@flexipos.com',
      password: 'password123',
      user_metadata: {
        name: 'Admin User'
      },
      email_confirm: true
    })

    if (error) {
      console.error('Error creating user:', error.message)
      return
    }

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email: admin@flexipos.com')
    console.log('🔑 Password: password123')
    console.log('🆔 User ID:', data.user.id)
    
    // Now create the public user record
    const { error: publicUserError } = await supabase
      .from('users')
      .upsert({
        id: data.user.id,
        email: 'admin@flexipos.com',
        name: 'Admin User',
        role: 'superadmin'
      })
    
    if (publicUserError) {
      console.error('Error creating public user record:', publicUserError.message)
    } else {
      console.log('✅ Public user record created!')
    }
    
  } catch (err) {
    console.error('Unexpected error:', err.message)
  }
}

createAdminUser()
EOF

# Run the script
node create_user.js

# Clean up
rm create_user.js

echo ""
echo "🎉 Setup complete! You can now login with:"
echo "📧 Email: admin@flexipos.com"
echo "🔑 Password: password123"