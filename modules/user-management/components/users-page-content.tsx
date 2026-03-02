"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, RefreshCw, Search, Users, Filter } from "lucide-react";
import { useUsers } from "../hooks/use-users";
import { UsersCards } from "./users-table";
import { AddUserDialog } from "./add-user-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UsersPageContentProps {
  currentUserId: string;
}

export function UsersPageContent({ currentUserId }: UsersPageContentProps) {
  const t = useTranslations("users");
  const { data: users, isLoading, error, refetch } = useUsers();
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Filter users based on search term and role filter
  const filteredUsers = (users || []).filter((user) => {
    const matchesSearch =
      !searchTerm ||
      user.user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">{t("loading")}</p>
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
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Users className="h-5 w-5" />
              {t("errorLoadingUsers")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : t("failedToLoadUsers")}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("tryAgain")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <Button onClick={() => setAddUserOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          {t("addUser")}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t("search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 min-w-[200px]">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t("filterByRole")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allRoles")}</SelectItem>
                  <SelectItem value="superadmin">{t("roles.superadmin")}</SelectItem>
                  <SelectItem value="admin">{t("roles.admin")}</SelectItem>
                  <SelectItem value="manager">{t("roles.manager")}</SelectItem>
                  <SelectItem value="cashier">{t("roles.cashier")}</SelectItem>
                  <SelectItem value="kitchen">{t("roles.kitchen")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("refresh")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredUsers.length === users?.length
            ? t("showingAll", { count: filteredUsers.length })
            : t("showingFiltered", { filtered: filteredUsers.length, total: users?.length || 0 })}
        </p>
        {(searchTerm || roleFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setRoleFilter("all");
            }}
          >
            {t("clearFilters")}
          </Button>
        )}
      </div>

      {/* Users Grid */}
      <UsersCards
        users={filteredUsers}
        currentUserId={currentUserId}
        onAddUser={() => setAddUserOpen(true)}
      />

      {/* Add User Dialog */}
      <AddUserDialog open={addUserOpen} onOpenChange={setAddUserOpen} />
    </div>
  );
}
