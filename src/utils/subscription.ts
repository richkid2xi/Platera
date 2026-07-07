export type SubscriptionStatus = 'trial' | 'active' | 'grace_period' | 'locked';

export interface SubscriptionState {
  status: SubscriptionStatus;
  trialEndsAt: Date;
  currentPeriodEndsAt: Date | null;
  gracePeriodEndsAt: Date | null;
  planPrice: number;
  planName: string;
}

export function daysRemaining(date: Date): number {
  const diff = date.getTime() - Date.now();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

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

export function deriveStatus(state: SubscriptionState): SubscriptionStatus {
  const now = new Date();
  if (state.status === 'trial' && state.trialEndsAt > now) return 'trial';
  if (state.currentPeriodEndsAt && state.currentPeriodEndsAt > now) return 'active';
  if (state.gracePeriodEndsAt && state.gracePeriodEndsAt > now) return 'grace_period';
  if (state.currentPeriodEndsAt && state.currentPeriodEndsAt <= now) return 'locked';
  return state.status;
}
