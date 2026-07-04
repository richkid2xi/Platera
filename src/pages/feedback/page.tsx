import { useState } from 'react';
import { feedbackEntries, insightBanners } from '@/mocks/feedback';

export default function Feedback() {
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [showReviewed, setShowReviewed] = useState(true);
  const [showUnreviewed, setShowUnreviewed] = useState(true);
  const [search, setSearch] = useState('');
  const [entries, setEntries] = useState(feedbackEntries);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = entries.filter((entry) => {
    if (ratingFilter !== null && entry.rating !== ratingFilter) return false;
    if (!showReviewed && entry.reviewed) return false;
    if (!showUnreviewed && !entry.reviewed) return false;
    if (search && !entry.comment.toLowerCase().includes(search.toLowerCase()) && !entry.reviewer.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleReviewed = (id: number) => {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, reviewed: !e.reviewed } : e));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i key={i} className={`text-sm ${i < rating ? 'ri-star-fill text-accent-500' : 'ri-star-fill text-foreground-200 dark:text-foreground-700'}`}></i>
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'bg-secondary-50 text-secondary-600 border-secondary-200 dark:bg-secondary-900/20 dark:text-secondary-400 dark:border-secondary-800/50';
    if (rating === 3) return 'bg-accent-50 text-accent-600 border-accent-200 dark:bg-accent-900/20 dark:text-accent-400 dark:border-accent-800/50';
    return 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50';
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/50';
      case 'warning': return 'border-accent-200 bg-accent-50 dark:bg-accent-900/20 dark:border-accent-800/50';
      case 'info': return 'border-secondary-200 bg-secondary-50 dark:bg-secondary-900/20 dark:border-secondary-800/50';
      default: return 'border-background-200 bg-background-50';
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground-950 dark:text-foreground-100 font-heading">Customer Feedback</h1>
          <p className="text-sm text-foreground-500 dark:text-foreground-400 mt-1 font-body">Review ratings, manage responses, and track satisfaction trends</p>
        </div>
      </div>

      {/* Insight Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {insightBanners.map((banner, i) => (
          <div key={banner.id} className={`stagger-${i + 1} flex items-start gap-3 p-4 rounded-xl border ${getInsightColor(banner.type)}`}>
            <div className="w-9 h-9 rounded-lg bg-white dark:bg-foreground-800 flex items-center justify-center flex-shrink-0">
              <i className={`${banner.icon} text-lg ${banner.type === 'critical' ? 'text-red-500' : banner.type === 'warning' ? 'text-accent-500' : 'text-secondary-500'}`}></i>
            </div>
            <p className="text-sm text-foreground-700 dark:text-foreground-300 font-body leading-relaxed">{banner.message}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400 text-sm"></i>
          <input
            type="text"
            placeholder="Search reviews or reviewers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 font-body transition-all"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {[null, 5, 4, 3, 2, 1].map((r) => (
            <button
              key={r ?? 'all'}
              onClick={() => setRatingFilter(r)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap font-body ${
                ratingFilter === r
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-foreground-900 text-foreground-600 dark:text-foreground-300 border border-background-200 dark:border-foreground-800 hover:bg-background-50 dark:hover:bg-foreground-800'
              }`}
            >
              {r === null ? 'All Ratings' : `${r} Star`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-foreground-500 cursor-pointer font-body whitespace-nowrap">
            <input type="checkbox" checked={showUnreviewed} onChange={() => setShowUnreviewed(!showUnreviewed)} className="rounded border-background-300 text-primary-500 focus:ring-primary-500/30 cursor-pointer" />
            Unreviewed
          </label>
          <label className="flex items-center gap-1.5 text-xs text-foreground-500 cursor-pointer font-body whitespace-nowrap">
            <input type="checkbox" checked={showReviewed} onChange={() => setShowReviewed(!showReviewed)} className="rounded border-background-300 text-primary-500 focus:ring-primary-500/30 cursor-pointer" />
            Reviewed
          </label>
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
          filtered.map((entry, i) => (
            <div
              key={entry.id}
              className={`stagger-${Math.min(i + 1, 8)} bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-800 hover-lift`}
            >
              <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-background-100 dark:bg-foreground-800 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-foreground-500 font-heading">
                        {entry.reviewer.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-body">{entry.reviewer}</span>
                        <span className="text-xs text-foreground-400 font-body">· Table {entry.table}</span>
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
                            <i key={k} className={`text-[10px] ${k < ir.rating ? 'ri-star-fill text-accent-500' : 'ri-star-fill text-foreground-200 dark:text-foreground-700'}`}></i>
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
    </div>
  );
}