"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Command,
  Users,
  UserCheck,
  BarChart3,
  Package,
  ShoppingBag,
  User,
  Moon,
  Sun,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";

const menuItems = [
  {
    title: "Pizza",
    url: "/admin/menu/pizza",
  },
  {
    title: "Pie",
    url: "/admin/menu/pie",
  },
  {
    title: "Sandwich",
    url: "/admin/menu/sandwich",
  },
  {
    title: "Mini Pie",
    url: "/admin/menu/mini-pie",
  },
  {
    title: "Burger",
    url: "/admin/menu/burger",
  },
  {
    title: "Appetizers",
    url: "/admin/menu/appetizers",
  },
  {
    title: "Shawerma",
    url: "/admin/menu/shawerma",
  },
  {
    title: "Side Order",
    url: "/admin/menu/side-order",
  },
  {
    title: "Beverages",
    url: "/admin/menu/beverages",
  },
];

interface ModernAdminNavbarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  } | null;
}

export function DesktopAdminNavbar({ user }: ModernAdminNavbarProps) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  return (
    <div className="w-full flex justify-center p-4">
      <nav className="bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 border rounded-full px-6 py-3 shadow-lg max-w-fit">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex aspect-square size-10 items-center justify-center rounded-lg">
              <Command className="size-5" />
            </div>
            <span className="font-semibold text-lg hidden xl:block">
              Lazaza
            </span>
          </Link>

          {/* Separator */}
          <div className="w-px h-6 bg-border/50"></div>

          {/* Menu Items in Dock */}
          <div className="flex items-center gap-3">
            {menuItems.map((item) => {
              const isActive = pathname.startsWith(item.url);
              return (
                <Link
                  key={item.url}
                  href={item.url}
                  className="group relative flex items-center justify-center px-4 py-3 rounded-lg hover:bg-primary/10 hover:shadow-sm transition-all duration-300"
                >
                  {/* LED Light Below - Only for Active Item */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r from-primary/80 via-primary to-primary/80 dark:from-white/80 dark:via-white dark:to-white/80 shadow-lg shadow-primary/50 dark:shadow-white/50"></div>
                  )}

                  <span
                    className={`relative text-sm font-medium transition-colors duration-300 whitespace-nowrap ${
                      isActive
                        ? "text-primary"
                        : "text-slate-700 dark:text-slate-200 group-hover:text-primary"
                    }`}
                  >
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* User Avatar with Admin Functions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full hover:bg-primary/10 hover:border-primary/20 transition-colors duration-300"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                  <AvatarFallback>
                    <User className="size-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {user && (
                <>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuItem asChild>
                <Link
                  href="/admin/orders"
                  className={`flex items-center gap-2 ${
                    pathname?.startsWith("/admin/orders")
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                  }`}
                >
                  <ShoppingBag className="size-4" />
                  Orders
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/admin/items"
                  className={`flex items-center gap-2 ${
                    pathname?.startsWith("/admin/items")
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                  }`}
                >
                  <Package className="size-4" />
                  Inventory
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/admin/customers"
                  className={`flex items-center gap-2 ${
                    pathname?.startsWith("/admin/customers")
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                  }`}
                >
                  <UserCheck className="size-4" />
                  Customers
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/admin/users"
                  className={`flex items-center gap-2 ${
                    pathname?.startsWith("/admin/users")
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                  }`}
                >
                  <Users className="size-4" />
                  Users
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/admin/reports"
                  className={`flex items-center gap-2 ${
                    pathname?.startsWith("/admin/reports")
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                  }`}
                >
                  <BarChart3 className="size-4" />
                  Reports
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="size-4 mr-2" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="size-4 mr-2" />
                    Dark Mode
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </div>
  );
}
