import { useState, useEffect } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import {
  formatShortDate,
  daysRemaining,
  countdownTo,
} from '@/utils/subscription';

// ── Countdown display ─────────────────────────────────────────────────────
function GraceCountdown({ endDate }: { endDate: Date }) {
  const [time, setTime] = useState(countdownTo(endDate));
  useEffect(() => {
    const id = setInterval(() => setTime(countdownTo(endDate)), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <span className="font-mono font-black text-amber-600 dark:text-amber-400 tabular-nums">
      {pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
    </span>
  );
}

// ── Billing History (real data) ──────────────────────────────────────────
function BillingHistory() {
  const { data: history = [], isLoading } = useQuery<any[]>({
    queryKey: ['billing-history'],
    queryFn: async () => {
      const res = await apiClient.get('/subscription/billing-history');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-16 text-foreground-400 text-sm">
        <i className="ri-loader-4-line animate-spin mr-2" />Loading billing history...
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <p className="text-sm text-foreground-400 dark:text-foreground-500 text-center py-4">
        No payment history yet.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-background-200 dark:border-foreground-700 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-background-50 dark:bg-foreground-800/50 border-b border-background-200 dark:border-foreground-700">
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-foreground-500 dark:text-foreground-400 uppercase tracking-wider">Date</th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-foreground-500 dark:text-foreground-400 uppercase tracking-wider">Description</th>
            <th className="text-right px-4 py-2.5 text-xs font-semibold text-foreground-500 dark:text-foreground-400 uppercase tracking-wider">Amount</th>
            <th className="text-right px-4 py-2.5 text-xs font-semibold text-foreground-500 dark:text-foreground-400 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-background-100 dark:divide-foreground-800">
          {history.map((entry: any) => (
            <tr key={entry.id} className="hover:bg-background-50 dark:hover:bg-foreground-800/30 transition-colors">
              <td className="px-4 py-3 text-foreground-600 dark:text-foreground-400 whitespace-nowrap">
                {formatShortDate(new Date(entry.createdAt))}
              </td>
              <td className="px-4 py-3 text-foreground-800 dark:text-foreground-200 font-medium">
                Platera Pro — Monthly
              </td>
              <td className="px-4 py-3 text-right font-mono font-semibold text-foreground-900 dark:text-foreground-100">
                GHS {Number(entry.amount).toFixed(0)}
              </td>
              <td className="px-4 py-3 text-right">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  entry.status === 'SUCCESS'
                    ? 'bg-secondary-50 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-400'
                    : entry.status === 'FAILED'
                    ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'bg-background-100 dark:bg-foreground-800 text-foreground-500'
                }`}>
                  <i className={entry.status === 'SUCCESS' ? 'ri-check-line' : entry.status === 'FAILED' ? 'ri-close-line' : 'ri-time-line'} />
                  {entry.status === 'SUCCESS' ? 'Paid' : entry.status === 'FAILED' ? 'Failed' : 'Pending'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── State: Trial ─────────────────────────────────────────────────────────
function TrialState() {
  const { subscription, initializePayment } = useSubscription();
  const days = daysRemaining(subscription.trialEndsAt);
  return (
    <div className="bg-white dark:bg-foreground-900 rounded-2xl border border-background-200 dark:border-foreground-800 shadow-sm overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-heading font-bold text-foreground-900 dark:text-white">Current Plan: {subscription.planName}</h2>
              <span className="bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Free Trial</span>
            </div>
            <p className="text-foreground-500 text-sm">
              You are currently on a free trial. You have <strong className="text-foreground-900 dark:text-foreground-100">{days} days</strong> remaining.
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-2xl font-bold font-heading text-foreground-900 dark:text-white mb-1">GHS {subscription.planPrice}<span className="text-sm font-normal text-foreground-400">/mo</span></p>
            <p className="text-xs text-foreground-400">Billed starting {formatShortDate(subscription.trialEndsAt)}</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-background-100 dark:border-foreground-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-foreground-600 dark:text-foreground-400">
            Subscribe now to ensure uninterrupted access to Platera when your trial ends.
          </p>
          <button
            onClick={initializePayment}
            className="w-full sm:w-auto px-6 py-2.5 bg-foreground-900 dark:bg-white text-white dark:text-foreground-900 font-bold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] text-sm whitespace-nowrap"
          >
            Subscribe Now
          </button>
        </div>
      </div>
    </div>
  );
}

// ── State: Active ─────────────────────────────────────────────────────────
function ActiveState() {
  const { subscription, initializePayment } = useSubscription();
  const renewDate = subscription.currentPeriodEndsAt!;
  const canRenew = daysRemaining(renewDate) <= 0;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-foreground-900 rounded-2xl border border-background-200 dark:border-foreground-800 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-heading font-bold text-foreground-900 dark:text-white">Current Plan: {subscription.planName}</h2>
                <span className="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Active</span>
              </div>
              <p className="text-foreground-500 text-sm">
                Your subscription is active and will renew on <strong className="text-foreground-900 dark:text-foreground-100">{formatShortDate(renewDate)}</strong>.
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-2xl font-bold font-heading text-foreground-900 dark:text-white mb-1">GHS {subscription.planPrice}<span className="text-sm font-normal text-foreground-400">/mo</span></p>
              <p className="text-xs text-foreground-400">Next payment on {formatShortDate(renewDate)}</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-background-100 dark:border-foreground-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-foreground-600 dark:text-foreground-400">
              Your subscription is active. You can renew once your current period ends.
            </p>
            <button
              onClick={initializePayment}
              disabled={!canRenew}
              className={`w-full sm:w-auto px-6 py-2.5 font-bold rounded-lg shadow-sm transition-all text-sm whitespace-nowrap ${
                canRenew 
                  ? 'bg-primary-500 hover:bg-primary-600 text-white active:scale-[0.98]' 
                  : 'bg-background-100 dark:bg-foreground-800 text-foreground-400 cursor-not-allowed'
              }`}
            >
              Renew Subscription
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-foreground-900 rounded-2xl border border-background-200 dark:border-foreground-800 shadow-sm overflow-hidden p-6 md:p-8">
        <h3 className="text-base font-bold text-foreground-900 dark:text-white font-heading mb-4">Invoice History</h3>
        <BillingHistory />
      </div>
    </div>
  );
}

// ── State: Grace Period ────────────────────────────────────────────────────
function GracePeriodState() {
  const { subscription, initializePayment } = useSubscription();
  const graceEnd = subscription.gracePeriodEndsAt!;
  return (
    <div className="bg-white dark:bg-foreground-900 rounded-2xl border border-red-200 dark:border-red-900/50 shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 bg-red-50/50 dark:bg-red-900/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-heading font-bold text-red-700 dark:text-red-400">Payment Overdue</h2>
              <span className="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Grace Period</span>
            </div>
            <p className="text-foreground-700 dark:text-foreground-300 text-sm max-w-xl">
              Your subscription for <strong>{subscription.planName}</strong> expired on {subscription.currentPeriodEndsAt ? formatShortDate(subscription.currentPeriodEndsAt) : 'recently'}. 
              Please renew to avoid service interruption.
            </p>
            {subscription.gracePeriodEndsAt && (
              <p className="text-sm font-semibold text-red-600 dark:text-red-400 mt-3 flex items-center gap-2">
                <i className="ri-time-line"></i> Locks in: <GraceCountdown endDate={graceEnd} />
              </p>
            )}
          </div>
          <div className="text-left md:text-right shrink-0">
            <p className="text-2xl font-bold font-heading text-red-700 dark:text-red-400 mb-1">GHS {subscription.planPrice}<span className="text-sm font-normal text-red-600/60 dark:text-red-400/60">/mo</span></p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-red-100 dark:border-red-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-amber-700/80 dark:text-amber-400/80">
            Your subscription has expired, but you are currently in the grace period. Please renew immediately.
          </p>
          <button
            onClick={initializePayment}
            className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-[0.98] text-sm whitespace-nowrap"
          >
            Renew Now
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────
export default function SubscriptionBillingSection() {
  const { subscription } = useSubscription();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground-900 dark:text-white font-heading">
          Subscription & Billing
        </h1>
        <p className="text-sm text-foreground-500 dark:text-foreground-400 mt-1">
          Manage your subscription plan, billing cycle, and payment history.
        </p>
      </div>

      {subscription.status === 'trial'        && <TrialState />}
      {subscription.status === 'active'       && <ActiveState />}
      {subscription.status === 'grace_period' && <GracePeriodState />}
      {subscription.status === 'locked'       && (
        <div className="bg-background-50 dark:bg-foreground-900 p-8 rounded-2xl border border-background-200 dark:border-foreground-800 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-background-200 dark:bg-foreground-800 rounded-full flex items-center justify-center mb-4">
            <i className="ri-lock-2-line text-3xl text-foreground-500 dark:text-foreground-400" />
          </div>
          <h2 className="text-xl font-bold font-heading text-foreground-900 dark:text-white mb-2">Account Locked</h2>
          <p className="text-sm text-foreground-500 dark:text-foreground-400 max-w-md mx-auto">
            Your Platera subscription has lapsed. Please proceed to the full-page renewal screen to reactivate your workspace.
          </p>
        </div>
      )}
    </div>
  );
}
