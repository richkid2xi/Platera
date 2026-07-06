import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { salesTrend } from '@/mocks/dashboard';

export default function SalesChart() {
  const [view, setView] = useState<'revenue' | 'orders'>('revenue');

  return (
    <div className="bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-700 p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-foreground-900 dark:text-foreground-100 text-base">Sales Trend</h3>
        <div className="flex bg-background-100 dark:bg-foreground-800 rounded-full p-0.5">
          <button
            onClick={() => setView('revenue')}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all cursor-pointer whitespace-nowrap ${
              view === 'revenue' ? 'bg-white dark:bg-foreground-700 text-foreground-900 dark:text-foreground-100 shadow-sm' : 'text-foreground-400 hover:text-foreground-600'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setView('orders')}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all cursor-pointer whitespace-nowrap ${
              view === 'orders' ? 'bg-white dark:bg-foreground-700 text-foreground-900 dark:text-foreground-100 shadow-sm' : 'text-foreground-400 hover:text-foreground-600'
            }`}
          >
            Orders
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={salesTrend} barSize={28} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              tickFormatter={(v) => view === 'revenue' ? `${(v / 1000).toFixed(0)}k` : v.toString()}
              dx={-4}
            />
            <Tooltip
              cursor={{ fill: 'rgba(100, 100, 100, 0.05)' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const isRev = payload[0].dataKey === 'revenue';
                  return (
                    <div className="bg-white dark:bg-foreground-900 border border-background-200 dark:border-foreground-700 px-4 py-3 rounded-xl shadow-xl animate-scale-in">
                      <p className="text-foreground-500 dark:text-foreground-400 font-medium font-body text-xs mb-1 uppercase tracking-wider">{label}</p>
                      <p className="text-foreground-900 dark:text-foreground-100 font-bold font-heading text-base">
                        {isRev ? 'GH₵ ' : ''}{Number(payload[0].value).toLocaleString()} {isRev ? '' : 'Orders'}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey={view}
              fill="#FF6B35"
              radius={[6, 6, 0, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}