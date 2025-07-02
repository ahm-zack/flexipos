"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "./actions";
import Image from "next/image";
import Link from "next/link";
import { Command } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    // Show loading toast with spinner
    const toastId = toast.loading("Logging in...", {});

    try {
      const result = await login(formData);

      // If we get here, it means there was an error (success redirects on server)
      if (result && !result.success) {
        toast.error(result.error || "Login failed. Please try again.", {
          id: toastId,
        });
      }
    } catch (error) {
      // Check if it's a Next.js redirect error (successful login)
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("NEXT_REDIRECT") ||
        (error && typeof error === "object" && "digest" in error)
      ) {
        // This is a successful redirect, update toast to success
        toast.success("Login successful!", {
          id: toastId,
        });
        return;
      }

      toast.error("An unexpected error occurred. Please try again.", {
        id: toastId,
      });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link
            href="/"
            className="flex items-center gap-2 font-medium h-16 text-lg"
          >
            <div className="bg-primary text-primary-foreground flex aspect-square size-12 items-center justify-center rounded-lg">
              <Command className="size-6" />
            </div>
            <div className="grid flex-1 text-left text-base leading-tight">
              <span className="truncate font-semibold text-lg">Lazaza</span>
              <span className="truncate text-sm font-medium">POS</span>
            </div>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Login to your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your email below to login to your account
                </p>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Login"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/login.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1080}
        />
      </div>
    </div>
  );
}
