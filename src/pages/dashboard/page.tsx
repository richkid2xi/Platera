import { useState, useEffect } from 'react';
import { useRefresh } from '@/contexts/RefreshContext';
import { useAuth } from '@/contexts/AuthContext';
import MetricCard from '@/components/base/MetricCard';
import PageHeader from '@/components/base/PageHeader';
import LiveOrdersWidget from './components/LiveOrdersWidget';
import LowStockWidget from './components/LowStockWidget';
import FeedbackWidget from './components/FeedbackWidget';
import SalesChart from './components/SalesChart';
import BestSeller from './components/BestSeller';
import { MetricCardSkeleton, WidgetSkeleton } from './components/DashboardSkeletons';
import OnboardingWidget from './components/OnboardingWidget';
import { apiClient } from '@/api/client';

export default function Dashboard() {
  const { isRefreshing: isLoadingContext } = useRefresh();
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'there';
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/dashboard/metrics').then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isLoadingContext]);

  const isLoading = isLoadingContext || loading;

  const cards = data?.metrics ? [
    { id: '1', title: 'Total Revenue', value: `GH₵ ${data.metrics.revenue.toFixed(2)}`, change: data.metrics.revenueChange, trend: 'up' as const, icon: 'ri-money-dollar-circle-line', color: 'text-primary-500', bg: 'bg-primary-500/10' },
    { id: '2', title: 'Orders', value: data.metrics.orders.toString(), change: data.metrics.ordersChange, trend: 'up' as const, icon: 'ri-shopping-bag-3-line', color: 'text-accent-500', bg: 'bg-accent-500/10' },
    { id: '3', title: 'Active Tables', value: data.metrics.activeTables.toString(), change: data.metrics.activeTablesChange, trend: 'neutral' as const, icon: 'ri-restaurant-line', color: 'text-secondary-500', bg: 'bg-secondary-500/10' },
    { id: '4', title: 'Total Customers', value: data.metrics.totalCustomers.toString(), change: data.metrics.totalCustomersChange, trend: 'up' as const, icon: 'ri-group-line', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ] : [];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${firstName}. Here is what is happening at Platera today.`}
      />

      <OnboardingWidget />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
          : cards.map((card) => <MetricCard key={card.id} {...card} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Row 1 */}
        <div className="lg:col-span-2">
          {isLoading ? <WidgetSkeleton className="min-h-[250px]" /> : <LiveOrdersWidget />}
        </div>

        {/* Row 2 */}
        {isLoading ? <WidgetSkeleton className="h-full min-h-[300px]" /> : <SalesChart data={data?.salesTrend} />}
        {isLoading ? <WidgetSkeleton className="h-full min-h-[300px]" /> : <LowStockWidget />}

        {/* Row 3 */}
        {isLoading ? <WidgetSkeleton className="h-full min-h-[300px]" /> : <BestSeller data={data?.bestSellers} />}
        {isLoading ? <WidgetSkeleton className="h-full min-h-[300px]" /> : <FeedbackWidget />}
      </div>
    </div>
  );
}