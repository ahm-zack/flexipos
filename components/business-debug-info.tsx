"use client";

import { useBusinessContext } from "@/modules/providers/components/business-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, User, AlertCircle } from "lucide-react";

export function BusinessDebugInfo() {
  const { businessId, businessName, user, loading, error } =
    useBusinessContext();

  if (loading) {
    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Loading business info...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Business Context Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">User:</span>
          <span className="font-mono">{user?.email || "Not logged in"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Business:</span>
          <span>{businessName || "No business"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Business ID:</span>
          <span className="font-mono text-xs">{businessId || "None"}</span>
        </div>
        {error && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        <div className="pt-2">
          <Badge variant={businessId ? "default" : "destructive"}>
            {businessId ? "✓ Multi-tenant Active" : "⚠ No Business Context"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
