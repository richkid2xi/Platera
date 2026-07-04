import { lowStockItems } from '@/mocks/dashboard';

export default function LowStockWidget() {


  return (
    <div className="bg-white dark:bg-foreground-900 rounded-lg border border-background-200 dark:border-foreground-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-heading font-semibold text-foreground-900 dark:text-foreground-100 text-base">Low Stock Alerts</h3>
          <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold px-2 py-0.5 rounded-full">
            {lowStockItems.length}
          </span>
        </div>
        <button className="text-xs text-primary-500 font-medium hover:text-primary-600 cursor-pointer whitespace-nowrap">
          Inventory <i className="ri-arrow-right-line ml-0.5"></i>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {lowStockItems.map((item) => {
          const isCritical = item.stock <= item.threshold * 0.3;
          const stockPct = Math.min((item.stock / item.threshold) * 100, 100);
          return (
            <div key={item.id} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isCritical ? 'bg-red-500' : 'bg-accent-500'}`}></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground-800 dark:text-foreground-200 font-body truncate">{item.name}</span>
                  <span className={`text-xs font-semibold whitespace-nowrap ml-2 ${isCritical ? 'text-red-600 dark:text-red-400' : 'text-accent-700 dark:text-accent-400'}`}>
                    {item.stock} / {item.threshold} {item.unit}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-background-100 dark:bg-foreground-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isCritical ? 'bg-red-500' : 'bg-accent-400'}`}
                    style={{ width: `${stockPct}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}