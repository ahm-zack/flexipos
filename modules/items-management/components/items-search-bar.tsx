"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ItemsSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

export function ItemsSearchBar({
  searchTerm,
  onSearchChange,
  placeholder = "Search items...",
}: ItemsSearchBarProps) {
  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 h-10"
      />
    </div>
  );
}
