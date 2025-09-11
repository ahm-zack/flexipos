import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { LogOut, Store, Users, Calendar } from "lucide-react";
import Link from "next/link";
import { User } from "@/lib/db";

interface NavbarProps {
  logoutAction: () => Promise<void>;
  currentUser?: User | null;
}

export function Navbar({ logoutAction, currentUser }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <Link className="flex items-center space-x-2" href="/admin/pizza">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Store className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight">POS Dashboard</h1>
            <p className="text-xs text-muted-foreground">
              Point of Sale System
            </p>
          </div>
        </Link>

        <div className="flex items-center space-x-4">
          {currentUser?.role === "superadmin" && (
            <>
              <Link href="/admin/users">
                <Button variant="ghost" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </Button>
              </Link>
              <Link href="/admin/events">
                <Button variant="ghost" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Events
                </Button>
              </Link>
            </>
          )}
        </div>

        <div>
          <span className="font-bold">Welcome: </span>
          {currentUser?.name}
        </div>

        <div className="flex items-center space-x-2">
          <ModeToggle />
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </form>
        </div>
      </div>
    </nav>
  );
}
