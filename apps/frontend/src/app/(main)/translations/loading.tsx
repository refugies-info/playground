export default function Loading() {
  return (
    <div className="w-full h-full p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <Skeleton className="h-10 w-48" /> {/* Title */}
      </div>
      <div className="">
        <div className="border rounded mb-8 bg-white p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-10 w-full" /> {/* Filter */}
          </div>
        </div>
        <div className="space-y-4">
          {/* Table Skeleton */}
          <div className="border rounded-md bg-white">
            <div className="p-4 border-b">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/6" />
              </div>
            </div>
            {[...Array(5)].map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton list
                key={i}
                className="p-4 border-b last:border-0 flex justify-between items-center"
              >
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-1/6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}
