import { useState } from 'react';
import PageHeader from '@/components/base/PageHeader';
import PageSkeleton from '@/components/base/PageSkeleton';
import CustomSelect from '@/components/base/CustomSelect';
import { useRefresh } from '@/contexts/RefreshContext';
import { mockAuditLogs, type AuditLogEntry } from '@/mocks/audit';

export default function AuditLog() {
  const { isRefreshing } = useRefresh();
  const [logs] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [filterType, setFilterType] = useState('All Events');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === 'All Events' || log.actionType.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'ORDER': return 'ri-shopping-bag-line text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'SETTING': return 'ri-settings-3-line text-purple-500 bg-purple-50 dark:bg-purple-900/20';
      case 'MENU': return 'ri-restaurant-menu-line text-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'INVENTORY': return 'ri-archive-line text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
      case 'TABLE': return 'ri-restaurant-line text-amber-500 bg-amber-50 dark:bg-amber-900/20';
      default: return 'ri-list-check text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  if (isRefreshing) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Audit Log"
        description="Track all system events, orders, and administrative actions"
      >
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-background-200 dark:border-foreground-800 text-foreground-600 dark:text-foreground-300 text-sm font-semibold hover:bg-background-50 dark:hover:bg-foreground-800 transition-all font-body cursor-pointer">
          <i className="ri-download-2-line"></i> Export Log
        </button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400"></i>
          <input
            type="text"
            placeholder="Search events, users, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-sm font-body"
          />
        </div>
        <div className="w-full sm:w-48 z-20">
          <CustomSelect
            value={filterType}
            onChange={setFilterType}
            options={['All Events', 'Order', 'Setting', 'Menu', 'Inventory', 'Table']}
          />
        </div>
      </div>

      {/* Log List */}
      <div className="bg-white dark:bg-foreground-900 rounded-xl shadow-sm border border-background-200 dark:border-foreground-800 overflow-hidden">
        <div className="overflow-x-auto min-h-[60vh]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background-50 dark:bg-foreground-800/50 border-b border-background-200 dark:border-foreground-800">
                <th className="px-6 py-4 text-xs font-semibold text-foreground-500 dark:text-foreground-400 uppercase tracking-wider font-body whitespace-nowrap">Timestamp</th>
                <th className="px-6 py-4 text-xs font-semibold text-foreground-500 dark:text-foreground-400 uppercase tracking-wider font-body whitespace-nowrap">Actor</th>
                <th className="px-6 py-4 text-xs font-semibold text-foreground-500 dark:text-foreground-400 uppercase tracking-wider font-body whitespace-nowrap">Event</th>
                <th className="px-6 py-4 text-xs font-semibold text-foreground-500 dark:text-foreground-400 uppercase tracking-wider font-body">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-background-100 dark:divide-foreground-800/50">
              {filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((log) => (
                <tr key={log.id} className="hover:bg-background-50/50 dark:hover:bg-foreground-800/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-foreground-600 dark:text-foreground-400 font-body block">{formatDate(log.timestamp).split(', ')[0]}, {formatDate(log.timestamp).split(', ')[1]}</span>
                    <span className="text-xs text-foreground-400 dark:text-foreground-500 font-body">{formatDate(log.timestamp).split(', ')[2]}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 text-xs font-bold">
                        {log.actor.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-heading leading-none mb-1">{log.actor.name}</p>
                        <span className="text-xs text-foreground-500 font-body px-2 py-0.5 rounded-full bg-background-100 dark:bg-foreground-800">{log.actor.role}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActionIcon(log.actionType)}`}>
                        <i className={getActionIcon(log.actionType).split(' ')[0]}></i>
                      </div>
                      <span className="text-sm font-medium text-foreground-900 dark:text-foreground-100 font-body">
                        {log.action}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 max-w-md">
                      <span className="text-sm text-foreground-600 dark:text-foreground-300 font-body">
                        {log.details}
                      </span>
                      {log.metadata && log.actionType === 'ORDER' && (
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs px-2 py-1 rounded bg-secondary-50 dark:bg-secondary-900/20 text-secondary-600 dark:text-secondary-400 font-medium">Value: GH₵ {log.metadata.value.toFixed(2)}</span>
                          <span className="text-xs px-2 py-1 rounded bg-background-100 dark:bg-foreground-800 text-foreground-500 font-medium uppercase">{log.metadata.method}</span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-foreground-500 font-body text-sm">
                    No logs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredLogs.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-background-200 dark:border-foreground-800 flex items-center justify-between bg-background-50/50 dark:bg-foreground-900/30">
            <span className="text-sm text-foreground-500 font-body">
              Showing <span className="font-bold text-foreground-900 dark:text-foreground-100">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-foreground-900 dark:text-foreground-100">{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</span> of <span className="font-bold text-foreground-900 dark:text-foreground-100">{filteredLogs.length}</span> events
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg border border-background-200 dark:border-foreground-700 flex items-center justify-center text-foreground-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-50 dark:hover:bg-foreground-800 cursor-pointer transition-colors"
              >
                <i className="ri-arrow-left-s-line"></i>
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredLogs.length / itemsPerPage), p + 1))}
                disabled={currentPage === Math.ceil(filteredLogs.length / itemsPerPage)}
                className="w-8 h-8 rounded-lg border border-background-200 dark:border-foreground-700 flex items-center justify-center text-foreground-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-50 dark:hover:bg-foreground-800 cursor-pointer transition-colors"
              >
                <i className="ri-arrow-right-s-line"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
