import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  type SubscriptionState,
  type SubscriptionStatus,
  DEFAULT_SUBSCRIPTION,
  addDays,
  addMonths,
} from '@/utils/subscription';

interface SubscriptionContextValue {
  subscription: SubscriptionState;
  setStatus: (status: SubscriptionStatus) => void;
  simulateRenewal: () => void;
  showPaymentModal: boolean;
  openPaymentModal: () => void;
  closePaymentModal: () => void;
  renewalSuccess: boolean;
  dismissRenewalSuccess: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

// DEV-ONLY: mock states for each status (for the switcher)
const STATUS_MOCKS: Record<SubscriptionStatus, Partial<SubscriptionState>> = {
  trial: {
    status: 'trial',
    trialEndsAt: addDays(new Date(), 9),
    currentPeriodEndsAt: null,
    gracePeriodEndsAt: null,
  },
  active: {
    status: 'active',
    trialEndsAt: addDays(new Date(), -5),
    currentPeriodEndsAt: addDays(new Date(), 22),
    gracePeriodEndsAt: null,
  },
  grace_period: {
    status: 'grace_period',
    trialEndsAt: addDays(new Date(), -35),
    currentPeriodEndsAt: addDays(new Date(), -1),
    gracePeriodEndsAt: addDays(new Date(), 2), // 48h left in grace
  },
  locked: {
    status: 'locked',
    trialEndsAt: addDays(new Date(), -40),
    currentPeriodEndsAt: addDays(new Date(), -6),
    gracePeriodEndsAt: addDays(new Date(), -3),
  },
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionState>(DEFAULT_SUBSCRIPTION);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [renewalSuccess, setRenewalSuccess] = useState(false);

  const setStatus = useCallback((status: SubscriptionStatus) => {
    setSubscription((prev) => ({
      ...prev,
      ...STATUS_MOCKS[status],
    }));
  }, []);

  const simulateRenewal = useCallback(() => {
    const now = new Date();
    setSubscription((prev) => ({
      ...prev,
      status: 'active',
      currentPeriodEndsAt: addMonths(now, 1),
      gracePeriodEndsAt: null,
    }));
    setShowPaymentModal(false);
    setRenewalSuccess(true);
  }, []);

  const openPaymentModal = useCallback(() => setShowPaymentModal(true), []);
  const closePaymentModal = useCallback(() => setShowPaymentModal(false), []);
  const dismissRenewalSuccess = useCallback(() => setRenewalSuccess(false), []);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        setStatus,
        simulateRenewal,
        showPaymentModal,
        openPaymentModal,
        closePaymentModal,
        renewalSuccess,
        dismissRenewalSuccess,
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
