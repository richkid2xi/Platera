import { useQuery } from '@tanstack/react-query';
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
  
  const { data, isLoading: loading } = useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/metrics');
      return res.data;
    }
  });

  const isLoading = isLoadingContext || loading;

  const cards = data?.metrics ? [
    { id: '1', label: 'Total Revenue', value: `GH₵ ${data.metrics.revenue.toFixed(2)}`, trend: data.metrics.revenueChange, trendUp: data.metrics.revenueChange >= 0, vsLabel: 'vs last period', icon: 'ri-money-dollar-circle-line' },
    { id: '2', label: 'Orders', value: data.metrics.orders.toString(), trend: data.metrics.ordersChange, trendUp: data.metrics.ordersChange >= 0, vsLabel: 'vs last period', icon: 'ri-shopping-bag-3-line' },
    { id: '3', label: 'Active Tables', value: data.metrics.activeTables.toString(), trend: data.metrics.activeTablesChange, trendUp: data.metrics.activeTablesChange >= 0, vsLabel: 'vs last period', icon: 'ri-restaurant-line' },
    { id: '4', label: 'Total Customers', value: data.metrics.totalCustomers.toString(), trend: data.metrics.totalCustomersChange, trendUp: data.metrics.totalCustomersChange >= 0, vsLabel: 'vs last period', icon: 'ri-group-line' },
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