"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

interface BusinessContextType {
  businessId: string | null;
  businessName: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const BusinessContext = createContext<BusinessContextType | undefined>(
  undefined
);

export function useBusinessContext() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error(
      "useBusinessContext must be used within a BusinessProvider"
    );
  }
  return context;
}

interface BusinessProviderProps {
  children: React.ReactNode;
}

export function BusinessProvider({ children }: BusinessProviderProps) {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchBusinessData() {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!currentUser) {
          console.log("No authenticated user found");
          setUser(null);
          setBusinessId(null);
          setBusinessName(null);
          setError("User not authenticated");
          return;
        }

        console.log("User authenticated:", {
          userId: currentUser.id,
          email: currentUser.email,
        });

        setUser(currentUser);

        // Get user's business relationship
        const { data: businessUser, error: businessError } = await supabase
          .from("business_users")
          .select(
            `
            business_id,
            role,
            businesses:business_id (
              id,
              name,
              settings
            )
          `
          )
          .eq("user_id", currentUser.id)
          .eq("is_active", true)
          .single();

        if (businessError) {
          console.error("Error fetching business data:", {
            error: businessError,
            code: businessError.code,
            message: businessError.message,
            details: businessError.details,
            hint: businessError.hint,
            userId: currentUser.id,
          });

          // If no business_users record found, use fallback for development
          if (businessError.code === "PGRST116") {
            console.warn(
              "No business_users record found, using development fallback"
            );
            const fallbackBusinessId = "b1234567-89ab-cdef-0123-456789abcdef";
            setBusinessId(fallbackBusinessId);
            setBusinessName("Development Business");
            setError(null);
            return;
          }

          setError(
            `Failed to load business information: ${businessError.message}`
          );
          return;
        }

        if (businessUser && businessUser.businesses) {
          setBusinessId(businessUser.business_id);
          const business = businessUser.businesses as {
            id: string;
            name: string;
            settings: unknown;
          };
          setBusinessName(business.name);
          console.log("Business loaded successfully:", {
            businessId: businessUser.business_id,
            businessName: business.name,
          });
        } else {
          console.warn(
            "No business relationship found, using development fallback"
          );
          const fallbackBusinessId = "b1234567-89ab-cdef-0123-456789abcdef";
          setBusinessId(fallbackBusinessId);
          setBusinessName("Development Business");
          setError(null);
        }
      } catch (err) {
        console.error("Error in fetchBusinessData:", err);
        setError("Failed to initialize business context");
      } finally {
        setLoading(false);
      }
    }

    fetchBusinessData();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setBusinessId(null);
        setBusinessName(null);
      } else if (event === "SIGNED_IN" && session?.user) {
        fetchBusinessData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: BusinessContextType = {
    businessId,
    businessName,
    user,
    loading,
    error,
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}
