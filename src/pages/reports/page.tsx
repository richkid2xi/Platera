import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { salesData, dateRangeOptions } from '@/mocks/reports';

export default function Reports() {
  const [dateRange, setDateRange] = useState('week');
  const [chartView, setChartView] = useState<'revenue' | 'orders'>('revenue');

  const COLORS = ['#FF6B35', '#FFC107', '#4DB696', '#BA9174'];

  const formatCurrency = (val: number) => `GH₵ ${val.toLocaleString()}`;

  const summaryCards = [
    { label: 'Total Revenue', value: salesData.summary.totalRevenue, change: salesData.summary.revenueChange, up: true, icon: 'ri-money-dollar-circle-line', color: 'text-secondary-500 bg-secondary-50 dark:bg-secondary-900/20' },
    { label: 'Total Orders', value: salesData.summary.totalOrders.toLocaleString(), change: salesData.summary.ordersChange, up: true, icon: 'ri-shopping-bag-3-line', color: 'text-primary-500 bg-primary-50 dark:bg-primary-900/20' },
    { label: 'Avg Order Value', value: salesData.summary.avgOrderValue, change: salesData.summary.avgChange, up: true, icon: 'ri-line-chart-line', color: 'text-accent-500 bg-accent-50 dark:bg-accent-900/20' },
    { label: 'Top Category', value: salesData.summary.topCategory, change: salesData.summary.topCategoryShare, up: true, icon: 'ri-restaurant-2-line', color: 'text-foreground-500 bg-background-100 dark:bg-foreground-800', upLabel: 'of revenue' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground-950 dark:text-foreground-100 font-heading">Sales & Reports</h1>
          <p className="text-sm text-foreground-500 dark:text-foreground-400 mt-1 font-body">Analyze revenue, track performance, and export reports</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {dateRangeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDateRange(opt.value)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap font-body ${
                dateRange === opt.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-foreground-900 text-foreground-600 dark:text-foreground-300 border border-background-200 dark:border-foreground-800 hover:bg-background-50 dark:hover:bg-foreground-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
          <button className="px-4 py-2 text-xs font-semibold rounded-lg bg-secondary-500 text-white hover:bg-secondary-600 transition-all cursor-pointer whitespace-nowrap font-body">
            <i className="ri-download-2-line mr-1.5"></i>Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {summaryCards.map((card, i) => (
          <div key={card.label} className={`stagger-${i + 1} bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-800 p-4 md:p-5 hover-lift`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                <i className={`${card.icon} text-lg`}></i>
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground-950 dark:text-foreground-100 font-heading">{card.value}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`text-xs font-semibold font-body ${card.up ? 'text-secondary-500' : 'text-red-500'}`}>
                <i className={`${card.up ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} text-xs`}></i> {card.change}
              </span>
              <span className="text-xs text-foreground-400 font-body">{card.upLabel || 'vs last period'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-800 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-foreground-950 dark:text-foreground-100 font-heading">Revenue Trend</h3>
            <div className="flex items-center gap-1 bg-background-100 dark:bg-foreground-800 rounded-lg p-0.5">
              <button
                onClick={() => setChartView('revenue')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap font-body ${chartView === 'revenue' ? 'bg-white dark:bg-foreground-700 text-foreground-950 dark:text-foreground-100 shadow-sm' : 'text-foreground-500'}`}
              >
                Revenue
              </button>
              <button
                onClick={() => setChartView('orders')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap font-body ${chartView === 'orders' ? 'bg-white dark:bg-foreground-700 text-foreground-950 dark:text-foreground-100 shadow-sm' : 'text-foreground-500'}`}
              >
                Orders
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={salesData.daily} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #F5E6DE)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#8A8D94' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#8A8D94' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #F5E6DE', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 13 }}
                formatter={(value: number, name: string) => [name === 'revenue' ? formatCurrency(value) : value, name === 'revenue' ? 'Revenue' : 'Orders']}
              />
              <Bar
                dataKey={chartView}
                radius={[6, 6, 0, 0]}
                fill="#FF6B35"
                className="transition-all duration-300"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-800 p-5">
          <h3 className="text-base font-bold text-foreground-950 dark:text-foreground-100 font-heading mb-5">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={salesData.categoryBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {salesData.categoryBreakdown.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 12, fontSize: 13 }}
                formatter={(value: number) => [`${value}%`, 'Share']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {salesData.categoryBreakdown.map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between text-sm font-body">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }}></span>
                  <span className="text-foreground-600 dark:text-foreground-300">{cat.name}</span>
                </div>
                <span className="font-semibold text-foreground-900 dark:text-foreground-100">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Best Sellers Table */}
        <div className="bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-800 p-5">
          <h3 className="text-base font-bold text-foreground-950 dark:text-foreground-100 font-heading mb-4">Best Selling Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs font-semibold text-foreground-400 uppercase tracking-wider font-body border-b border-background-200 dark:border-foreground-800">
                  <th className="text-left py-2.5 pr-3">Item</th>
                  <th className="text-left py-2.5 pr-3">Category</th>
                  <th className="text-right py-2.5 pr-3">Qty</th>
                  <th className="text-right py-2.5 pr-3">Revenue</th>
                  <th className="text-right py-2.5">Trend</th>
                </tr>
              </thead>
              <tbody>
                {salesData.bestSellersReport.map((item, i) => (
                  <tr key={item.id} className={`border-b border-background-100 dark:border-foreground-800 last:border-b-0 ${i % 2 === 0 ? '' : ''}`}>
                    <td className="py-3 pr-3">
                      <span className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-body">{item.name}</span>
                    </td>
                    <td className="py-3 pr-3">
                      <span className="text-xs text-foreground-400 font-body">{item.category}</span>
                    </td>
                    <td className="py-3 pr-3 text-right text-sm font-semibold text-foreground-600 dark:text-foreground-300 font-body">{item.quantity}</td>
                    <td className="py-3 pr-3 text-right text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-body">{item.revenue}</td>
                    <td className="py-3 text-right">
                      <span className={`text-xs font-semibold font-body ${item.trend.startsWith('+') ? 'text-secondary-500' : 'text-red-500'}`}>{item.trend}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table Performance */}
        <div className="bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-800 p-5">
          <h3 className="text-base font-bold text-foreground-950 dark:text-foreground-100 font-heading mb-4">Table Performance</h3>
          <div className="space-y-3">
            {salesData.tablePerformance.map((t) => (
              <div key={t.table} className="flex items-center justify-between py-2.5 border-b border-background-100 dark:border-foreground-800 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-background-100 dark:bg-foreground-800 flex items-center justify-center text-xs font-bold text-foreground-500 font-heading">
                    {t.table.replace('Table ', '')}
                  </div>
                  <span className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-body">{t.table}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-foreground-400 font-body">Orders</p>
                    <p className="text-sm font-semibold text-foreground-600 dark:text-foreground-300 font-body">{t.orders}</p>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="text-xs text-foreground-400 font-body">Revenue</p>
                    <p className="text-sm font-bold text-foreground-900 dark:text-foreground-100 font-body">{t.revenue}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}