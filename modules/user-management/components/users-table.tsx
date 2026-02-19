"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Mail,
  Calendar,
  Clock,
} from "lucide-react";
import type { BusinessUserWithDetails } from "@/lib/user-service-drizzle";
import { useDeleteUser } from "../hooks/use-users";
import { EditUserDialog } from "./edit-user-dialog";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface UsersTableProps {
  users: BusinessUserWithDetails[];
  currentUserId: string;
  onAddUser?: () => void;
}

const roleColors = {
  superadmin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  manager:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  cashier: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  kitchen:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  staff: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
} as const;

export function UsersCards({ users, currentUserId }: UsersTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] =
    useState<BusinessUserWithDetails | null>(null);
  const [userToEdit, setUserToEdit] = useState<BusinessUserWithDetails | null>(
    null,
  );
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const deleteUserMutation = useDeleteUser();

  const handleDeleteClick = (user: BusinessUserWithDetails) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (user: BusinessUserWithDetails) => {
    setUserToEdit(user);
    setEditDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await deleteUserMutation.mutateAsync(userToDelete.id);
      toast.success(`User ${userToDelete.user.fullName} deleted successfully`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete user",
      );
    }
  };

  const isCurrentUser = (userId: string) => userId === currentUserId;

  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string | null) => {
    if (!role || !(role in roleColors))
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    return roleColors[role as keyof typeof roleColors];
  };

  const formatRoleName = (role: string | null) => {
    if (!role) return "Unknown";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown";
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  // Bulk operations handlers
  const handleSelectUser = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const handleSelectAll = () => {
    const selectableUsers = users.filter((user) => !isCurrentUser(user.userId));
    if (selectedUsers.size === selectableUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(selectableUsers.map((user) => user.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedUsers.size === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedUsers.size === 0) return;

    try {
      // Delete users one by one (could be optimized with a bulk API endpoint)
      const deletePromises = Array.from(selectedUsers).map((userId) =>
        deleteUserMutation.mutateAsync(userId),
      );
      await Promise.all(deletePromises);

      toast.success(`${selectedUsers.size} user(s) deleted successfully`);
      setSelectedUsers(new Set());
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete users",
      );
    }
  };

  const canSelect = (user: BusinessUserWithDetails) =>
    !isCurrentUser(user.userId);
  const selectableUsersCount = users.filter(canSelect).length;

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          No users found
        </h3>
        <p className="text-muted-foreground">
          Create your first user to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Bulk Operations Bar */}
      {selectableUsersCount > 0 && (
        <Card className="mb-4">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={
                      selectedUsers.size === selectableUsersCount &&
                      selectableUsersCount > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedUsers.size === 0
                      ? "Select all"
                      : `${selectedUsers.size} of ${selectableUsersCount} selected`}
                  </span>
                </div>
              </div>

              {selectedUsers.size > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={deleteUserMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected ({selectedUsers.size})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedUsers(new Set())}
                  >
                    Clear Selection
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card
            key={user.id}
            className="hover:shadow-lg transition-all duration-200"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {canSelect(user) && (
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-gray-300 mt-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-white">
                      {getInitials(user.user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">
                        {user.user.fullName}
                      </h3>
                      {isCurrentUser(user.userId) && (
                        <Badge
                          variant="outline"
                          className="text-xs px-1.5 py-0.5"
                        >
                          You
                        </Badge>
                      )}
                    </div>
                    <Badge className={`${getRoleColor(user.role)} text-xs`}>
                      {formatRoleName(user.role)}
                    </Badge>
                  </div>
                </div>
                {!isCurrentUser(user.userId) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(user)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteClick(user)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{user.user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Created {formatDate(user.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Updated {formatDate(user.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete user &quot;
              {userToDelete?.user.fullName}
              &quot;? This action cannot be undone and will remove the user from
              both the database and authentication system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditUserDialog
        user={userToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Users</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUsers.size} user(s)? This
              action cannot be undone and will remove the users from both the
              database and authentication system.
              <br />
              <br />
              <strong>Users to be deleted:</strong>
              <ul className="mt-2 list-disc list-inside">
                {Array.from(selectedUsers).map((userId) => {
                  const user = users.find((u) => u.id === userId);
                  return (
                    <li key={userId} className="text-sm">
                      {user?.user.fullName || user?.user.email || userId}
                    </li>
                  );
                })}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUserMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeleteConfirm}
              disabled={deleteUserMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteUserMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full border-2 border-t-transparent border-white h-4 w-4" />
                  Deleting...
                </div>
              ) : (
                `Delete ${selectedUsers.size} Users`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
