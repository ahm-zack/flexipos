import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle, Home } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="container mx-auto py-16 px-4 text-center">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <AlertTriangle className="h-24 w-24 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-red-600 mb-2">
            Access Denied
          </h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Unauthorized Access
          </h2>
          <p className="text-gray-600 mb-6">
            You don&apos;t have the required permissions to access this page.
            This area is restricted to super administrators only.
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/admin/menu">
            <Button className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>

          <p className="text-sm text-gray-500 pt-4">
            If you believe you should have access to this page, please contact
            your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
