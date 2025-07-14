'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { AppRole } from '@/lib/schemas';

export interface FullUserData {
    id: string;
    name: string;
    email: string;
    role: AppRole;
}

export function useCurrentUserClient() {
    const [user, setUser] = useState<FullUserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const supabase = createClient();

        const fetchUser = async () => {
            try {
                setLoading(true);
                setError(null);

                // First check if user is authenticated
                const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

                if (authError || !authUser) {
                    setUser(null);
                    setError('Not authenticated');
                    return;
                }

                // Fetch full user data from API route
                const response = await fetch('/api/auth/me', {
                    credentials: 'include',
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        setUser(null);
                        setError('Not authenticated');
                        return;
                    }
                    throw new Error(`HTTP ${response.status}`);
                }

                const result = await response.json();

                if (result.success && result.data) {
                    setUser(result.data);
                } else {
                    setError(result.error || 'Failed to fetch user data');
                }
            } catch (err) {
                console.error('Error getting current user:', err);
                setError('Failed to verify user');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                fetchUser();
            } else if (event === 'SIGNED_OUT') {
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
