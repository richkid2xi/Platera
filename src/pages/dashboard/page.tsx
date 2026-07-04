import { metricCards } from '@/mocks/dashboard';
import MetricCard from '@/components/base/MetricCard';
import LiveOrdersWidget from './components/LiveOrdersWidget';
import LowStockWidget from './components/LowStockWidget';
import FeedbackWidget from './components/FeedbackWidget';
import SalesChart from './components/SalesChart';
import BestSeller from './components/BestSeller';

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground-950 dark:text-foreground-100 font-heading">Dashboard</h1>
          <p className="text-sm text-foreground-400 mt-1 font-body">
            Welcome back, Kwame. Here is what is happening at Platera today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground-400 bg-background-100 dark:bg-foreground-800 px-3 py-1.5 rounded-full font-body">
            <i className="ri-calendar-line mr-1"></i> Today
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <MetricCard key={card.id} {...card} />
        ))}
      </div>

      {/* Middle Row: Orders + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <LiveOrdersWidget />
        </div>
        <div>
          <LowStockWidget />
        </div>
      </div>

      {/* Bottom Row: Chart + Best Sellers + Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div>
          <FeedbackWidget />
        </div>
      </div>

      {/* Best Sellers Full Width */}
      <div>
        <BestSeller />
      </div>
    </div>
  );
}