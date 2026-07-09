import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { formatDate, addMonths } from '@/utils/subscription';

export default function PaystackModal() {
  const { 
    showPaymentModal, 
    closePaymentModal, 
    subscription,
    renewalSuccess,
    dismissRenewalSuccess,
    authUrl
  } = useSubscription();
  const [iframeLoading, setIframeLoading] = useState(true);

  const renewalDate = formatDate(addMonths(new Date(), 1));

  useEffect(() => {
    if (showPaymentModal) setIframeLoading(true);
  }, [showPaymentModal]);

  const modalContent = showPaymentModal ? (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground-950/60 backdrop-blur-sm"
        onClick={closePaymentModal}
      />
      <div className="relative bg-white dark:bg-foreground-900 rounded-2xl shadow-2xl border border-background-200 dark:border-foreground-700 w-full max-w-lg animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-background-100 dark:border-foreground-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <i className="ri-shield-check-line text-white text-sm" />
            </div>
            <div>
              <h3 className="font-bold text-foreground-900 dark:text-foreground-100 font-heading text-sm">
                Secure Checkout
              </h3>
              <p className="text-xs text-foreground-500 dark:text-foreground-400">
                Powered by Paystack
              </p>
            </div>
          </div>
          <button
            onClick={closePaymentModal}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-foreground-400 hover:text-foreground-600 hover:bg-background-100 dark:hover:bg-foreground-800 transition-colors"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        {/* Plan summary banner */}
        <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/40 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-foreground-900 dark:text-foreground-100">
              {subscription.planName}
            </p>
            <p className="text-xs text-foreground-500 dark:text-foreground-400 mt-0.5">
              Renews until {renewalDate}
            </p>
          </div>
          <p className="text-xl font-black text-primary-500 font-heading">
            GHS {subscription.planPrice}
            <span className="text-xs font-semibold text-foreground-400 ml-1">/mo</span>
          </p>
        </div>

        {/* Iframe container */}
        <div className="relative mx-6 my-4 rounded-xl overflow-hidden border border-background-200 dark:border-foreground-700 bg-background-50 dark:bg-foreground-800" style={{ minHeight: 300 }}>
          {iframeLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background-50 dark:bg-foreground-800 z-10">
              <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
              <p className="text-sm text-foreground-500 dark:text-foreground-400">
                Loading payment form…
              </p>
            </div>
          )}
          {/* Real Paystack checkout injected via authUrl */}
          <iframe
            src={authUrl || "about:blank"}
            title="Paystack Checkout"
            className="w-full"
            style={{ height: 400, border: 'none', display: iframeLoading ? 'none' : 'block' }}
            onLoad={() => setIframeLoading(false)}
          />
          {/* Placeholder content when iframe has no src */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
            <i className="ri-bank-card-2-line text-3xl text-foreground-300 dark:text-foreground-600" />
            <p className="text-sm text-foreground-400 dark:text-foreground-500 text-center px-4">
              Payment form will appear here once<br />Paystack integration is connected.
            </p>
          </div>
        </div>

        {/* Security badges */}
        <div className="px-6 pb-5 flex items-center justify-center gap-4 text-xs text-foreground-400 dark:text-foreground-600">
          <span className="flex items-center gap-1"><i className="ri-lock-line" /> 256-bit SSL</span>
          <span className="flex items-center gap-1"><i className="ri-shield-check-line" /> PCI DSS Compliant</span>
          <span className="flex items-center gap-1"><i className="ri-refund-2-line" /> Cancel anytime</span>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {modalContent && createPortal(modalContent, document.body)}
      
      {/* Success Toast */}
      {renewalSuccess && createPortal(
        <div className="fixed top-20 right-6 z-[200] bg-secondary-500 text-white px-5 py-3 rounded-xl shadow-xl toast-enter font-body text-sm flex items-center gap-2">
          <i className="ri-check-double-line text-lg" />
          You're all set! Renewed until {formatDate(subscription.currentPeriodEndsAt || addMonths(new Date(), 1))}.
          <button onClick={dismissRenewalSuccess} className="ml-3 text-white/70 hover:text-white">
            <i className="ri-close-line" />
          </button>
        </div>,
        document.body
      )}
    </>
  );
}
