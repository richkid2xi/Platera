import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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

const STORAGE_KEY = "platera_onboarding_state";

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_STATE;
    } catch {
      return DEFAULT_STATE;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

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
