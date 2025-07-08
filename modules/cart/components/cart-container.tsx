"use client";

import { CartBadge } from "./cart-badge";
import { CartPanel } from "./cart-panel-old";
import { cn } from "@/lib/utils";

interface CartContainerProps {
  className?: string;
}

export function CartContainer({ className }: CartContainerProps) {
  return (
    <>
      {/* Floating Cart Badge - Fixed position */}
      <div
        className={cn(
          "fixed top-6 right-6 z-30",
          "lg:top-8 lg:right-8",
          className
        )}
      >
        <CartBadge />
      </div>

      {/* Slide-out Cart Panel */}
      <CartPanel />
    </>
  );
}
