import { Skeleton } from "@/components/ui/skeleton";

export function SandwichCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl shadow-lg overflow-hidden h-[480px] flex flex-col">
      {/* Image skeleton */}
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex-shrink-0">
        <Skeleton className="w-full h-full" rounded="" />
      </div>

      {/* Content skeleton */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="space-y-4 flex-1 flex flex-col">
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-5 w-2/3" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-8 w-1/3" />
          <div className="flex gap-3 pt-2 mt-auto">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SandwichGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SandwichCardSkeleton key={index} />
      ))}
    </div>
  );
}
