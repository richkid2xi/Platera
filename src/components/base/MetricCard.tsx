interface MetricCardProps {
  label: string;
  value: string;
  trend: number;
  trendUp: boolean;
  vsLabel: string;
  icon: string;
}

export default function MetricCard({ label, value, trend, trendUp, vsLabel, icon }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-foreground-900 rounded-lg p-5 flex flex-col gap-3 border border-background-200 dark:border-foreground-700 hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200 cursor-default animate-fade-in-up">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground-500 dark:text-foreground-400 font-body">{label}</span>
        <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
          <i className={`${icon} text-primary-500 text-lg`}></i>
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-foreground-950 dark:text-foreground-100 font-heading">{value}</span>
        <div className={`flex items-center gap-0.5 text-sm font-medium ${trendUp ? 'text-secondary-600 dark:text-secondary-400' : 'text-red-500 dark:text-red-400'}`}>
          <i className={`${trendUp ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} text-base`}></i>
          <span>{trend}%</span>
        </div>
      </div>
      <span className="text-xs text-foreground-400 dark:text-foreground-500 font-body">{vsLabel}</span>
    </div>
  );
}