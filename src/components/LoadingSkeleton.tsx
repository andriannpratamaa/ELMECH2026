export default function LoadingSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-[20px] overflow-hidden bg-white border border-gray-100 shadow-sm animate-pulse">
          <div className="h-48 bg-gray-200" />
          <div className="p-5 space-y-3">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
            <div className="h-3 w-full bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
