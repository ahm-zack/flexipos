"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  normalizeBusinessProfile,
  type BusinessProfile,
  type RawBusinessProfile,
} from "@/lib/business-profile";

interface BusinessContextType {
  businessId: string | null;
  businessName: string | null;
  business: BusinessProfile | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshBusiness: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(
  undefined,
);

export function useBusinessContext() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error(
      "useBusinessContext must be used within a BusinessProvider",
    );
  }
  return context;
}

interface BusinessProviderProps {
  children: React.ReactNode;
}

export function BusinessProvider({ children }: BusinessProviderProps) {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinessData = useCallback(async () => {
    const supabase = createClient();

    try {
      setLoading(true);
      setError(null);

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        console.log("No authenticated user found");
        setUser(null);
        setBusinessId(null);
        setBusiness(null);
        setError("User not authenticated");
        return;
      }

      console.log("User authenticated:", {
        userId: currentUser.id,
        email: currentUser.email,
      });

      setUser(currentUser);

      const { data: businessUser, error: businessError } = await supabase
        .from("business_users")
        .select(
          `
            business_id,
            role,
            businesses:business_id (*)
          `,
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

        if (businessError.code === "PGRST116") {
          console.error(
            "No business association found for user. Please complete signup or contact support.",
          );
          setBusinessId(null);
          setBusiness(null);
          setError("No business found. Please complete your business setup.");
          return;
        }

        setError(`Failed to load business information: ${businessError.message}`);
        return;
      }

      if (businessUser && businessUser.businesses) {
        setBusinessId(businessUser.business_id);
        const normalizedBusiness = normalizeBusinessProfile(
          businessUser.businesses as RawBusinessProfile,
        );
        setBusiness(normalizedBusiness);
        console.log("Business loaded successfully:", {
          businessId: businessUser.business_id,
          businessName: normalizedBusiness?.name,
        });
        return;
      }

      console.error(
        "No business relationship found for user. Data may be corrupted.",
      );
      setBusinessId(null);
      setBusiness(null);
      setError("Business data not found. Please contact support.");
    } catch (err) {
      console.error("Error in fetchBusinessData:", err);
      setError("Failed to initialize business context");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();

    fetchBusinessData();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setBusinessId(null);
        setBusiness(null);
      } else if (event === "SIGNED_IN" && session?.user) {
        fetchBusinessData();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchBusinessData]);

  const value: BusinessContextType = {
    businessId,
    businessName: business?.name ?? null,
    business,
    user,
    loading,
    error,
    refreshBusiness: fetchBusinessData,
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}
