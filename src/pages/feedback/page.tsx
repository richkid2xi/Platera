import { useState } from 'react';
import PageHeader from '@/components/base/PageHeader';
import PageSkeleton from '@/components/base/PageSkeleton';
import CustomSelect from '@/components/base/CustomSelect';
import { useRefresh } from '@/contexts/RefreshContext';
import { feedbackEntries, insightBanners } from '@/mocks/feedback';

export default function Feedback() {
  const { isRefreshing } = useRefresh();
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [entries, setEntries] = useState(feedbackEntries);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filtered = entries.filter((entry) => {
    if (ratingFilter !== null && entry.rating !== ratingFilter) return false;
    if (statusFilter === 'reviewed' && !entry.reviewed) return false;
    if (statusFilter === 'unreviewed' && entry.reviewed) return false;
    if (search && !entry.comment.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleReviewed = (id: number) => {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, reviewed: !e.reviewed } : e));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i key={i} className={`text-sm ${i < rating ? 'ri-star-fill text-primary-500' : 'ri-star-fill text-foreground-200 dark:text-foreground-700'}`}></i>
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'bg-secondary-50 text-secondary-600 border-secondary-200 dark:bg-secondary-900/20 dark:text-secondary-400 dark:border-secondary-800/50';
    if (rating === 3) return 'bg-primary-50 text-primary-600 border-primary-200 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-800/50';
    return 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50';
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/50';
      case 'warning': return 'border-primary-200 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-800/50';
      case 'info': return 'border-secondary-200 bg-secondary-50 dark:bg-secondary-900/20 dark:border-secondary-800/50';
      default: return 'border-background-200 bg-background-50';
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (isRefreshing) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Feedback & Reviews"
        description="Review ratings, manage responses, and track satisfaction trends"
      />

      {/* Insight Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {insightBanners.map((banner, i) => (
          <div key={banner.id} className={`stagger-${i + 1} flex items-start gap-3 p-4 rounded-xl border ${getInsightColor(banner.type)}`}>
            <div className="w-9 h-9 rounded-lg bg-white dark:bg-foreground-800 flex items-center justify-center flex-shrink-0">
              <i className={`${banner.icon} text-lg ${banner.type === 'critical' ? 'text-red-500' : banner.type === 'warning' ? 'text-primary-500' : 'text-secondary-500'}`}></i>
            </div>
            <p className="text-sm text-foreground-700 dark:text-foreground-300 font-body leading-relaxed">{banner.message}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center">
        <div className="relative flex-1 w-full max-w-sm">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400 text-sm"></i>
          <input
            type="text"
            placeholder="Search reviews or reviewers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-body"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none sm:w-40">
            <CustomSelect
              value={ratingFilter === null ? 'all' : ratingFilter.toString()}
              onChange={(val) => setRatingFilter(val === 'all' ? null : Number(val))}
              options={[
                { label: 'All Ratings', value: 'all' },
                { label: '5 Stars', value: '5' },
                { label: '4 Stars', value: '4' },
                { label: '3 Stars', value: '3' },
                { label: '2 Stars', value: '2' },
                { label: '1 Star', value: '1' }
              ]}
            />
          </div>

          <div className="flex-1 sm:flex-none sm:w-40">
            <CustomSelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { label: 'All Status', value: 'all' },
                { label: 'Reviewed', value: 'reviewed' },
                { label: 'Unreviewed', value: 'unreviewed' }
              ]}
            />
          </div>

          <button
            onClick={() => { setRatingFilter(null); setSearch(''); setStatusFilter('all'); }}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-background-100 dark:bg-foreground-800 text-foreground-600 dark:text-foreground-300 hover:bg-background-200 dark:hover:bg-foreground-700 transition-all cursor-pointer font-body whitespace-nowrap"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Feedback Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-800">
            <div className="w-16 h-16 rounded-2xl bg-background-100 dark:bg-foreground-800 flex items-center justify-center mb-4">
              <i className="ri-chat-smile-2-line text-2xl text-foreground-400"></i>
            </div>
            <p className="text-sm font-medium text-foreground-400 font-body">No feedback matches your filters</p>
          </div>
        ) : (
          paginated.map((entry, i) => (
            <div
              key={entry.id}
              className={`stagger-${Math.min(i + 1, 8)} bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-800 hover-lift`}
            >
              <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-bold text-foreground-900 dark:text-foreground-100 font-heading bg-background-100 dark:bg-foreground-800 px-2 py-0.5 rounded-md">Review #{entry.id}</span>
                        <span className="text-xs font-semibold text-foreground-500 font-body">· Table {entry.table}</span>
                        <span className="text-xs text-foreground-400 font-body">· {formatDate(entry.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">{renderStars(entry.rating)}</div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border font-body ${getRatingColor(entry.rating)}`}>
                          {entry.rating}/5
                        </span>
                        {entry.flagged && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50 font-body">
                            <i className="ri-flag-line mr-1"></i>Flagged
                          </span>
                        )}
                        {entry.reviewed && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary-50 text-secondary-600 border border-secondary-200 dark:bg-secondary-900/20 dark:text-secondary-400 dark:border-secondary-800/50 font-body">
                            <i className="ri-check-line mr-1"></i>Reviewed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleReviewed(entry.id)}
                    className={`self-start px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap font-body ${
                      entry.reviewed
                        ? 'bg-background-100 dark:bg-foreground-800 text-foreground-500 hover:bg-background-200 dark:hover:bg-foreground-700'
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                    }`}
                  >
                    {entry.reviewed ? 'Mark Unreviewed' : 'Mark Reviewed'}
                  </button>
                </div>

                <p className="text-sm text-foreground-600 dark:text-foreground-300 mb-3 leading-relaxed font-body">
                  {expandedId === entry.id ? entry.comment : (entry.comment.length > 180 ? entry.comment.slice(0, 180) + '...' : entry.comment)}
                  {entry.comment.length > 180 && (
                    <button
                      onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                      className="ml-1 text-primary-500 hover:text-primary-600 font-semibold cursor-pointer whitespace-nowrap"
                    >
                      {expandedId === entry.id ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {entry.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-0.5 text-xs rounded-full bg-background-100 dark:bg-foreground-800 text-foreground-500 font-body">
                      {tag}
                    </span>
                  ))}
                </div>

                {entry.itemRatings.length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-3 border-t border-background-100 dark:border-foreground-800">
                    {entry.itemRatings.map((ir, j) => (
                      <div key={j} className="flex items-center gap-1.5">
                        <span className="text-xs text-foreground-500 font-body">{ir.item}</span>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }, (_, k) => (
                            <i key={k} className={`text-[10px] ${k < ir.rating ? 'ri-star-fill text-primary-500' : 'ri-star-fill text-foreground-200 dark:text-foreground-700'}`}></i>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-background-200 dark:border-foreground-800 pt-6">
          <p className="text-sm text-foreground-500 font-body">
            Showing <span className="font-semibold text-foreground-900 dark:text-foreground-100">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-foreground-900 dark:text-foreground-100">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="font-semibold text-foreground-900 dark:text-foreground-100">{filtered.length}</span> reviews
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-background-200 dark:border-foreground-800 text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-body"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-background-200 dark:border-foreground-800 text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-body"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}