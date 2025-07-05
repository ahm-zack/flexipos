'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { AppRole } from '@/lib/schemas';

export interface AuthUser {
  id: string;
  email: string;
  role: AppRole;
}

export function useCurrentUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          setUser(null);
          setError(authError?.message || 'Not authenticated');
          return;
        }

        // Get role from JWT custom claims (Supabase recommended approach)
        const userRole = authUser.app_metadata?.user_role as AppRole;
        
        if (!userRole) {
          setUser(null);
          setError('User role not found in JWT claims. Please log out and log back in.');
          return;
        }

        setUser({
          id: authUser.id,
          email: authUser.email || '',
          role: userRole,
        });
      } catch (err) {
        console.error('Error getting current user:', err);
        setError('Failed to verify user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        getUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setError(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading, error };
}
