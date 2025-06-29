import React from "react";
import { cn } from "@/lib/utils";

interface SaudiRiyalSymbolProps {
  className?: string;
  size?: number;
  variant?: "default" | "primary" | "muted" | "destructive";
}

export function SaudiRiyalSymbol({
  className = "",
  size = 16,
  variant = "default",
}: SaudiRiyalSymbolProps) {
  const variantClasses = {
    default: "fill-current",
    primary: "fill-primary",
    muted: "fill-muted-foreground",
    destructive: "fill-destructive",
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1124.14 1256.39"
      className={cn(
        "inline-block flex-shrink-0",
        variantClasses[variant],
        className
      )}
      aria-label="Saudi Riyal Symbol"
      role="img"
    >
      <path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z" />
      <path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z" />
    </svg>
  );
}

// Advanced price display component with better customization
interface PriceDisplayProps {
  price: number;
  symbolSize?: number;
  symbolPosition?: "before" | "after";
  variant?: "default" | "primary" | "muted" | "destructive";
  className?: string;
  symbolClassName?: string;
  showSymbolFirst?: boolean; // for backwards compatibility
}

export function PriceDisplay({
  price,
  symbolSize = 16,
  symbolPosition = "before",
  variant = "default",
  className = "",
  symbolClassName = "",
  showSymbolFirst = true, // backwards compatibility
}: PriceDisplayProps) {
  const formattedPrice = price.toFixed(2);
  const position =
    symbolPosition === "before"
      ? "before"
      : showSymbolFirst
      ? "before"
      : "after";

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {position === "before" && (
        <SaudiRiyalSymbol
          size={symbolSize}
          variant={variant}
          className={symbolClassName}
        />
      )}
      <span>{formattedPrice}</span>
      {position === "after" && (
        <SaudiRiyalSymbol
          size={symbolSize}
          variant={variant}
          className={symbolClassName}
        />
      )}
    </span>
  );
}

// Legacy utility function to format price with Saudi Riyal symbol (backwards compatibility)
export function formatSaudiPrice(price: number): string {
  return `${price.toFixed(2)} ر.س`;
}

// Function to format price with the official SVG symbol (backwards compatibility)
export function formatSaudiPriceWithSymbol(
  price: number,
  symbolSize: number = 16
): React.ReactElement {
  return (
    <PriceDisplay
      price={price}
      symbolSize={symbolSize}
      symbolPosition="before"
    />
  );
}

// Alternative text-based Saudi Riyal symbol (most commonly used)
export function SaudiRiyalText({ className = "" }: { className?: string }) {
  return <span className={className}>ر.س</span>;
}
