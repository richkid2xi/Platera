import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={`text-xs ${star <= rating ? 'ri-star-fill text-accent-400' : 'ri-star-line text-foreground-300'}`}
        ></i>
      ))}
    </div>
  );
}

export default function FeedbackWidget() {
  const { data: allFeedback = [] } = useQuery({
    queryKey: ['feedback', 'recent'],
    queryFn: async () => {
      const res = await apiClient.get('/feedback');
      return res.data || [];
    }
  });

  const recentFeedback = allFeedback.slice(0, 3);

  return (
    <div className="bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-700 p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-foreground-900 dark:text-foreground-100 text-base">Recent Feedback</h3>
        <Link to="/feedback" className="text-xs text-primary-500 font-medium hover:text-primary-600 cursor-pointer whitespace-nowrap">
          View all <i className="ri-arrow-right-line ml-0.5"></i>
        </Link>
      </div>

      {recentFeedback.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-foreground-400 py-6">
          <i className="ri-chat-smile-2-line text-3xl mb-2 opacity-50"></i>
          <p className="text-sm font-semibold">No recent feedback</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recentFeedback.map((fb: any) => (
            <div key={fb.id} className="flex gap-3 p-2.5 rounded-lg hover:bg-background-50 dark:hover:bg-foreground-800/50 transition-colors cursor-pointer">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                fb.overallRating >= 4 ? 'bg-secondary-50 dark:bg-secondary-900/30' : fb.overallRating === 3 ? 'bg-accent-50 dark:bg-accent-900/30' : 'bg-red-50 dark:bg-red-900/30'
              }`}>
                <i className={`text-sm ${
                  fb.overallRating >= 4 ? 'ri-emotion-happy-line text-secondary-500 dark:text-secondary-400'
                  : fb.overallRating === 3 ? 'ri-emotion-normal-line text-accent-500 dark:text-accent-400'
                  : 'ri-emotion-unhappy-line text-red-500 dark:text-red-400'
                }`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-foreground-800 dark:text-foreground-200 font-body">Table {fb.table?.tableNumber || '?'}</span>
                  <StarRating rating={fb.overallRating} />
                  {!fb.isReviewed && (
                    <i className="ri-flag-line text-red-400 text-xs" title="Unreviewed"></i>
                  )}
                </div>
                <p className="text-xs text-foreground-500 dark:text-foreground-400 line-clamp-2 font-body">{fb.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}