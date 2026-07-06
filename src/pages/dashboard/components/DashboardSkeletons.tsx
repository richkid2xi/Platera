export function MetricCardSkeleton() {
  return (
    <div className="bg-white dark:bg-foreground-900 rounded-xl p-5 flex flex-col gap-3 border border-background-200 dark:border-foreground-700 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 bg-background-200 dark:bg-foreground-800 rounded"></div>
        <div className="w-10 h-10 rounded-lg bg-background-100 dark:bg-foreground-800"></div>
      </div>
      <div className="flex items-end gap-2 mt-1">
        <div className="h-8 w-24 bg-background-200 dark:bg-foreground-800 rounded"></div>
        <div className="h-4 w-12 bg-background-100 dark:bg-foreground-800 rounded mb-1"></div>
      </div>
      <div className="h-3 w-32 bg-background-100 dark:bg-foreground-800 rounded mt-1"></div>
    </div>
  );
}

export function WidgetSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-700 p-5 animate-pulse flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="h-5 w-32 bg-background-200 dark:bg-foreground-800 rounded"></div>
        <div className="h-4 w-16 bg-background-100 dark:bg-foreground-800 rounded"></div>
      </div>
      <div className="flex-1 flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-lg bg-background-100 dark:bg-foreground-800 flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-background-200 dark:bg-foreground-800 rounded"></div>
              <div className="h-3 w-1/2 bg-background-100 dark:bg-foreground-800 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
