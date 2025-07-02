import { requireSuperAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UsersPageContent } from "@/modules/user-management/components/users-page-content";
import { getUsers } from "@/lib/user-service-drizzle";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

// Force dynamic rendering since we use cookies for auth
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  // Check if user is authorized (super admin only)
  const { authorized, user: currentUser, error } = await requireSuperAdmin();

  if (!authorized) {
    console.error("Unauthorized access attempt to admin/users:", error);
    redirect("/unauthorized");
  }

  // Create a new QueryClient for SSR
  const queryClient = new QueryClient();

  // Prefetch users data on the server
  await queryClient.prefetchQuery({
    queryKey: ["users", "list"],
    queryFn: async () => {
      const result = await getUsers();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch users");
      }
      return result.data;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersPageContent currentUserId={currentUser?.id || ""} />
    </HydrationBoundary>
  );
}
