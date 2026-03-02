"use client";

import { useBusinessContext } from "@/modules/providers/components/business-provider";
import { Badge } from "@/components/ui/badge";
import { Building2, User, AlertCircle, CheckCircle2 } from "lucide-react";

export function BusinessDebugInfo() {
  const { businessName, user, loading, error } = useBusinessContext();

  if (loading) return null;

  if (error && !businessName) {
    return (
      <div className="flex items-center gap-2 mb-4 px-4 py-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mb-4 px-4 py-3 rounded-xl bg-muted/40 border border-border/50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-sm">{businessName ?? "—"}</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-3.5 h-3.5" />
          <span>{user?.email ?? "Not logged in"}</span>
        </div>
      </div>
      <Badge
        variant={businessName ? "default" : "destructive"}
        className="gap-1.5 text-xs"
      >
        <CheckCircle2 className="w-3 h-3" />
        {businessName ? "Active" : "No Business"}
      </Badge>
    </div>
  );
}
