"use client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

import { useSearchStore } from "../../../../hooks/useSearchStore";
// import { usePathname } from "next/navigation";

export default function SandwichCashierViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setSearchTerm, searchTerm } = useSearchStore();

  // const pathname = usePathname();
  // const currentHeader = [{ pathname: '', header: '', desc: '', placeholder: '' }].find(headerItem => headerItem.pathname === pathname)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-center">
            🥪 Sandwich Menu
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground text-center mb-4 sm:mb-6">
            Discover our delicious sandwich selection
          </p>

          {/* Search Bar */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sandwiches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
