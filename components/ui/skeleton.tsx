import { cn } from "@/lib/utils";

function Skeleton({
  className,
  rounded = "rounded-md",
  ...props
}: React.ComponentProps<"div"> & { rounded?: string }) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse", className, rounded)}
      {...props}
    />
  );
}

export { Skeleton };
