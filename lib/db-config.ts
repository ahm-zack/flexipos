/**
 * Database Configuration Manager
 * 
 * This utility allows the app to connect to different databases based on 
 * environment variables and feature flags.
 */

interface DatabaseConfig {
    supabaseUrl: string;
    supabaseAnonKey: string;
    databaseUrl: string;
    serviceRoleKey?: string;
}

/**
 * Get database configuration based on environment and feature flags
 */
export function getDatabaseConfig(): DatabaseConfig {
    // Check if we're using dynamic database
    const useDynamicDb = process.env.NEXT_PUBLIC_APP_MODE === 'dynamic' ||
        process.env.FEATURE_MULTI_TENANT === 'true';

    if (useDynamicDb) {
        // Use dynamic database configuration
        return {
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL_DYNAMIC || 'http://localhost:54423',
            supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_DYNAMIC ||
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
            databaseUrl: process.env.DATABASE_URL_DYNAMIC || 'postgresql://postgres:postgres@localhost:54424/postgres',
            serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY_DYNAMIC,
        };
    }

    // Use original database configuration
    return {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        databaseUrl: process.env.DATABASE_URL || '',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    };
}

/**
 * Check if we're using the dynamic database
 */
export function isDynamicDatabase(): boolean {
    return process.env.NEXT_PUBLIC_APP_MODE === 'dynamic' ||
        process.env.FEATURE_MULTI_TENANT === 'true';
}

/**
 * Get current database mode for logging/debugging
 */
export function getDatabaseMode(): 'original' | 'dynamic' {
    return isDynamicDatabase() ? 'dynamic' : 'original';
}

/**
 * Log current database configuration (development only)
 */
export function logDatabaseConfig(): void {
    if (process.env.NODE_ENV === 'development') {
        const config = getDatabaseConfig();
        const mode = getDatabaseMode();

        console.log(`🗄️ Database Mode: ${mode.toUpperCase()}`);
        console.log(`📡 Supabase URL: ${config.supabaseUrl}`);
        console.log(`🔑 Using ${mode} database configuration`);

        if (mode === 'dynamic') {
            console.log('🚀 Dynamic POS features enabled');
        } else {
            console.log('🏪 Original restaurant POS mode');
        }
    }
}