import {
  createContext,
  useContext,
  useCallback,
  useState,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import {
  type SubscriptionState,
  type SubscriptionStatus,
  addMonths,
  addDays,
} from '@/utils/subscription';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionContextValue {
  subscription: SubscriptionState;
  isLoading: boolean;
  showPaymentModal: boolean;
  openPaymentModal: () => void;
  closePaymentModal: () => void;
  renewalSuccess: boolean;
  dismissRenewalSuccess: () => void;
  // Dev-only setStatus (no-op in prod since data comes from API)
  setStatus: (status: SubscriptionStatus) => void;
  simulateRenewal: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

// Map backend enum values to frontend types
function mapStatus(backendStatus: string): SubscriptionStatus {
  switch (backendStatus) {
    case 'TRIAL': return 'trial';
    case 'ACTIVE': return 'active';
    case 'GRACE_PERIOD': return 'grace_period';
    case 'LOCKED': return 'locked';
    default: return 'trial';
  }
}

const PLAN_PRICE = 250;
const PLAN_NAME = 'Platera Pro';

const DEFAULT_SUBSCRIPTION: SubscriptionState = {
  status: 'trial',
  trialEndsAt: addDays(new Date(), 14),
  currentPeriodEndsAt: null,
  gracePeriodEndsAt: null,
  planPrice: PLAN_PRICE,
  planName: PLAN_NAME,
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [renewalSuccess, setRenewalSuccess] = useState(false);

  // Fetch real subscription status from API (only for OWNER)
  const { data: apiSubscription, isLoading } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const res = await apiClient.get('/subscription/status');
      return res.data;
    },
    enabled: !!user && user.role === 'OWNER',
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Build subscription state from API data
  const subscription: SubscriptionState = apiSubscription
    ? {
        status: mapStatus(apiSubscription.subscriptionStatus),
        trialEndsAt: apiSubscription.trialEndsAt
          ? new Date(apiSubscription.trialEndsAt)
          : addDays(new Date(), 14),
        currentPeriodEndsAt: apiSubscription.currentPeriodEndsAt
          ? new Date(apiSubscription.currentPeriodEndsAt)
          : null,
        gracePeriodEndsAt: apiSubscription.gracePeriodEndsAt
          ? new Date(apiSubscription.gracePeriodEndsAt)
          : null,
        planPrice: PLAN_PRICE,
        planName: PLAN_NAME,
      }
    : DEFAULT_SUBSCRIPTION;

  const openPaymentModal = useCallback(() => setShowPaymentModal(true), []);
  const closePaymentModal = useCallback(() => setShowPaymentModal(false), []);
  const dismissRenewalSuccess = useCallback(() => setRenewalSuccess(false), []);

  // After Paystack confirms payment, invalidate the subscription query so it refetches from backend
  const simulateRenewal = useCallback(() => {
    setShowPaymentModal(false);
    setRenewalSuccess(true);
    queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
  }, [queryClient]);

  // No-op for non-OWNER users (context remains valid without throwing)
  const setStatus = useCallback((_: SubscriptionStatus) => {
    // This was used by DevSwitcher — now removed. No-op.
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoading,
        showPaymentModal,
        openPaymentModal,
        closePaymentModal,
        renewalSuccess,
        dismissRenewalSuccess,
        setStatus,
        simulateRenewal,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
