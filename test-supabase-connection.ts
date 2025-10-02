// Test Supabase connection with new environment variables
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('🔌 Testing Supabase Connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey?.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseKey)

// Test the connection
async function testConnection() {
    try {
        console.log('📡 Testing API connection...')

        // Test a simple query
        const { data, error } = await supabase
            .from('businesses')
            .select('*')
            .limit(1)

        if (error) {
            console.error('❌ Connection failed:', error)
            return false
        }

        console.log('✅ Connection successful!')
        console.log('📊 Sample business data:', data)
        return true

    } catch (err) {
        console.error('❌ Connection test failed:', err)
        return false
    }
}

// Test authentication
async function testAuth() {
    try {
        console.log('🔐 Testing authentication...')

        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'admin@flexipos.com',
            password: 'admin123'
        })

        if (error) {
            console.error('❌ Auth test failed:', error)
            return false
        }

        console.log('✅ Authentication successful!')
        console.log('👤 User:', data.user?.email)

        // Sign out
        await supabase.auth.signOut()
        console.log('👋 Signed out successfully')

        return true

    } catch (err) {
        console.error('❌ Auth test failed:', err)
        return false
    }
}

export { testConnection, testAuth }