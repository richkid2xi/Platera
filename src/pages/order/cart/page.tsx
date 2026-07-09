import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useOrder } from '@/contexts/OrderContext';
import BottomNav from '@/pages/order/components/BottomNav';
import DesktopNav from '@/pages/order/components/DesktopNav';

export default function Cart() {
  const { token } = useParams<{ token: string }>();
  const {
    cart: items,
    subtotal,
    serviceCharge,
    total,
    dispatch,
  } = useOrder();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const navigate = useNavigate();
  const [expandedInstructions, setExpandedInstructions] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background-50 flex flex-col pb-16">
        <header className="px-6 pt-12 pb-4 flex items-center gap-3">
          <Link
            to={`/order/${token}/menu`}
            className="w-9 h-9 rounded-xl bg-background-100 flex items-center justify-center active:scale-90 hover:bg-background-200 transition-all duration-200"
          >
            <i className="ri-arrow-left-line text-foreground-700"></i>
          </Link>
          <h1 className="font-heading font-bold text-xl text-foreground-900">
            Your Cart
          </h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-48 h-48 mb-4 animate-bounce-in">
            <img src="/empty_cart.png" alt="Empty Cart" className="w-full h-full object-contain mix-blend-multiply" />
          </div>
          <h2 className="font-heading font-bold text-xl text-foreground-800 mb-2 animate-fade-in-up animation-delay-100">
            Your cart is empty
          </h2>
          <p className="font-body text-sm text-foreground-500 text-center mb-8 animate-fade-in-up animation-delay-200 max-w-xs">
            Looks like you haven't added anything yet. Browse the menu and find something delicious!
          </p>
          <Link
            to={`/order/${token}/menu`}
            className="bg-primary-500 text-white font-heading font-bold text-base py-3 px-8 rounded-2xl active:scale-[0.98] hover:bg-primary-600 transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/25 animate-fade-in-up animation-delay-300"
          >
            Browse Menu
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-50 pb-40 ">
      <DesktopNav />

      <div className="max-w-5xl mx-auto w-full px-4 ">
        <header className="pt-12 pb-4 flex items-center gap-3">
          <Link
            to={`/order/${token}/menu`}
            className="w-9 h-9 rounded-xl bg-background-100 flex items-center justify-center active:scale-90 hover:bg-background-200 transition-all duration-200"
          >
            <i className="ri-arrow-left-line text-foreground-700"></i>
          </Link>
          <div>
            <h1 className="font-heading font-bold text-xl text-foreground-900">
              Your Cart
            </h1>
            <p className="font-body text-xs text-foreground-500">
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </p>
          </div>
        </header>

        <div className="">
          <div className="space-y-3 ">
            {items.map((item) => {
              const addOnsTotal = item.selectedAddOns.reduce((s, a) => s + a.price, 0);
              const itemTotal = (item.price + addOnsTotal) * item.quantity;
              const isExpanded = expandedInstructions === item.menuItemId;

              return (
                <div
                  key={item.menuItemId}
                  className="bg-background-100 rounded-2xl p-3 flex gap-3 transition-all duration-200 hover:bg-background-200"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-heading font-semibold text-sm text-foreground-900">
                          {item.name}
                        </h4>
                        {item.selectedAddOns.length > 0 && (
                          <p className="font-body text-[11px] text-foreground-500 mt-0.5">
                            + {item.selectedAddOns.map((a) => a.name).join(', ')}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.menuItemId })}
                        className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors duration-200 active:scale-95"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { menuItemId: item.menuItemId, quantity: item.quantity - 1 } })}
                          className="w-7 h-7 rounded-lg bg-background-50 flex items-center justify-center text-foreground-700 active:scale-95 hover:bg-background-200 transition-colors"
                        >
                          <i className="ri-subtract-line text-sm"></i>
                        </button>
                        <span className="font-label font-semibold text-sm text-foreground-900 w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { menuItemId: item.menuItemId, quantity: item.quantity + 1 } })}
                          className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 active:scale-95 hover:bg-primary-100 transition-colors"
                        >
                          <i className="ri-add-line text-sm"></i>
                        </button>
                      </div>
                      <span className="font-heading font-bold text-sm text-foreground-900">
                        ₵{itemTotal}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        setExpandedInstructions(
                          isExpanded ? null : item.menuItemId
                        )
                      }
                      className="mt-2 flex items-center gap-1 text-primary-500 font-label text-[11px] font-semibold hover:text-primary-600 transition-colors duration-200"
                    >
                      <i
                        className={`${
                          item.specialInstructions
                            ? 'ri-edit-line'
                            : 'ri-add-line'
                        } text-xs`}
                      ></i>
                      <span>
                        {item.specialInstructions
                          ? 'Edit note'
                          : 'Add special instructions'}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="mt-2 animate-fade-in">
                        <textarea
                          value={item.specialInstructions}
                          onChange={(e) =>
                            dispatch({ type: 'UPDATE_INSTRUCTIONS', payload: { menuItemId: item.menuItemId, instructions: e.target.value } })
                          }
                          placeholder='e.g. "No pepper please"'
                          maxLength={150}
                          rows={2}
                          className="w-full bg-background-50 border border-background-200 rounded-xl px-3 py-2 font-body text-sm text-foreground-800 placeholder:text-foreground-400 resize-none focus:outline-none focus:border-primary-400 hover:border-background-300 transition-all duration-200"
                        />
                        <p className="font-body text-[10px] text-foreground-400 text-right mt-0.5">
                          {item.specialInstructions?.length || 0}/150
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 ">
            <div className="bg-background-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-foreground-600">Subtotal</span>
                <span className="font-label font-semibold text-sm text-foreground-900">
                  ₵{subtotal}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-foreground-600">
                  Service Charge (5%)
                </span>
                <span className="font-label font-semibold text-sm text-foreground-900">
                  ₵{serviceCharge}
                </span>
              </div>
              <div className="border-t border-background-200 pt-3 flex items-center justify-between">
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
      </div>

      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[calc(480px-2rem)] z-40">
        <button
          onClick={() => navigate(`/order/${token}/checkout`)}
          className="w-full bg-primary-500 hover:bg-primary-600 active:scale-[0.98] shadow-lg shadow-primary-500/20 transition-all duration-200 text-white font-heading font-bold text-base py-4 rounded-2xl flex items-center justify-center gap-2"
        >
          <span>Proceed to Checkout</span>
          <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform"></i>
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
