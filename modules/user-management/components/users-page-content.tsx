"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import { useUsers } from "../hooks/use-users";
import { UsersCards } from "./users-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UsersPageContentProps {
  currentUserId: string;
}

export function UsersPageContent({ currentUserId }: UsersPageContentProps) {
  const { data: users, isLoading, error, refetch } = useUsers();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "Failed to load users"}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center justify-center sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link href="/admin/users/new" className="w-full sm:w-auto">
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </Link>
        </div>
      </div>

      <UsersCards users={users || []} currentUserId={currentUserId} />
    </div>
  );
}
