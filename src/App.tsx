import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { RefreshProvider } from "./contexts/RefreshContext";

import { UnsavedChangesProvider } from "./contexts/UnsavedChangesContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import UnsavedChangesModal from "./components/feature/UnsavedChangesModal";
import LockedScreen from "./components/feature/LockedScreen";
import PaystackModal from "./components/feature/PaystackModal";
import AuthLoaders from "./components/feature/AuthLoaders";
import GlobalErrorBoundary from "./components/feature/GlobalErrorBoundary";
import GlobalToastProvider from "./components/feature/GlobalToastProvider";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RefreshProvider>
          <SubscriptionProvider>
            <OnboardingProvider>
              <UnsavedChangesProvider>
                <I18nextProvider i18n={i18n}>
                  <GlobalErrorBoundary>
                    <BrowserRouter basename={import.meta.env.BASE_URL}>
                      <AppRoutes />
                      <UnsavedChangesModal />
                      <LockedScreen />
                      <PaystackModal />
                      <AuthLoaders />
                      <GlobalToastProvider />
                    </BrowserRouter>
                  </GlobalErrorBoundary>
                </I18nextProvider>
              </UnsavedChangesProvider>
            </OnboardingProvider>
          </SubscriptionProvider>
        </RefreshProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;