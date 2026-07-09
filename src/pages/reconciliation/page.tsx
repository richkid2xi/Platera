import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/base/PageHeader';
import { apiClient } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';

export default function Reconciliation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: todayData, isLoading: todayLoading } = useQuery({
    queryKey: ['reconciliation', 'today'],
    queryFn: async () => {
      const res = await apiClient.get('/reconciliation/stats/today');
      return res.data;
    }
  });

  const { data: historyData = [], isLoading: historyLoading } = useQuery({
    queryKey: ['reconciliation', 'history'],
    queryFn: async () => {
      const res = await apiClient.get('/reconciliation/history');
      return res.data;
    }
  });

  const stats = todayData;
  const history = historyData;

  const isLoading = todayLoading || historyLoading;

  const handleRunReconciliation = async () => {
    if (!window.confirm("Are you sure you want to run end-of-day reconciliation now?")) return;
    try {
      setRunning(true);
      setError(null);
      setSuccess(null);
      await apiClient.post('/reconciliation/run', {
        notes: "Manual end of day run."
      });
      setSuccess("Reconciliation completed successfully.");
      queryClient.invalidateQueries({ queryKey: ['reconciliation'] });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to run reconciliation.");
    } finally {
      setRunning(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading reconciliation data...</div>;
  }

  if (user?.role !== 'OWNER' && user?.role !== 'MANAGER') {
    return <div className="p-8 text-center text-red-500">You do not have permission to view this page.</div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="End of Day Reconciliation"
        description="Compare recorded sales against expected cash and resolve discrepancies."
      >
        <button 
          onClick={handleRunReconciliation}
          disabled={running}
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all disabled:opacity-50"
        >
          {running ? 'Running...' : 'Run Reconciliation'}
        </button>
      </PageHeader>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <i className="ri-error-warning-line"></i> {error}
        </div>
      )}

      {success && (
        <div className="bg-secondary-50 border border-secondary-200 text-secondary-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <i className="ri-check-line"></i> {success}
        </div>
      )}

      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-foreground-900 rounded-xl p-5 border border-background-200 dark:border-foreground-800">
            <h3 className="text-sm text-foreground-500 font-semibold mb-2">Total System Revenue</h3>
            <p className="text-3xl font-black font-heading text-foreground-900 dark:text-foreground-100">
              GH₵ {stats.totalRevenue || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-foreground-900 rounded-xl p-5 border border-background-200 dark:border-foreground-800">
            <h3 className="text-sm text-foreground-500 font-semibold mb-2">Expected Cash</h3>
            <p className="text-3xl font-black font-heading text-secondary-500">
              GH₵ {stats.expectedCash || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-foreground-900 rounded-xl p-5 border border-background-200 dark:border-foreground-800">
            <h3 className="text-sm text-foreground-500 font-semibold mb-2">Expected Digital</h3>
            <p className="text-3xl font-black font-heading text-accent-500">
              GH₵ {stats.expectedDigital || 0}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl text-center text-foreground-500 border border-dashed border-background-200">
          No stats available for today yet.
        </div>
      )}

      <div className="bg-white dark:bg-foreground-900 rounded-xl p-5 border border-background-200 dark:border-foreground-800">
        <h3 className="font-heading font-bold text-lg mb-4">Past Reconciliations</h3>
        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-background-200 dark:border-foreground-800 text-foreground-500 text-sm font-semibold uppercase tracking-wide font-body">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Revenue</th>
                  <th className="pb-3 pr-4">Orders</th>
                  <th className="pb-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((rec: any) => (
                  <tr key={rec.id} className="border-b border-background-100 dark:border-foreground-800/50 last:border-b-0 hover:bg-background-50 dark:hover:bg-foreground-800/20 transition-colors">
                    <td className="py-3 pr-4 text-sm font-semibold text-foreground-900 dark:text-foreground-100">
                      {new Date(rec.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 pr-4 text-sm text-foreground-700 dark:text-foreground-300">
                      GH₵ {rec.totalRevenue}
                    </td>
                    <td className="py-3 pr-4 text-sm text-foreground-700 dark:text-foreground-300">
                      {rec.totalOrdersCount}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                        rec.status === 'RECONCILED' 
                          ? 'bg-secondary-50 text-secondary-600 dark:bg-secondary-900/30 dark:text-secondary-400' 
                          : 'bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400'
                      }`}>
                        {rec.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-foreground-500 py-8 text-center border border-dashed border-background-200 dark:border-foreground-800 rounded-lg">
            No past reconciliations found. Run a reconciliation at the end of the day to see history here.
          </p>
        )}
      </div>
    </div>
  );
}
