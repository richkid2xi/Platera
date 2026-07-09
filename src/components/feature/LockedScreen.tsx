import { useSubscription } from '@/contexts/SubscriptionContext';
import { formatDate } from '@/utils/subscription';

export default function LockedScreen() {
  const { subscription, initializePayment } = useSubscription();

  if (subscription.status !== 'locked') return null;

  const lockedSince = subscription.gracePeriodEndsAt
    ? formatDate(subscription.gracePeriodEndsAt)
    : subscription.currentPeriodEndsAt
    ? formatDate(subscription.currentPeriodEndsAt)
    : 'recently';

  return (
    <div className="fixed inset-0 z-[150] bg-background-50 dark:bg-foreground-950 flex items-center justify-center p-6 font-body">
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, #ff6b35 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 text-center max-w-md w-full animate-fade-in-up">
        {/* Icon */}
        <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-foreground-100 dark:bg-foreground-800 border border-background-200 dark:border-foreground-700 flex items-center justify-center shadow-sm">
          <i className="ri-lock-2-line text-3xl text-foreground-500 dark:text-foreground-400" />
        </div>

        {/* Headline */}
        <h1 className="text-2xl font-black text-foreground-900 dark:text-foreground-100 font-heading mb-3">
          Your account is paused
        </h1>

        {/* Friendly copy */}
        <p className="text-foreground-500 dark:text-foreground-400 leading-relaxed mb-2">
          Your subscription lapsed on{' '}
          <span className="font-semibold text-foreground-700 dark:text-foreground-300">{lockedSince}</span>.
          Everything you've built is still here — your menu, your tables, your team. Nothing is lost.
        </p>
        <p className="text-foreground-500 dark:text-foreground-400 leading-relaxed mb-8">
          Renew now to pick up right where you left off.
        </p>

        {/* Plan + CTA */}
        <div className="bg-white dark:bg-foreground-900 rounded-2xl border border-background-200 dark:border-foreground-700 shadow-sm p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-left">
              <p className="text-xs uppercase tracking-wider text-foreground-400 font-semibold mb-0.5">Plan</p>
              <p className="font-bold text-foreground-900 dark:text-foreground-100">{subscription.planName}</p>
            </div>
            <p className="text-2xl font-black text-primary-500 font-heading">
              GHS {subscription.planPrice}
              <span className="text-xs font-semibold text-foreground-400 ml-1">/mo</span>
            </p>
          </div>
          <button
            onClick={initializePayment}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <i className="ri-shield-check-line text-lg" />
            Renew Subscription
          </button>
        </div>

        <p className="text-xs text-foreground-400 dark:text-foreground-500">
          Need help?{' '}
          <a href="mailto:support@platera.app" className="text-primary-500 hover:underline font-medium">
            support@platera.app
          </a>
        </p>

        {/* Platera watermark */}
        <div className="mt-8 flex items-center justify-center gap-2 opacity-30">
          <div className="w-6 h-6 rounded-md overflow-hidden flex items-center justify-center">
            <img src="/favicon.png" alt="Platera Bowl" className="w-full h-full object-cover" />
          </div>
          <span className="text-sm font-black text-foreground-600 dark:text-foreground-300 font-heading tracking-tight">
            Platera
          </span>
        </div>
      </div>
    </div>
  );
}
