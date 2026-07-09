import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SalesChart({ data }: { data?: any[] }) {
  const [view, setView] = useState<'revenue' | 'orders'>('revenue');

  const chartData = data || [];

  return (
    <div className="bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-700 p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-foreground-900 dark:text-foreground-100 text-base">Sales Trend</h3>
        <div className="flex bg-background-100 dark:bg-foreground-800 p-1 rounded-lg">
          <button 
            onClick={() => setView('revenue')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${view === 'revenue' ? 'bg-white dark:bg-foreground-700 text-primary-600 shadow-sm' : 'text-foreground-500 hover:text-foreground-700 dark:hover:text-foreground-300'}`}
          >
            Revenue
          </button>
          <button 
            onClick={() => setView('orders')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${view === 'orders' ? 'bg-white dark:bg-foreground-700 text-primary-600 shadow-sm' : 'text-foreground-500 hover:text-foreground-700 dark:hover:text-foreground-300'}`}
          >
            Orders
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-[200px]">
        {chartData.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-foreground-400">
            <i className="ri-bar-chart-2-line text-3xl mb-2"></i>
            <p className="text-sm">No sales data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [view === 'revenue' ? `GH₵ ${Number(value).toFixed(2)}` : value, view === 'revenue' ? 'Revenue' : 'Orders']}
              />
              <Bar 
                dataKey={view} 
                fill="#FF6B35" 
                radius={[4, 4, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}