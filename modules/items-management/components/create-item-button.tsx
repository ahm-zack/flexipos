"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreateItemButtonProps {
  onClick: () => void;
  className?: string;
}

export function CreateItemButton({
  onClick,
  className,
}: CreateItemButtonProps) {
  return (
    <Button onClick={onClick} className={className} size="default">
      <Plus className="size-4 mr-2" />
      Create Item
    </Button>
  );
}
