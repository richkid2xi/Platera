import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useAuth } from "./AuthContext";

export type OnboardingStepId = "menu_item" | "upload_logo" | "review_tables" | "invite_staff";

export interface OnboardingState {
  completedSteps: OnboardingStepId[];
  isDismissed: boolean;
}

interface OnboardingContextValue {
  state: OnboardingState;
  markStepComplete: (step: OnboardingStepId) => void;
  dismissOnboarding: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

const DEFAULT_STATE: OnboardingState = {
  completedSteps: [],
  isDismissed: false,
};

const getStorageKey = (restaurantId: string | undefined) => 
  `platera_onboarding_state_${restaurantId || "guest"}`;

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { restaurant } = useAuth();
  const storageKey = getStorageKey(restaurant?.id);

  const [state, setState] = useState<OnboardingState>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : DEFAULT_STATE;
    } catch {
      return DEFAULT_STATE;
    }
  });

  // Re-hydrate if restaurant ID changes (user logs out/in)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      setState(stored ? JSON.parse(stored) : DEFAULT_STATE);
    } catch {
      setState(DEFAULT_STATE);
    }
  }, [storageKey]);

  // Save to local storage whenever state changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  const markStepComplete = (step: OnboardingStepId) => {
    setState((prev) => {
      if (prev.completedSteps.includes(step)) return prev;
      return {
        ...prev,
        completedSteps: [...prev.completedSteps, step],
      };
    });
  };

  const dismissOnboarding = () => {
    setState((prev) => ({ ...prev, isDismissed: true }));
  };

  const resetOnboarding = () => {
    setState(DEFAULT_STATE);
  };

  return (
    <OnboardingContext.Provider
      value={{
        state,
        markStepComplete,
        dismissOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
