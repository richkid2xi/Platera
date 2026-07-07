import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useOrder } from '@/contexts/OrderContext';
import DesktopNav from '@/pages/order/components/DesktopNav';
import { apiClient } from '@/api/client';

export default function Checkout() {
  const { token } = useParams<{ token: string }>();
  const { cart: items, subtotal, serviceCharge, total, paymentMethod, dispatch, tableNumber } = useOrder();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaceOrder = async () => {
    if (!paymentMethod) return;
    if (paymentMethod === 'now') {
      navigate(`/order/${token}/payment`);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const orderPayload = {
        paymentMethod: 'CASH',
        items: items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          selectedAddOnIds: item.selectedAddOns.map(a => a.id),
          notes: item.specialInstructions || undefined,
        })),
      };
      
      const response = await apiClient.post(`/public/order/${token}/orders`, orderPayload);
      
      dispatch({ type: 'PLACE_ORDER', payload: { total, orderId: response.data.id } });
      navigate(`/order/${token}/order-status`);
    } catch (error) {
      console.error('Failed to place order:', error);
      // Optional: Add some error state/toast here
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen bg-background-50 pb-8">
      <DesktopNav />

      <div className="max-w-lg mx-auto w-full px-4 ">
        <header className="pt-12 pb-4 flex items-center gap-3">
          <Link
            to={`/order/${token}/cart`}
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

        <div className="space-y-6">
          <div>
            <p className="font-heading font-semibold text-lg text-foreground-900 mb-4">
              Select Payment Method
            </p>
            <div className="space-y-3">
              <button
                onClick={() => dispatch({ type: 'SET_PAYMENT_METHOD', payload: 'now' })}
                className={`w-full p-5 rounded-2xl border transition-all duration-300 active:scale-[0.99] flex items-center gap-4 ${
                  paymentMethod === 'now'
                    ? 'border-primary-500 bg-primary-50/50 shadow-md shadow-primary-500/10'
                    : 'border-background-200 bg-background-50 hover:border-background-300 hover:bg-background-100/50'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                    paymentMethod === 'now'
                      ? 'bg-primary-500 text-white shadow-inner'
                      : 'bg-background-100 text-foreground-500'
                  }`}
                >
                  <i className="ri-smartphone-line text-xl"></i>
                </div>
                <div className="text-left flex-1">
                  <h3 className={`font-heading font-semibold text-base transition-colors ${paymentMethod === 'now' ? 'text-primary-900' : 'text-foreground-900'}`}>
                    Pay Now
                  </h3>
                  <p className="font-body text-xs text-foreground-500 mt-0.5">
                    Mobile Money or Card
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    paymentMethod === 'now'
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-background-300'
                  }`}
                >
                  {paymentMethod === 'now' && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </button>

              <button
                onClick={() => dispatch({ type: 'SET_PAYMENT_METHOD', payload: 'cash' })}
                className={`w-full p-5 rounded-2xl border transition-all duration-300 active:scale-[0.99] flex items-center gap-4 ${
                  paymentMethod === 'cash'
                    ? 'border-primary-500 bg-primary-50/50 shadow-md shadow-primary-500/10'
                    : 'border-background-200 bg-background-50 hover:border-background-300 hover:bg-background-100/50'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                    paymentMethod === 'cash'
                      ? 'bg-primary-500 text-white shadow-inner'
                      : 'bg-background-100 text-foreground-500'
                  }`}
                >
                  <i className="ri-money-dollar-circle-line text-xl"></i>
                </div>
                <div className="text-left flex-1">
                  <h3 className={`font-heading font-semibold text-base transition-colors ${paymentMethod === 'cash' ? 'text-primary-900' : 'text-foreground-900'}`}>
                    Pay with Cash
                  </h3>
                  <p className="font-body text-xs text-foreground-500 mt-0.5">
                    Pay the waiter directly
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    paymentMethod === 'cash'
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-background-300'
                  }`}
                >
                  {paymentMethod === 'cash' && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
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
                        <span className="font-body text-[11px] text-foreground-400 hidden ">
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
