'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { AppRole } from '@/lib/schemas';

export interface FullUserData {
    id: string;
    name: string;
    email: string;
    role: AppRole;
}

// Cache user data across component re-renders
let cachedUser: FullUserData | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useCurrentUserOptimized() {
    const [user, setUser] = useState<FullUserData | null>(cachedUser);
    const [loading, setLoading] = useState(!cachedUser);
    const [error, setError] = useState<string | null>(null);
    const fetchingRef = useRef(false);

    useEffect(() => {
        const supabase = createClient();

        const fetchUser = async () => {
            // Prevent multiple concurrent fetches
            if (fetchingRef.current) return;
            fetchingRef.current = true;

            try {
                // Check if cache is still valid
                const now = Date.now();
                if (cachedUser && (now - cacheTimestamp) < CACHE_DURATION) {
                    setUser(cachedUser);
                    setLoading(false);
                    return;
                }

                // Show loading only if no cached data
                if (!cachedUser) {
                    setLoading(true);
                }
                setError(null);

                // Quick auth check (usually cached by Supabase)
                const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

                if (authError || !authUser) {
                    cachedUser = null;
                    cacheTimestamp = 0;
                    setUser(null);
                    setError('Not authenticated');
                    return;
                }

                // Fetch full user data in background
                const response = await fetch('/api/auth/me', {
                    credentials: 'include',
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        cachedUser = null;
                        cacheTimestamp = 0;
                        setUser(null);
                        setError('Not authenticated');
                        return;
                    }
                    throw new Error(`HTTP ${response.status}`);
                }

                const result = await response.json();

                if (result.success && result.data) {
                    cachedUser = result.data;
                    cacheTimestamp = Date.now();
                    setUser(result.data);
                } else {
                    setError(result.error || 'Failed to fetch user data');
                }
            } catch (err) {
                console.error('Error getting current user:', err);
                setError('Failed to verify user');
                // Keep cached user if available
                if (!cachedUser) {
                    setUser(null);
                }
            } finally {
                setLoading(false);
                fetchingRef.current = false;
            }
        };

        fetchUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                // Clear cache on new sign in
                cachedUser = null;
                cacheTimestamp = 0;
                fetchUser();
            } else if (event === 'SIGNED_OUT') {
                cachedUser = null;
                cacheTimestamp = 0;
                setUser(null);
                setError(null);
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return { user, loading, error };
}
