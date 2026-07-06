import { metricCards } from '@/mocks/dashboard';
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

export default function Dashboard() {
  const { isRefreshing: isLoading } = useRefresh();
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${firstName}. Here is what is happening at Platera today.`}
      >
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 font-body">
          <i className="ri-test-tube-line text-xs"></i>Demo Data
        </span>
      </PageHeader>

      <OnboardingWidget />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
          : metricCards.map((card) => <MetricCard key={card.id} {...card} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Row 1 */}
        <div className="lg:col-span-2">
          {isLoading ? <WidgetSkeleton className="min-h-[250px]" /> : <LiveOrdersWidget />}
        </div>

        {/* Row 2 */}
        {isLoading ? <WidgetSkeleton className="h-full min-h-[300px]" /> : <SalesChart />}
        {isLoading ? <WidgetSkeleton className="h-full min-h-[300px]" /> : <LowStockWidget />}

        {/* Row 3 */}
        {isLoading ? <WidgetSkeleton className="h-full min-h-[300px]" /> : <BestSeller />}
        {isLoading ? <WidgetSkeleton className="h-full min-h-[300px]" /> : <FeedbackWidget />}
      </div>
    </div>
  );
}