import { useState, useEffect } from 'react';
import PageHeader from '@/components/base/PageHeader';
import { apiClient } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';

export default function Reconciliation() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/reconciliation/stats/today');
      setStats(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load reconciliation stats.");
    } finally {
      setLoading(false);
    }
  };

  const handleRunReconciliation = async () => {
    if (!window.confirm("Are you sure you want to run end-of-day reconciliation now?")) return;
    try {
      setRunning(true);
      setError(null);
      setSuccess(null);
      const res = await apiClient.post('/reconciliation/run', {
        notes: "Manual end of day run."
      });
      setSuccess("Reconciliation completed successfully.");
      setStats(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to run reconciliation.");
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
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
        <p className="text-sm text-foreground-500">
          History will be populated here via GET /api/v1/reconciliation.
        </p>
      </div>
    </div>
  );
}
