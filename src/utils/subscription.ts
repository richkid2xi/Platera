// ─── Subscription utility functions ───────────────────────────────────────
// All date/countdown logic lives here so wiring to real API data later is trivial.

export type SubscriptionStatus = 'trial' | 'active' | 'grace_period' | 'locked';

export interface SubscriptionState {
  status: SubscriptionStatus;
  trialEndsAt: Date;
  currentPeriodEndsAt: Date | null;
  gracePeriodEndsAt: Date | null;
  planPrice: number;
  planName: string;
}

/** Returns number of days remaining, floored. Can be negative. */
export function daysRemaining(date: Date): number {
  const now = Date.now();
  const diff = date.getTime() - now;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/** Returns { hours, minutes, seconds } remaining until a date */
export function countdownTo(date: Date): { hours: number; minutes: number; seconds: number; total: number } {
  const total = Math.max(0, date.getTime() - Date.now());
  const hours = Math.floor(total / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);
  return { hours, minutes, seconds, total };
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/** Derive SubscriptionStatus based on current date and state dates */
export function deriveStatus(state: SubscriptionState): SubscriptionStatus {
  const now = new Date();
  if (state.status === 'trial' && state.trialEndsAt > now) return 'trial';
  if (state.currentPeriodEndsAt && state.currentPeriodEndsAt > now) return 'active';
  if (state.gracePeriodEndsAt && state.gracePeriodEndsAt > now) return 'grace_period';
  if (state.currentPeriodEndsAt && state.currentPeriodEndsAt <= now) return 'locked';
  return state.status;
}

// ─── Mock billing history ────────────────────────────────────────────────
export interface BillingEntry {
  id: string;
  date: Date;
  amount: number;
  status: 'paid' | 'failed' | 'refunded';
  description: string;
}

export const MOCK_BILLING_HISTORY: BillingEntry[] = [
  { id: 'inv_001', date: addDays(new Date(), -30), amount: 250, status: 'paid', description: 'Platera Pro — Monthly' },
  { id: 'inv_002', date: addDays(new Date(), -60), amount: 250, status: 'paid', description: 'Platera Pro — Monthly' },
  { id: 'inv_003', date: addDays(new Date(), -90), amount: 250, status: 'paid', description: 'Platera Pro — Monthly' },
  { id: 'inv_004', date: addDays(new Date(), -120), amount: 250, status: 'paid', description: 'Platera Pro — Monthly' },
];

// ─── Default mock subscription (trial) ──────────────────────────────────
export const DEFAULT_SUBSCRIPTION: SubscriptionState = {
  status: 'trial',
  trialEndsAt: addDays(new Date(), 14),
  currentPeriodEndsAt: null,
  gracePeriodEndsAt: null,
  planPrice: 250,
  planName: 'Platera Pro',
};
