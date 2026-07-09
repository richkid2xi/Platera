import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import {
  type SubscriptionState,
  type SubscriptionStatus,
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
  setStatus: (status: SubscriptionStatus) => void;
  initializePayment: () => void;
  authUrl: string | null;
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

const EMPTY_SUBSCRIPTION: SubscriptionState = {
  status: 'active',
  trialEndsAt: new Date(),
  currentPeriodEndsAt: null,
  gracePeriodEndsAt: null,
  planPrice: 0,
  planName: 'Loading...',
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, restaurant } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [renewalSuccess, setRenewalSuccess] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);

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
    refetchInterval: showPaymentModal ? 3000 : false, // Poll every 3 seconds while modal is open
  });

  // Effect to auto-close modal on payment success detected by polling
  useEffect(() => {
    if (showPaymentModal && apiSubscription?.subscriptionStatus === 'ACTIVE') {
      setShowPaymentModal(false);
      setRenewalSuccess(true);
      setAuthUrl(null);
    }
  }, [showPaymentModal, apiSubscription?.subscriptionStatus]);

  // Build subscription state from API data
  const subscriptionSource = apiSubscription ?? restaurant;
  const subscription: SubscriptionState = subscriptionSource
    ? {
        status: mapStatus(subscriptionSource.subscriptionStatus),
        trialEndsAt: subscriptionSource.trialEndsAt
          ? new Date(subscriptionSource.trialEndsAt)
          : new Date(),
        currentPeriodEndsAt: subscriptionSource.currentPeriodEndsAt
          ? new Date(subscriptionSource.currentPeriodEndsAt)
          : null,
        gracePeriodEndsAt: subscriptionSource.gracePeriodEndsAt
          ? new Date(subscriptionSource.gracePeriodEndsAt)
          : null,
        planPrice: subscriptionSource.planPrice || 0,
        planName: subscriptionSource.planName || 'Unknown Plan',
      }
    : EMPTY_SUBSCRIPTION;

  const openPaymentModal = useCallback(() => setShowPaymentModal(true), []);
  const closePaymentModal = useCallback(() => setShowPaymentModal(false), []);
  const dismissRenewalSuccess = useCallback(() => setRenewalSuccess(false), []);

  const initializePayment = useCallback(async () => {
    setShowPaymentModal(true);
    setAuthUrl(null);
    try {
      const res = await apiClient.post('/subscription/initialize', {}, {
        headers: { 'Idempotency-Key': `sub-init-${Date.now()}` }
      });
      if (res.data.authorization_url) {
        setAuthUrl(res.data.authorization_url);
      }
    } catch (error) {
      console.error("Failed to initialize payment", error);
      // fallback handling here if needed
    }
  }, []);

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
        initializePayment,
        authUrl,
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
