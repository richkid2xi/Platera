import { liveOrdersSummary } from '@/mocks/dashboard';
import { Link } from 'react-router-dom';

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
    <div className="bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-700 p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-foreground-900 dark:text-foreground-100 text-base">Live Orders</h3>
        <Link to="/orders" className="text-xs text-primary-500 font-medium hover:text-primary-600 cursor-pointer whitespace-nowrap">
          View all <i className="ri-arrow-right-line ml-0.5"></i>
        </Link>
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-16 h-16 bg-background-100 dark:bg-foreground-800 rounded-full flex items-center justify-center mb-3">
            <i className="ri-inbox-line text-3xl text-foreground-400"></i>
          </div>
          <h4 className="text-foreground-900 dark:text-foreground-100 font-medium font-heading">No Live Orders</h4>
          <p className="text-sm text-foreground-500 mt-1 font-body">Waiting for new orders to arrive.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 bg-background-50 dark:bg-foreground-800/50 rounded-lg p-3 text-center">
              <span className="text-2xl font-bold text-foreground-950 dark:text-foreground-100 font-heading">{total}</span>
              <p className="text-xs text-foreground-400 mt-0.5 font-body">Total</p>
            </div>
            {statuses.map((s) => {
              const count = liveOrdersSummary[s.key as keyof typeof liveOrdersSummary];
              return (
                <div key={s.key} className="flex-1 bg-background-50 dark:bg-foreground-800/50 rounded-lg p-3 text-center group-hover:bg-white dark:group-hover:bg-foreground-800 transition-colors shadow-sm">
                  <span className="text-lg font-bold text-foreground-800 dark:text-foreground-200 font-heading">{count}</span>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <span className={`w-2 h-2 rounded-full shadow-sm ${s.color}`}></span>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-foreground-500 dark:text-foreground-400 font-body">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mini progress bar */}
          <div className="flex h-2.5 rounded-full overflow-hidden bg-background-100 dark:bg-foreground-800 shadow-inner">
            {statuses.map((s) => {
              const count = liveOrdersSummary[s.key as keyof typeof liveOrdersSummary];
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div
                  key={s.key}
                  className={`${s.color} transition-all duration-500 hover:brightness-110 cursor-pointer`}
                  style={{ width: `${pct}%` }}
                  title={`${s.label}: ${count}`}
                ></div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}