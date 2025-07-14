"use client";

// import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ErrorPage() {
  // const searchParams = useSearchParams();
  // const message = searchParams.get("message") || "Something went wrong";

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Login Error</h1>
        <p className="text-gray-600 mb-6">An Error happened please try again</p>
        <Button asChild>
          <Link href="/login">Try Again</Link>
        </Button>
      </div>
    </div>
  );
}
