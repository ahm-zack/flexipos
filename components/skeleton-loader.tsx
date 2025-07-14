export function SkeletonLoader() {
  return (
    <div className="animate-pulse">
      <div className="flex space-x-4 p-4">
        {/* Avatar skeleton */}
        <div className="rounded-full bg-gray-200 h-10 w-10"></div>
        <div className="flex-1 space-y-2">
          {/* Name skeleton */}
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          {/* Email skeleton */}
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}

export function UserInfoSkeleton() {
  return (
    <div className="flex items-center gap-2 px-2 py-1 text-left text-sm">
      <div className="animate-pulse flex space-x-2 items-center">
        <div className="rounded-full bg-gray-200 h-8 w-8"></div>
        <div className="space-y-1">
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-2 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
}
