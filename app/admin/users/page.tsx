import { requireManagerOrHigher } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UsersPageContent } from "@/modules/user-management/components/users-page-content";
import { getBusinessUsers, getCurrentUserBusinessId } from "@/lib/user-service";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

// Force dynamic rendering since we use cookies for auth
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  // Check if user is authorized (manager or higher)
  const {
    authorized,
    user: currentUser,
    error,
  } = await requireManagerOrHigher();

  if (!authorized || !currentUser) {
    console.error("Unauthorized access attempt to admin/users:", error);
    redirect("/unauthorized");
  }

  // Get the current user's business
  const businessResult = await getCurrentUserBusinessId(currentUser.id);
  if (!businessResult.success || !businessResult.data) {
    console.error("User has no business association:", currentUser.id);
    redirect("/unauthorized");
  }

  // Create a new QueryClient for SSR
  const queryClient = new QueryClient();

  // Prefetch users data on the server (business users only)
  await queryClient.prefetchQuery({
    queryKey: ["users", "list"],
    queryFn: async () => {
      const result = await getBusinessUsers(businessResult.data!);
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
