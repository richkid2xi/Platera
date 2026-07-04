import { liveOrdersSummary } from '@/mocks/dashboard';

const statuses = [
  { key: 'new', label: 'New', color: 'bg-primary-500', icon: 'ri-add-circle-line' },
  { key: 'confirmed', label: 'Confirmed', color: 'bg-accent-500', icon: 'ri-check-double-line' },
  { key: 'preparing', label: 'Preparing', color: 'bg-amber-500', icon: 'ri-fire-line' },
  { key: 'ready', label: 'Ready', color: 'bg-secondary-500', icon: 'ri-check-line' },
  { key: 'served', label: 'Served', color: 'bg-foreground-300', icon: 'ri-restaurant-line' },
];

export default function LiveOrdersWidget() {
  const total = Object.values(liveOrdersSummary).reduce((sum, v) => sum + v, 0);

  return (
    <div className="bg-white dark:bg-foreground-900 rounded-lg border border-background-200 dark:border-foreground-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-foreground-900 dark:text-foreground-100 text-base">Live Orders</h3>
        <button className="text-xs text-primary-500 font-medium hover:text-primary-600 cursor-pointer whitespace-nowrap">
          View all <i className="ri-arrow-right-line ml-0.5"></i>
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 bg-background-50 dark:bg-foreground-800/50 rounded-lg p-3 text-center">
          <span className="text-2xl font-bold text-foreground-950 dark:text-foreground-100 font-heading">{total}</span>
          <p className="text-xs text-foreground-400 mt-0.5 font-body">Total</p>
        </div>
        {statuses.map((s) => {
          const count = liveOrdersSummary[s.key as keyof typeof liveOrdersSummary];
          return (
            <div key={s.key} className="flex-1 bg-background-50 dark:bg-foreground-800/50 rounded-lg p-3 text-center">
              <span className="text-lg font-bold text-foreground-800 dark:text-foreground-200 font-heading">{count}</span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${s.color}`}></span>
                <p className="text-xs text-foreground-400 font-body">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mini progress bar */}
      <div className="flex h-2 rounded-full overflow-hidden bg-background-100 dark:bg-foreground-800">
        {statuses.map((s) => {
          const count = liveOrdersSummary[s.key as keyof typeof liveOrdersSummary];
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <div
              key={s.key}
              className={`${s.color} transition-all duration-500`}
              style={{ width: `${pct}%` }}
              title={`${s.label}: ${count}`}
            ></div>
          );
        })}
      </div>
    </div>
  );
}