"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  UtensilsCrossed,
  ChevronDown,
  Grid3X3,
  Languages,
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
import { useLocale, useTranslations } from "next-intl";
import { useCategories } from "@/hooks/useCategories";
import { logout } from "@/app/logout/actions";

interface ModernAdminNavbarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  } | null;
}

export function DynamicDesktopAdminNavbar({ user }: ModernAdminNavbarProps) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const tMenu = useTranslations("menu");
  const [isMenuExpanded, setIsMenuExpanded] = React.useState(false);

  const logOut = () => {
    logout();
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
          title: "Items",
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
  }, [categories, isLoading, error]);

  return (
    <div className="w-full p-4">
      <div className="w-full">
        {/* Top Navigation Bar */}
        <div className="bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 border rounded-full px-6 py-2 shadow-lg mb-4 w-full">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/admin" className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg shadow-md">
                <Command className="size-4" />
              </div>
              <span className="font-bold text-lg hidden xl:block">
                FlexiPOS
              </span>
            </Link>

            {/* Navigation Icons */}
            <div className="flex items-center gap-1">
              {/* Orders */}
              <Link
                href="/admin/orders"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
                  pathname?.startsWith("/admin/orders")
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                <ShoppingBag className="size-4" />
                <span className="text-sm font-medium hidden lg:inline">
                  {t("nav.orders")}
                </span>
              </Link>

              {/* Menu Categories Toggle */}
              <Button
                variant="ghost"
                onClick={() => setIsMenuExpanded(!isMenuExpanded)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
                  isMenuExpanded
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                <Grid3X3 className="size-4" />
                <span className="text-sm font-medium hidden lg:inline">
                  {t("nav.menu")}
                </span>
                <ChevronDown
                  className={`size-3 transition-transform duration-200 ${
                    isMenuExpanded ? "rotate-180" : ""
                  }`}
                />
              </Button>

              {/* Customers */}
              <Link
                href="/admin/customers"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
                  pathname?.startsWith("/admin/customers")
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                <UserCheck className="size-4" />
                <span className="text-sm font-medium hidden lg:inline">
                  {t("nav.customers")}
                </span>
              </Link>
            </div>

            {/* User Avatar - Moved to top bar */}
            <DropdownMenu dir={locale === "ar" ? "rtl" : "ltr"}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full hover:bg-primary/10 hover:border-primary/20 transition-colors duration-300"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user?.avatar}
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback>
                      <User className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
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
                    {t("nav.orders")}
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/admin/inventory"
                    className={`flex items-center gap-2 ${
                      pathname?.startsWith("/admin/inventory")
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                    }`}
                  >
                    <Package className="size-4" />
                    {t("nav.inventory")}
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
                    {t("nav.customers")}
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
                    {t("nav.users")}
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
                    {t("nav.reports")}
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                  {theme === "light" ? (
                    <>
                      <Moon className="size-4 me-2" />
                      {t("nav.darkMode")}
                    </>
                  ) : (
                    <>
                      <Sun className="size-4 me-2" />
                      {t("nav.lightMode")}
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={toggleLocale}>
                  <Languages className="size-4 me-2" />
                  {locale === "en" ? "عربي" : "English"}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Button
                    className="w-full"
                    onClick={logOut}
                    variant={"destructive"}
                  >
                    {t("nav.logout")}
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Collapsible Menu Categories */}
        {isMenuExpanded && (
          <div className="bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 border rounded-2xl p-6 shadow-lg animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="size-5 text-primary" />
                <h2 className="text-lg font-semibold">
                  {t("nav.menuCategories")}
                </h2>
                <span className="text-sm text-muted-foreground">
                  ({dynamicMenuItems.length} categories)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuExpanded(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronDown className="size-4" />
              </Button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 bg-muted/50 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-8">
                <p className="text-destructive mb-4">
                  {tMenu("failedLoadCategories")}
                </p>
                <Link
                  href="/admin/inventory"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Package className="size-4" />
                  {tMenu("goToInventory")}
                </Link>
              </div>
            )}

            {/* Menu Items Grid */}
            {!isLoading && !error && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {dynamicMenuItems.map((item) => {
                  const isActive = pathname.startsWith(item.url);
                  return (
                    <Link
                      key={item.url}
                      href={item.url}
                      className={`group relative flex flex-col items-center p-4 rounded-xl border transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
                        isActive
                          ? "bg-primary/10 border-primary/50 shadow-sm"
                          : "bg-card/50 border-border/50 hover:border-primary/30"
                      }`}
                      onClick={() => setIsMenuExpanded(false)}
                    >
                      {/* Category Icon */}
                      <div className="mb-2 text-2xl transform group-hover:scale-110 transition-transform duration-200">
                        {item.icon}
                      </div>

                      {/* Category Name */}
                      <span
                        className={`text-xs font-medium text-center leading-tight transition-colors duration-200 ${
                          isActive
                            ? "text-primary"
                            : "text-foreground group-hover:text-primary"
                        }`}
                      >
                        {item.title}
                      </span>

                      {/* Hover Glow */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
