import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import DesktopNav from '@/components/feature/DesktopNav';
import { tableNumber } from '@/mocks/menu';

type PaymentMethod = 'now' | 'cash' | null;

export default function Checkout() {
  const { items, subtotal, serviceCharge, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handlePlaceOrder = () => {
    if (!paymentMethod) return;
    if (paymentMethod === 'now') {
      navigate('/payment');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setOrderPlaced(true);
      clearCart();
    }, 1500);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="animate-bounce-in">
          <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-6">
            <i className="ri-check-line text-5xl text-primary-500"></i>
          </div>
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-foreground-900 mb-2 animate-fade-in-up animation-delay-200">
          Order Placed!
        </h2>
        <p className="font-body text-sm text-foreground-500 mb-8 animate-fade-in-up animation-delay-300">
          Your order has been sent to the kitchen. We'll start preparing it right away.
        </p>
        <button
          onClick={() => navigate('/order-status')}
          className="w-full max-w-sm bg-primary-500 text-white font-heading font-bold text-base py-4 rounded-2xl active:scale-[0.98] hover:bg-primary-600 transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/25 animate-fade-in-up animation-delay-400"
        >
          Track Your Order
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-50 pb-8">
      <DesktopNav />

      <div className="max-w-lg mx-auto w-full px-4 lg:pt-24">
        <header className="pt-12 lg:pt-0 pb-4 flex items-center gap-3">
          <Link
            to="/cart"
            className="w-9 h-9 rounded-xl bg-background-100 flex items-center justify-center active:scale-90 hover:bg-background-200 transition-all duration-200"
          >
            <i className="ri-arrow-left-line text-foreground-700"></i>
          </Link>
          <div>
            <h1 className="font-heading font-bold text-xl text-foreground-900">
              Checkout
            </h1>
            <p className="font-body text-xs text-foreground-500">
              Table {tableNumber}
            </p>
          </div>
        </header>

        <div className="space-y-5">
          <div>
            <p className="font-label text-xs font-semibold text-foreground-700 uppercase tracking-wider mb-3">
              Payment Method
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod('now')}
                className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 active:scale-[0.99] hover:border-primary-300 flex items-center gap-4 ${
                  paymentMethod === 'now'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-background-200 bg-background-100 hover:bg-background-200'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                    paymentMethod === 'now'
                      ? 'bg-primary-500 text-white'
                      : 'bg-background-200 text-foreground-600'
                  }`}
                >
                  <i className="ri-smartphone-line text-xl"></i>
                </div>
                <div className="text-left flex-1">
                  <h4 className="font-heading font-semibold text-sm text-foreground-900">
                    Pay Now
                  </h4>
                  <p className="font-body text-xs text-foreground-500 mt-0.5">
                    Mobile Money, Visa, Mastercard — instant and secure
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    paymentMethod === 'now'
                      ? 'border-primary-500 bg-primary-500 scale-110'
                      : 'border-background-300'
                  }`}
                >
                  {paymentMethod === 'now' && (
                    <i className="ri-check-line text-white text-xs animate-scale-in"></i>
                  )}
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('cash')}
                className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 active:scale-[0.99] hover:border-primary-300 flex items-center gap-4 ${
                  paymentMethod === 'cash'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-background-200 bg-background-100 hover:bg-background-200'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                    paymentMethod === 'cash'
                      ? 'bg-primary-500 text-white'
                      : 'bg-background-200 text-foreground-600'
                  }`}
                >
                  <i className="ri-cash-line text-xl"></i>
                </div>
                <div className="text-left flex-1">
                  <h4 className="font-heading font-semibold text-sm text-foreground-900">
                    Pay with Cash at Table
                  </h4>
                  <p className="font-body text-xs text-foreground-500 mt-0.5">
                    Pay when your meal is served — no online payment needed
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    paymentMethod === 'cash'
                      ? 'border-primary-500 bg-primary-500 scale-110'
                      : 'border-background-300'
                  }`}
                >
                  {paymentMethod === 'cash' && (
                    <i className="ri-check-line text-white text-xs animate-scale-in"></i>
                  )}
                </div>
              </button>
            </div>
          </div>

          <div>
            <p className="font-label text-xs font-semibold text-foreground-700 uppercase tracking-wider mb-3">
              Order Summary
            </p>
            <div className="bg-background-100 rounded-2xl p-4 space-y-3">
              {items.map((item) => {
                const addOnsTotal = item.selectedAddOns.reduce(
                  (s, a) => s + a.price,
                  0
                );
                return (
                  <div
                    key={item.menuItemId}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-body text-sm text-foreground-800 flex-shrink-0">
                        {item.quantity}x
                      </span>
                      <span className="font-body text-sm text-foreground-800 truncate">
                        {item.name}
                      </span>
                      {item.selectedAddOns.length > 0 && (
                        <span className="font-body text-[11px] text-foreground-400 hidden sm:inline">
                          ({item.selectedAddOns.map((a) => a.name).join(', ')})
                        </span>
                      )}
                    </div>
                    <span className="font-label text-sm font-semibold text-foreground-900 flex-shrink-0 ml-2">
                      ₵{(item.price + addOnsTotal) * item.quantity}
                    </span>
                  </div>
                );
              })}
              <div className="border-t border-background-200 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-foreground-600">
                    Subtotal
                  </span>
                  <span className="font-label text-sm text-foreground-900">
                    ₵{subtotal}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-foreground-600">
                    Service Charge
                  </span>
                  <span className="font-label text-sm text-foreground-900">
                    ₵{serviceCharge}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-background-200">
                  <span className="font-heading font-bold text-base text-foreground-900">
                    Total
                  </span>
                  <span className="font-heading font-extrabold text-xl text-primary-500">
                    ₵{total}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={!paymentMethod || isSubmitting}
            className={`w-full py-4 rounded-2xl font-heading font-bold text-base transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 ${
              paymentMethod && !isSubmitting
                ? 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/25'
                : 'bg-background-200 text-foreground-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Placing Order...</span>
              </>
            ) : (
              <>
                <i className="ri-check-double-line"></i>
                <span>Place Order — ₵{total}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}