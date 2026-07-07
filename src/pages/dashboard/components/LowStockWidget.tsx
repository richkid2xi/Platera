import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';

export default function LowStockWidget() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get('/inventory').then((res) => {
      const all = res.data || [];
      const low = all.filter((i: any) => Number(i.currentStock) <= Number(i.lowStockThreshold));
      setItems(low.slice(0, 5)); // show top 5 low stock
    }).catch(() => {});
  }, []);

  return (
    <div className="bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-700 p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-heading font-semibold text-foreground-900 dark:text-foreground-100 text-base">Low Stock Alerts</h3>
          <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
        <Link to="/inventory" className="text-xs text-primary-500 font-medium hover:text-primary-600 cursor-pointer whitespace-nowrap">
          Inventory <i className="ri-arrow-right-line ml-0.5"></i>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-3">
            <i className="ri-checkbox-circle-line text-3xl text-green-500"></i>
          </div>
          <h4 className="text-foreground-900 dark:text-foreground-100 font-medium font-heading">Stock is Healthy</h4>
          <p className="text-sm text-foreground-500 mt-1 font-body">All inventory items are well-stocked.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const stock = Number(item.currentStock);
            const threshold = Number(item.lowStockThreshold);
            const isCritical = stock <= threshold * 0.3;
            const stockPct = Math.min((stock / threshold) * 100, 100);
            return (
              <div key={item.id} className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-background-50 dark:hover:bg-foreground-800/50 transition-colors cursor-default">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isCritical ? 'bg-red-50 dark:bg-red-900/20' : 'bg-accent-50 dark:bg-accent-900/20'}`}>
                  <i className={`text-xl ${isCritical ? 'ri-error-warning-line text-red-500' : 'ri-alert-line text-accent-500'}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-foreground-800 dark:text-foreground-200 font-body truncate">{item.name}</span>
                    <span className={`text-xs font-bold whitespace-nowrap ml-2 px-1.5 py-0.5 rounded ${isCritical ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400'}`}>
                      {stock} / {threshold} {item.unit}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-background-100 dark:bg-foreground-800 overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isCritical ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-accent-400'}`}
                      style={{ width: `${stockPct}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}