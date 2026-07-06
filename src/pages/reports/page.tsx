import { useState } from 'react';
import PageHeader from '@/components/base/PageHeader';
import PageSkeleton from '@/components/base/PageSkeleton';
import CustomSelect from '@/components/base/CustomSelect';
import { useRefresh } from '@/contexts/RefreshContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { salesData, dateRangeOptions } from '@/mocks/reports';

export default function Reports() {
  const { isRefreshing } = useRefresh();
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

  if (isRefreshing) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Sales & Reports"
        description="Analyze revenue, track performance, and export reports"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-40">
            <CustomSelect
              value={dateRange}
              onChange={(val) => setDateRange(val)}
              options={dateRangeOptions}
            />
          </div>
          <button className="px-4 py-2 text-xs font-semibold rounded-lg bg-secondary-500 text-white hover:bg-secondary-600 transition-all cursor-pointer whitespace-nowrap font-body">
            <i className="ri-download-2-line mr-1.5"></i>Export Report
          </button>
        </div>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            <BarChart data={salesData.daily} barSize={32} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} dy={8} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} dx={-4} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 13, backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                formatter={(value, name) => [name === 'revenue' ? formatCurrency(value as number) : (value as number), name === 'revenue' ? 'Revenue' : 'Orders']}
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
        <div className="bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-800 p-5 flex flex-col">
          <h3 className="text-base font-bold text-foreground-950 dark:text-foreground-100 font-heading mb-5">Category Breakdown</h3>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
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
                  formatter={(value) => [`${value as number}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
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

      {/* Financial & Payment Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-800 p-5">
          <h3 className="text-base font-bold text-foreground-950 dark:text-foreground-100 font-heading mb-5">Payment Methods</h3>
          <div className="space-y-5 mt-2">
            {salesData.paymentMethods.map((method) => (
              <div key={method.method}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-body">{method.method}</span>
                  <span className="text-sm font-bold text-foreground-600 dark:text-foreground-300 font-body">{method.value}%</span>
                </div>
                <div className="w-full h-2.5 bg-background-100 dark:bg-foreground-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${method.value}%`, backgroundColor: method.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-800 p-5 overflow-hidden flex flex-col">
          <h3 className="text-base font-bold text-foreground-950 dark:text-foreground-100 font-heading mb-4">Recent Transactions</h3>
          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            <div className="space-y-4">
              {salesData.recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-background-100 dark:bg-foreground-800 flex items-center justify-center text-foreground-600 dark:text-foreground-300">
                      <i className="ri-receipt-line text-lg"></i>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground-900 dark:text-foreground-100 font-body">{tx.item}</p>
                      <p className="text-xs text-foreground-500 font-body">{tx.qty} units • {tx.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground-900 dark:text-foreground-100 font-body">{tx.total}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tx.status === 'Completed' ? 'bg-secondary-50 text-secondary-600 dark:bg-secondary-900/30 dark:text-secondary-400' : 'bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400'}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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