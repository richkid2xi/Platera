import { useState, useEffect } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import {
  formatDate,
  formatShortDate,
  daysRemaining,
  countdownTo,
  MOCK_BILLING_HISTORY,
  type SubscriptionStatus,
} from '@/utils/subscription';

// ── Dev switcher ──────────────────────────────────────────────────────────
const STATUS_LABELS: { key: SubscriptionStatus; label: string; color: string }[] = [
  { key: 'trial',        label: 'Trial',        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { key: 'active',       label: 'Active',       color: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400' },
  { key: 'grace_period', label: 'Grace Period', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { key: 'locked',       label: 'Locked',       color: 'bg-foreground-100 text-foreground-600 dark:bg-foreground-800 dark:text-foreground-400' },
];

function DevSwitcher() {
  const { subscription, setStatus } = useSubscription();
  return (
    <div className="p-3 rounded-xl border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 mb-5">
      <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
        <i className="ri-flask-line" /> Dev State Switcher — remove before prod
      </p>
      <div className="flex flex-wrap gap-2">
        {STATUS_LABELS.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setStatus(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${color} ${
              subscription.status === key ? 'ring-2 ring-amber-400 dark:ring-amber-600' : 'opacity-70 hover:opacity-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

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

// ── State: Trial ─────────────────────────────────────────────────────────
function TrialState() {
  const { subscription, openPaymentModal } = useSubscription();
  const days = daysRemaining(subscription.trialEndsAt);
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4 p-5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40">
        <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
          <i className="ri-time-line text-blue-600 dark:text-blue-400 text-lg" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-foreground-900 dark:text-foreground-100 font-heading mb-0.5">
            {days > 0 ? `${days} day${days !== 1 ? 's' : ''} left in your free trial` : 'Your trial ends today'}
          </h4>
          <p className="text-sm text-foreground-500 dark:text-foreground-400">
            Trial expires {formatDate(subscription.trialEndsAt)}.{' '}
            <span className="font-semibold text-foreground-600 dark:text-foreground-300">
              GHS {subscription.planPrice}/month
            </span>{' '}
            after your trial ends.
          </p>
          {/* Trial progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-foreground-400 mb-1">
              <span>Day 1</span>
              <span>Day 14</span>
            </div>
            <div className="h-2 bg-blue-100 dark:bg-blue-900/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${Math.max(0, Math.min(100, ((14 - days) / 14) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-foreground-900 border border-background-200 dark:border-foreground-700">
        <i className="ri-information-line text-foreground-400 shrink-0" />
        <p className="text-sm text-foreground-500 dark:text-foreground-400">
          You're all set! No action needed right now — we'll remind you before your trial ends.
        </p>
      </div>

      <button
        onClick={openPaymentModal}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400 text-sm font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
      >
        <i className="ri-bank-card-line" />
        Subscribe now (early) — GHS {subscription.planPrice}/mo
      </button>
    </div>
  );
}

// ── State: Active ─────────────────────────────────────────────────────────
function ActiveState() {
  const { subscription, openPaymentModal } = useSubscription();
  const renewDate = subscription.currentPeriodEndsAt!;
  const canRenew = daysRemaining(renewDate) <= 0;

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4 p-5 rounded-xl bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-100 dark:border-secondary-800/40">
        <div className="w-11 h-11 rounded-full bg-secondary-100 dark:bg-secondary-900/40 flex items-center justify-center shrink-0">
          <i className="ri-checkbox-circle-fill text-secondary-600 dark:text-secondary-400 text-xl" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="font-bold text-foreground-900 dark:text-foreground-100 font-heading">
              {subscription.planName}
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-secondary-100 dark:bg-secondary-900/40 text-secondary-700 dark:text-secondary-400 text-xs font-bold">
              Active
            </span>
          </div>
          <p className="text-sm text-foreground-500 dark:text-foreground-400">
            GHS {subscription.planPrice}/month · Renews {formatDate(renewDate)}
          </p>
          <p className="text-xs text-foreground-400 dark:text-foreground-500 mt-1.5">
            {canRenew
              ? 'Your subscription period has ended. You can renew now.'
              : `You can renew starting ${formatShortDate(renewDate)}`}
          </p>
        </div>
        <button
          onClick={canRenew ? openPaymentModal : undefined}
          disabled={!canRenew}
          className={`shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            canRenew
              ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-sm shadow-primary-500/20'
              : 'bg-background-100 dark:bg-foreground-800 text-foreground-400 cursor-not-allowed'
          }`}
        >
          Renew
        </button>
      </div>

      {/* Billing history */}
      <div>
        <h4 className="text-sm font-bold text-foreground-700 dark:text-foreground-300 uppercase tracking-wider mb-3">
          Billing History
        </h4>
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
              {MOCK_BILLING_HISTORY.map((entry) => (
                <tr key={entry.id} className="hover:bg-background-50 dark:hover:bg-foreground-800/30 transition-colors">
                  <td className="px-4 py-3 text-foreground-600 dark:text-foreground-400 whitespace-nowrap">
                    {formatShortDate(entry.date)}
                  </td>
                  <td className="px-4 py-3 text-foreground-800 dark:text-foreground-200 font-medium">
                    {entry.description}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-foreground-900 dark:text-foreground-100">
                    GHS {entry.amount}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      entry.status === 'paid'
                        ? 'bg-secondary-50 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-400'
                        : entry.status === 'failed'
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'bg-background-100 dark:bg-foreground-800 text-foreground-500'
                    }`}>
                      <i className={entry.status === 'paid' ? 'ri-check-line' : entry.status === 'failed' ? 'ri-close-line' : 'ri-refund-2-line'} />
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── State: Grace Period ────────────────────────────────────────────────────
function GracePeriodState() {
  const { subscription, openPaymentModal } = useSubscription();
  return (
    <div className="space-y-4">
      <div className="p-5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
            <i className="ri-alarm-warning-line text-amber-600 dark:text-amber-400 text-xl" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-foreground-900 dark:text-foreground-100 font-heading mb-1">
              Your subscription ended on{' '}
              {subscription.currentPeriodEndsAt ? formatDate(subscription.currentPeriodEndsAt) : '—'}
            </h4>
            <p className="text-sm text-foreground-600 dark:text-foreground-400 mb-3">
              You're in a 72-hour grace window. Renew now to keep everything running without interruption.
            </p>
            {subscription.gracePeriodEndsAt && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700">
                <i className="ri-time-line text-amber-600 dark:text-amber-400 text-sm" />
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  Time remaining: <GraceCountdown endDate={subscription.gracePeriodEndsAt} />
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={openPaymentModal}
        className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
      >
        <i className="ri-shield-check-line" />
        Renew Now — GHS {subscription.planPrice}/month
      </button>

      <p className="text-xs text-center text-foreground-400 dark:text-foreground-500">
        Once renewed, your service continues uninterrupted and your next billing date resets.
      </p>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────
export default function SubscriptionBillingSection() {
  const { subscription } = useSubscription();

  return (
    <div className="space-y-5">
      <DevSwitcher />

      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-base font-bold text-foreground-900 dark:text-foreground-100 font-heading">
            Subscription &amp; Billing
          </h3>
          <p className="text-sm text-foreground-500 dark:text-foreground-400 mt-0.5">
            Manage your plan and payment history.
          </p>
        </div>
      </div>

      {subscription.status === 'trial'        && <TrialState />}
      {subscription.status === 'active'       && <ActiveState />}
      {subscription.status === 'grace_period' && <GracePeriodState />}
      {subscription.status === 'locked'       && (
        <div className="p-5 rounded-xl bg-background-50 dark:bg-foreground-800/50 border border-background-200 dark:border-foreground-700 text-center">
          <i className="ri-lock-2-line text-3xl text-foreground-400 mb-2" />
          <p className="text-sm text-foreground-500 dark:text-foreground-400">
            Your account is locked — see the full-page prompt to renew.
          </p>
        </div>
      )}
    </div>
  );
}
