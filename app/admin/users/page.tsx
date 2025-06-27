import { requireSuperAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UsersPageContent } from "@/modules/user-management/components/users-page-content";

export default async function UsersPage() {
  // Check if user is authorized (super admin only)
  const { authorized, user: currentUser, error } = await requireSuperAdmin();

  if (!authorized) {
    console.error("Unauthorized access attempt to admin/users:", error);
    redirect("/unauthorized");
  }

  return <UsersPageContent currentUserId={currentUser?.id || ""} />;
}
