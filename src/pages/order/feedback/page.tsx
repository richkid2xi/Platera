import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BottomNav from '@/pages/order/components/BottomNav';
import DesktopNav from '@/pages/order/components/DesktopNav';
import { useOrder } from '@/contexts/OrderContext';

interface RatedItem {
  name: string;
  liked: boolean | null;
}

export default function Feedback() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { currentOrder, feedbackSubmitted, dispatch } = useOrder();
  
  const [overallRating, setOverallRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  
  const initialRatedItems = currentOrder?.items.map(item => ({
    name: item.name,
    liked: null,
  })) || [];
  
  const [ratedItems, setRatedItems] = useState<RatedItem[]>(initialRatedItems);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const toggleItemLike = (index: number, liked: boolean) => {
    setRatedItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, liked: item.liked === liked ? null : liked } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (overallRating === 0) return;

    const form = e.currentTarget;
    const honeypot = (form.elements.namedItem('phone_alt') as HTMLInputElement)?.value?.trim();
    if (honeypot) {
      dispatch({ type: 'SUBMIT_FEEDBACK' });
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      // Simulate a short network delay, then treat as success.
      // Replace with a real API endpoint when the backend is ready.
      await new Promise((resolve) => setTimeout(resolve, 800));
      dispatch({ type: 'SUBMIT_FEEDBACK' });
    } catch {
      setFormError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (feedbackSubmitted) {
    return (
      <div className="min-h-screen bg-background-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="animate-bounce-in">
          <div className="w-24 h-24 rounded-full bg-accent-100 flex items-center justify-center mx-auto mb-6 relative overflow-hidden">
            <i className="ri-heart-3-fill text-5xl text-accent-500"></i>
          </div>
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-foreground-900 mb-2 animate-fade-in-up animation-delay-200">
          Thank You!
        </h2>
        <p className="font-body text-sm text-foreground-500 mb-2 animate-fade-in-up animation-delay-300 max-w-md">
          Your feedback means the world to us. We're always working to make your Platera experience even better.
        </p>
        <p className="font-body text-sm text-primary-500 font-semibold mb-8 animate-fade-in-up animation-delay-400">
          Akwaaba — see you again soon!
        </p>
        <button
          onClick={() => {
            dispatch({ type: 'RESET_ORDER_KEEP_TABLE' });
            navigate(`/order/${token}/menu`);
          }}
          className="w-full max-w-sm bg-primary-500 text-white font-heading font-bold text-base py-4 rounded-2xl active:scale-[0.98] hover:bg-primary-600 transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/25 animate-fade-in-up animation-delay-500"
        >
          Order More
        </button>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-50 pb-24 ">
      <DesktopNav />

      <div className="max-w-lg mx-auto w-full px-4 ">
        <header className="pt-12 pb-4 flex items-center gap-3">
          <Link
            to={`/order/${token}/order-status`}
            className="w-9 h-9 rounded-xl bg-background-100 flex items-center justify-center active:scale-90 hover:bg-background-200 transition-all duration-200"
          >
            <i className="ri-arrow-left-line text-foreground-700"></i>
          </Link>
          <div>
            <h1 className="font-heading font-bold text-xl text-foreground-900">
              How was your meal?
            </h1>
            <p className="font-body text-xs text-foreground-500">
              We'd love to hear from you
            </p>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          data-readdy-form
          className="space-y-6"
        >
          <div>
            <p className="font-label text-xs font-semibold text-foreground-700 uppercase tracking-wider mb-3">
              Overall Rating
            </p>
            <div className="flex items-center justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setOverallRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="transition-all duration-150 hover:scale-125 active:scale-90"
                >
                  <i
                    className={`text-4xl transition-all duration-200 ${
                      star <= (hoveredStar || overallRating)
                        ? 'ri-star-fill text-accent-500 animate-cart-pop'
                        : 'ri-star-line text-foreground-300 hover:text-accent-400'
                    }`}
                  ></i>
                </button>
              ))}
            </div>
            {overallRating > 0 && (
              <p className="text-center mt-2 font-label text-xs font-semibold text-accent-600 animate-fade-in-up">
                {['', 'Needs work', 'Okay', 'Good', 'Great!', 'Amazing!'][overallRating]}
              </p>
            )}
          </div>

          {ratedItems.length > 0 && (
            <div>
              <p className="font-label text-xs font-semibold text-foreground-700 uppercase tracking-wider mb-3">
                Your Dishes
              </p>
              <div className="space-y-2">
                {ratedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-background-100 rounded-xl px-4 py-3 hover:bg-background-200 transition-colors duration-200"
                  >
                    <span className="font-body text-sm text-foreground-800">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleItemLike(idx, true)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-110 ${
                          item.liked === true
                            ? 'bg-accent-500 text-white'
                            : 'bg-background-200 text-foreground-400 hover:bg-accent-100 hover:text-accent-500'
                        }`}
                      >
                        <i className="ri-thumb-up-line text-lg"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleItemLike(idx, false)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-110 ${
                          item.liked === false
                            ? 'bg-primary-500 text-white'
                            : 'bg-background-200 text-foreground-400 hover:bg-primary-100 hover:text-primary-500'
                        }`}
                      >
                        <i className="ri-thumb-down-line text-lg"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="font-label text-xs font-semibold text-foreground-700 uppercase tracking-wider mb-3">
              Any comments?
            </p>
            <textarea
              name="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              placeholder="Tell us what you loved or what we can improve..."
              maxLength={500}
              rows={4}
              className="w-full bg-background-100 border border-background-200 rounded-xl px-4 py-3 font-body text-sm text-foreground-800 placeholder:text-foreground-400 resize-none focus:outline-none focus:border-primary-400 hover:border-background-300 transition-all duration-200"
            ></textarea>
            <p className="font-body text-[10px] text-foreground-400 text-right mt-1">
              {comment.length}/500
            </p>
          </div>

          <div className="honeypot-field">
            <input
              type="text"
              name="phone_alt"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              readOnly
            />
          </div>

          {formError && (
            <div className="bg-primary-100 text-primary-800 rounded-xl p-3 font-body text-sm animate-fade-in-up">
              {formError}
            </div>
          )}

          <button
            type="submit"
            disabled={overallRating === 0 || submitting}
            className={`w-full py-4 rounded-2xl font-heading font-bold text-base transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 ${
              overallRating > 0 && !submitting
                ? 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/25'
                : 'bg-background-200 text-foreground-400 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <i className="ri-send-plane-line"></i>
                <span>Submit Feedback</span>
              </>
            )}
          </button>
        </form>
      </div>
      <BottomNav />
    </div>
  );
}
