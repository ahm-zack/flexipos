"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Command,
  UtensilsCrossed,
  Users,
  UserCheck,
  BarChart3,
  Package,
  ShoppingBag,
  ShoppingCart,
  User,
  ChevronDown,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useCart } from "@/modules/cart/hooks/use-cart";
import { CartPanelWithCustomer } from "@/components/cart-panel-with-customer";

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

interface MobileAdminNavbarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  } | null;
}

export function MobileAdminNavbar({ user }: MobileAdminNavbarProps) {
  const { theme, setTheme } = useTheme();
  const { cart } = useCart();
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<
    "menu" | "avatar" | "cart" | null
  >(null);

  const toggleDropdown = (dropdown: "menu" | "avatar" | "cart") => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
  };

  return (
    <div className="relative w-full">
      {/* Main Navbar */}
      <div className="w-full flex justify-center p-4">
        <nav className="bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 border rounded-full px-6 py-3 shadow-lg w-full max-w-sm">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/admin"
              className="flex items-center gap-2"
              onClick={closeDropdowns}
            >
              <div className="bg-primary text-primary-foreground flex aspect-square size-10 items-center justify-center rounded-lg">
                <Command className="size-5" />
              </div>
              <span className="font-semibold text-lg">Lazaza</span>
            </Link>

            <div className="flex items-center gap-2">
              {/* Menu Items Button */}
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                onClick={() => toggleDropdown("menu")}
              >
                <UtensilsCrossed className="size-4" />
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform",
                    activeDropdown === "menu" && "rotate-180"
                  )}
                />
              </Button>

              {/* User Avatar Button */}
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
                onClick={() => toggleDropdown("avatar")}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                  <AvatarFallback>
                    <User className="size-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>

              {/* Cart Button with Badge */}
              <Button
                variant="ghost"
                className="relative flex items-center gap-2"
                onClick={() => toggleDropdown("cart")}
              >
                <ShoppingCart className="size-4" />
                {cart.itemCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full size-5 flex items-center justify-center font-medium">
                    {cart.itemCount > 99 ? "99+" : cart.itemCount}
                  </div>
                )}
              </Button>
            </div>
          </div>
        </nav>
      </div>

      {/* Full Width Dropdowns */}
      {activeDropdown && (
        <div className="absolute top-full left-0 w-full z-50 px-4">
          <div className="bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 border rounded-2xl shadow-lg mx-auto max-w-sm">
            {/* Menu Dropdown */}
            {activeDropdown === "menu" && (
              <div className="p-4 space-y-2">
                <div className="text-sm font-medium text-muted-foreground mb-3">
                  Menu Items
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {menuItems.map((item) => {
                    return (
                      <Link
                        key={item.url}
                        href={item.url}
                        className="group relative flex items-center justify-center p-4 rounded-2xl 
                          bg-gradient-to-br from-slate-50/90 to-white/80 dark:from-slate-800/90 dark:to-slate-700/80
                          border border-slate-200/60 dark:border-slate-600/60 
                          backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-md
                          transition-all duration-150 text-center 
                          shadow-lg shadow-black/5 dark:shadow-black/20
                          active:scale-[0.95] active:shadow-md active:shadow-black/10 dark:active:shadow-black/40
                          active:bg-gradient-to-br active:from-slate-100/95 active:to-white/90 
                          dark:active:from-slate-700/95 dark:active:to-slate-600/90
                          active:border-slate-300/80 dark:active:border-slate-500/80
                          transform-gpu touch-manipulation"
                        onClick={closeDropdowns}
                      >
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 dark:to-transparent backdrop-blur-sm"></div>
                        <span
                          className="relative text-sm font-semibold text-slate-700 dark:text-slate-200 
                          active:text-slate-800 dark:active:text-slate-100 transition-colors duration-150"
                        >
                          {item.title}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Avatar Dropdown */}
            {activeDropdown === "avatar" && (
              <div className="p-4 space-y-2">
                {user && (
                  <>
                    <div className="flex flex-col space-y-1 p-2 mb-3">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <div className="border-t border-border my-2"></div>
                  </>
                )}

                <div className="space-y-1">
                  <Link
                    href="/admin/orders"
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full ${
                      pathname?.startsWith("/admin/orders")
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-primary/10 hover:text-primary"
                    }`}
                    onClick={closeDropdowns}
                  >
                    <ShoppingBag className="size-4" />
                    <span>Orders</span>
                  </Link>

                  <Link
                    href="/admin/items"
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full ${
                      pathname?.startsWith("/admin/items")
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-primary/10 hover:text-primary"
                    }`}
                    onClick={closeDropdowns}
                  >
                    <Package className="size-4" />
                    <span>Inventory</span>
                  </Link>

                  <Link
                    href="/admin/customers"
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full ${
                      pathname?.startsWith("/admin/customers")
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-primary/10 hover:text-primary"
                    }`}
                    onClick={closeDropdowns}
                  >
                    <UserCheck className="size-4" />
                    <span>Customers</span>
                  </Link>

                  <Link
                    href="/admin/users"
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full ${
                      pathname?.startsWith("/admin/users")
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-primary/10 hover:text-primary"
                    }`}
                    onClick={closeDropdowns}
                  >
                    <Users className="size-4" />
                    <span>Users</span>
                  </Link>

                  <Link
                    href="/admin/reports"
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full ${
                      pathname?.startsWith("/admin/reports")
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-primary/10 hover:text-primary"
                    }`}
                    onClick={closeDropdowns}
                  >
                    <BarChart3 className="size-4" />
                    <span>Reports</span>
                  </Link>

                  <div className="border-t border-border my-2"></div>

                  <button
                    onClick={() => {
                      setTheme(theme === "dark" ? "light" : "dark");
                      closeDropdowns();
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors w-full text-left"
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun className="size-4" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="size-4" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Cart Dropdown */}
            {activeDropdown === "cart" && (
              <div className="p-0">
                <div className="max-h-[85vh] overflow-y-auto">
                  <CartPanelWithCustomer />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdowns when clicking outside */}
      {activeDropdown && (
        <div className="fixed inset-0 z-40" onClick={closeDropdowns} />
      )}
    </div>
  );
}
