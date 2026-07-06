export default function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <div className="w-1/3 h-8 bg-background-200 dark:bg-foreground-800 rounded"></div>
        <div className="w-1/2 h-4 bg-background-100 dark:bg-foreground-800/50 rounded"></div>
      </div>
      
      {/* Filters/Toolbar Skeleton */}
      <div className="flex items-center gap-3 w-full">
        <div className="w-32 h-10 bg-background-200 dark:bg-foreground-800 rounded-lg"></div>
        <div className="w-24 h-10 bg-background-200 dark:bg-foreground-800 rounded-lg"></div>
        <div className="flex-1"></div>
        <div className="w-40 h-10 bg-background-200 dark:bg-foreground-800 rounded-lg"></div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 p-4 flex flex-col gap-3">
            <div className="w-12 h-12 rounded-full bg-background-200 dark:bg-foreground-800 mb-2"></div>
            <div className="w-3/4 h-5 bg-background-200 dark:bg-foreground-800 rounded"></div>
            <div className="w-1/2 h-4 bg-background-100 dark:bg-foreground-800/50 rounded"></div>
            <div className="flex-1"></div>
            <div className="flex justify-between items-center pt-2 border-t border-background-100 dark:border-foreground-800/50">
              <div className="w-16 h-4 bg-background-200 dark:bg-foreground-800 rounded"></div>
              <div className="w-8 h-8 rounded bg-background-200 dark:bg-foreground-800"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
