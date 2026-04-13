"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Languages,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useCart } from "@/modules/cart/hooks/use-cart";
import { CartPanel } from "@/modules/cart";
import { useCategories } from "@/hooks/useCategories";
import { useBusiness } from "@/hooks/useBusinessId";
import { createClient } from "@/utils/supabase/client";

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
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const { businessName } = useBusiness();
  const [activeDropdown, setActiveDropdown] = useState<
    "menu" | "avatar" | "cart" | null
  >(null);
  const brandName = businessName || "FlexiPOS";

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const toggleLocale = () => {
    const next = locale === "en" ? "ar" : "en";
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
  };

  // Fetch categories with caching
  const { data: categories = [], isLoading, error } = useCategories(); // Now uses authenticated user's businessId from context

  // Generate dynamic menu items from categories
  const dynamicMenuItems = React.useMemo(() => {
    if (isLoading || error || !categories.length) {
      // Fallback items while loading or if no categories
      return [
        {
          title: t("nav.inventory"),
          url: "/admin/inventory",
          icon: "📦",
          color: "#4ECDC4",
        },
      ];
    }

    return categories
      .filter((category) => category.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((category) => ({
        title: category.name,
        url: `/admin/menu/${category.slug}`,
        icon: category.icon || "📁",
        color: category.color || "#4ECDC4",
      }));
  }, [categories, isLoading, error, t]);

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
        <nav className="bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 border border-border/50 rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-shadow duration-300 w-full max-w-sm">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/admin"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200"
              onClick={closeDropdowns}
            >
              <div className="bg-primary text-primary-foreground flex aspect-square size-10 items-center justify-center rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                <Command className="size-5" />
              </div>
              <span className="font-semibold text-lg bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                {brandName}
              </span>
            </Link>

            <div className="flex items-center gap-2">
              {/* Menu Items Button */}
              <Button
                className={cn(
                  "relative flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg",
                  activeDropdown === "menu" && "bg-primary/80 shadow-lg",
                )}
                onClick={() => toggleDropdown("menu")}
              >
                <UtensilsCrossed className="size-4" />
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform duration-200",
                    activeDropdown === "menu" && "rotate-180",
                  )}
                />
                {/* Active Indicator Circle */}
                {activeDropdown === "menu" && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary-foreground rounded-full" />
                )}
              </Button>

              {/* Cart Button with Badge */}
              <Button
                variant="ghost"
                className={cn(
                  "relative flex items-center gap-2 h-10 w-10 p-0 hover:bg-accent transition-colors duration-200",
                  activeDropdown === "cart" && "bg-accent",
                )}
                onClick={() => toggleDropdown("cart")}
              >
                <ShoppingCart className="size-4" />
                {cart.itemCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full size-5 flex items-center justify-center font-medium animate-pulse">
                    {cart.itemCount > 99 ? "99+" : cart.itemCount}
                  </div>
                )}
                {/* Active Indicator Circle */}
                {activeDropdown === "cart" && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                )}
              </Button>

              {/* User Avatar Button */}
              <Button
                variant="ghost"
                className={cn(
                  "relative h-10 w-10 p-0 hover:bg-accent transition-colors duration-200",
                  activeDropdown === "avatar" && "bg-accent",
                )}
                onClick={() => toggleDropdown("avatar")}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                  <AvatarFallback>
                    <User className="size-4" />
                  </AvatarFallback>
                </Avatar>
                {/* Active Indicator Circle */}
                {activeDropdown === "avatar" && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                )}
              </Button>
            </div>
          </div>
        </nav>
      </div>

      {/* Full Width Dropdowns */}
      {activeDropdown && (
        <div className="absolute top-full left-0 w-full z-50 px-4">
          <div
            className={cn(
              "bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 rounded-2xl shadow-lg mx-auto max-w-sm",
              activeDropdown !== "cart" && "border",
            )}
          >
            {/* Menu Dropdown */}
            {activeDropdown === "menu" && (
              <div className="p-4 space-y-4">
                <div className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <UtensilsCrossed className="size-4" />
                  Menu Categories
                </div>

                {/* Loading State */}
                {isLoading && (
                  <div className="grid grid-cols-2 gap-3">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-20 bg-muted/50 rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="text-center py-6">
                    <p className="text-destructive text-sm">
                      Failed to load categories
                    </p>
                    <Link
                      href="/admin/inventory"
                      className="text-primary text-sm underline mt-2 inline-block"
                      onClick={closeDropdowns}
                    >
                      Go to Inventory
                    </Link>
                  </div>
                )}

                {/* Menu Items Grid */}
                {!isLoading && !error && (
                  <div className="grid grid-cols-2 gap-3">
                    {dynamicMenuItems.map((item) => {
                      const isActive = pathname.startsWith(item.url);
                      return (
                        <Link
                          key={item.url}
                          href={item.url}
                          className={cn(
                            "group relative flex flex-col items-center justify-center p-4 rounded-xl",
                            "bg-gradient-to-br from-card to-card/80",
                            "border border-border/50",
                            "backdrop-blur-sm",
                            "transition-all duration-200",
                            "hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20",
                            "hover:scale-[1.02] hover:border-primary/30",
                            "active:scale-[0.98]",
                            "transform-gpu touch-manipulation",
                            isActive &&
                              "bg-primary/10 border-primary/50 shadow-md",
                          )}
                          onClick={closeDropdowns}
                        >
                          {/* Icon */}
                          <div className="text-2xl mb-2 transform group-hover:scale-110 transition-transform duration-200">
                            {item.icon}
                          </div>

                          {/* Title */}
                          <span
                            className={cn(
                              "text-xs font-medium text-center leading-tight transition-colors duration-200",
                              isActive
                                ? "text-primary font-semibold"
                                : "text-foreground/80 group-hover:text-primary",
                            )}
                          >
                            {item.title}
                          </span>

                          {/* Hover Glow Effect */}
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </Link>
                      );
                    })}
                  </div>
                )}
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
                    href="/admin/settings"
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full ${
                      pathname?.startsWith("/admin/settings")
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-primary/10 hover:text-primary"
                    }`}
                    onClick={closeDropdowns}
                  >
                    <Settings className="size-4" />
                    <span>{t("nav.settings")}</span>
                  </Link>

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
                    <span>{t("nav.orders")}</span>
                  </Link>

                  <Link
                    href="/admin/inventory"
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full ${
                      pathname?.startsWith("/admin/inventory")
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-primary/10 hover:text-primary"
                    }`}
                    onClick={closeDropdowns}
                  >
                    <Package className="size-4" />
                    <span>{t("nav.inventory")}</span>
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
                    <span>{t("nav.customers")}</span>
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
                    <span>{t("nav.users")}</span>
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
                    <span>{t("nav.reports")}</span>
                  </Link>

                  <div className="border-t border-border my-2"></div>

                  <button
                    onClick={() => {
                      toggleLocale();
                      closeDropdowns();
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors w-full text-start"
                  >
                    <Languages className="size-4" />
                    <span>{locale === "en" ? "عربي" : "English"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setTheme(theme === "dark" ? "light" : "dark");
                      closeDropdowns();
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors w-full text-start"
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun className="size-4" />
                        <span>{t("nav.lightMode")}</span>
                      </>
                    ) : (
                      <>
                        <Moon className="size-4" />
                        <span>{t("nav.darkMode")}</span>
                      </>
                    )}
                  </button>

                  <div className="border-t border-border my-2"></div>

                  <button
                    onClick={() => {
                      closeDropdowns();
                      handleLogout();
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors w-full text-start text-destructive"
                  >
                    <LogOut className="size-4" />
                    <span>{t("nav.logout")}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Cart Dropdown */}
            {activeDropdown === "cart" && (
              <div className="p-0 overflow-hidden rounded-2xl border border-border">
                <div className="max-h-[85vh] overflow-y-auto">
                  <CartPanel
                    sidebarMode
                    onClose={() => setActiveDropdown(null)}
                  />
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
