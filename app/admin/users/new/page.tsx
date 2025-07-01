import { CreateUserForm } from "@/modules/user-management/components/create-user-form";
import { requireSuperAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

// Force dynamic rendering since we use cookies for auth
export const dynamic = "force-dynamic";

interface NewUserPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewUserPage({ searchParams }: NewUserPageProps) {
  // Check if user is authorized (super admin only)
  const { authorized, error } = await requireSuperAdmin();

  if (!authorized) {
    console.error("Unauthorized access attempt to admin/users/new:", error);
    redirect("/unauthorized");
  }

  const params = await searchParams;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {params.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              {decodeURIComponent(params.error)}
            </p>
          </div>
        )}

        <CreateUserForm />
      </div>
    </div>
  );
}
