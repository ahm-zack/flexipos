import { Skeleton } from "@/components/ui/skeleton";

export function MiniPieCardSkeleton() {
  return (
    <div className="bg-card rounded-lg shadow-lg overflow-hidden">
      {/* Image skeleton */}
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Content skeleton */}
      <div className="p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          {/* Title skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-5 w-2/3" />
          </div>

          {/* Size badge skeleton */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
          </div>

          {/* Price skeleton */}
          <Skeleton className="h-8 w-1/3" />

          {/* Buttons skeleton */}
          <div className="flex gap-2 sm:gap-3 pt-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MiniPieGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <MiniPieCardSkeleton key={index} />
      ))}
    </div>
  );
}
