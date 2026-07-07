import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrder } from '@/contexts/OrderContext';
import DesktopNav from '@/pages/order/components/DesktopNav';
import { apiClient } from '@/api/client';

type PaymentStep = 'method' | 'details' | 'confirm' | 'processing' | 'done';

type MomoNetwork = 'mtn' | 'vodafone' | 'airteltigo' | null;

type PayMethod = 'momo' | 'card' | null;

const MOMO_NETWORKS: { id: NonNullable<MomoNetwork>; name: string; color: string; prefix: string; icon: string }[] = [
  { id: 'mtn', name: 'MTN Mobile Money', color: '#FFC107', prefix: '024|054|055|059', icon: 'ri-smartphone-line' },
  { id: 'vodafone', name: 'Vodafone Cash', color: '#E60000', prefix: '020|050', icon: 'ri-smartphone-line' },
  { id: 'airteltigo', name: 'AirtelTigo Money', color: '#0077B6', prefix: '027|057|026|056', icon: 'ri-smartphone-line' },
];

const PROCESSING_MESSAGES = [
  { text: 'Authorizing payment...', icon: 'ri-shield-check-line', delay: 0 },
  { text: 'Connecting to payment provider...', icon: 'ri-link', delay: 1200 },
  { text: 'Verifying account details...', icon: 'ri-user-settings-line', delay: 2400 },
  { text: 'Processing transaction...', icon: 'ri-exchange-line', delay: 3600 },
  { text: 'Payment confirmed!', icon: 'ri-check-double-line', delay: 4800 },
];



function maskCardForDisplay(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 4) return '•••• •••• •••• ••••';
  return `•••• •••• •••• ${digits.slice(-4)}`;
}

export default function Payment() {
  const { token } = useParams<{ token: string }>();
  const { total, cart: items, dispatch, paymentMethod: ctxPaymentMethod } = useOrder();
  const navigate = useNavigate();

  const [step, setStep] = useState<PaymentStep>(ctxPaymentMethod === 'now' ? 'details' : 'method');
  const [payMethod, setPayMethod] = useState<PayMethod>(ctxPaymentMethod === 'now' ? 'momo' : null);
  const [momoNetwork, setMomoNetwork] = useState<MomoNetwork>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [processingIndex, setProcessingIndex] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState('');

  const isDetailsValid = useCallback(() => {
    if (payMethod === 'momo') {
      return phoneNumber.replace(/\D/g, '').length >= 10 && momoNetwork !== null;
    }
    if (payMethod === 'card') {
      return (
        cardNumber.replace(/\D/g, '').length === 16 &&
        cardExpiry.replace(/\D/g, '').length === 4 &&
        cardCvv.replace(/\D/g, '').length === 3 &&
        cardName.trim().length >= 3
      );
    }
    return false;
  }, [payMethod, phoneNumber, momoNetwork, cardNumber, cardExpiry, cardCvv, cardName]);

  useEffect(() => {
    if (total <= 0) {
      navigate('/cart', { replace: true });
    }
  }, [total, navigate]);

  useEffect(() => {
    if (step !== 'processing') return;
    const timer = setInterval(() => {
      setProcessingIndex((prev) => {
        if (prev >= PROCESSING_MESSAGES.length - 1) return prev;
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(timer);
  }, [step]);

  useEffect(() => {
    if (step === 'processing' && processingIndex === PROCESSING_MESSAGES.length - 1 && orderId) {
      const doneTimer = setTimeout(() => {
        dispatch({ type: 'PLACE_ORDER', payload: { total, orderId } });
        setStep('done');
      }, 1000);
      return () => clearTimeout(doneTimer);
    }
  }, [step, processingIndex, dispatch, total, orderId]);

  useEffect(() => {
    if (step !== 'done') return;
    if (countdown <= 0) {
      navigate('/order-status', { replace: true });
      return;
    }
    const cd = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(cd);
  }, [step, countdown, navigate]);

  const handleMethodSelect = (method: NonNullable<PayMethod>) => {
    setPayMethod(method);
    setErrors({});
  };

  const handleMethodContinue = () => {
    if (!payMethod) {
      setErrors({ method: 'Please select a payment method' });
      return;
    }
    setStep('details');
  };

  const handleDetailsBack = () => {
    setStep('method');
    setErrors({});
  };

  const handleDetailsContinue = () => {
    const newErrors: Record<string, string> = {};
    if (payMethod === 'momo') {
      if (phoneNumber.replace(/\D/g, '').length < 10) {
        newErrors.phone = 'Enter a valid 10-digit phone number';
      }
      if (!momoNetwork) {
        newErrors.network = 'Select your mobile network';
      }
    }
    if (payMethod === 'card') {
      if (cardNumber.replace(/\D/g, '').length !== 16) newErrors.cardNumber = 'Enter a valid 16-digit card number';
      if (cardExpiry.replace(/\D/g, '').length !== 4) newErrors.expiry = 'Enter a valid expiry (MM/YY)';
      if (cardCvv.replace(/\D/g, '').length !== 3) newErrors.cvv = 'Enter a valid 3-digit CVV';
      if (cardName.trim().length < 3) newErrors.name = 'Enter cardholder name';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setStep('confirm');
  };

  const handleConfirmPayment = async () => {
    setStep('processing');
    setProcessingIndex(0);
    setPaymentError('');

    try {
      const orderPayload = {
        paymentMethod: payMethod === 'momo' ? 'MOMO' : 'CARD',
        items: items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          selectedAddOnIds: item.selectedAddOns.map(a => a.id),
          notes: item.specialInstructions || undefined,
        })),
      };
      
      const response = await apiClient.post(`/public/order/${token}/orders`, orderPayload);
      setOrderId(response.data.id);
    } catch (error) {
      console.error('Failed to create order', error);
      setPaymentError('We could not create your order. Please try again.');
      setStep('confirm');
    }
  };


  const currentStepIndex = step === 'method' ? 1 : step === 'details' ? 2 : step === 'confirm' ? 3 : 4;

  if (total <= 0) return null;

  return (
    <div className="min-h-screen bg-background-50">
      <DesktopNav />

      <div className="max-w-lg mx-auto w-full px-4 ">
        {/* Header */}
        <header className="pt-12 pb-5 flex items-center gap-3">
          {step !== 'processing' && step !== 'done' ? (
            <button
              onClick={() => {
                if (step === 'method') navigate(`/order/${token}/checkout`);
                else if (step === 'details') handleDetailsBack();
                else setStep('details');
              }}
              className="w-9 h-9 rounded-xl bg-background-100 flex items-center justify-center active:scale-90 hover:bg-background-200 transition-all duration-200"
            >
              <i className="ri-arrow-left-line text-foreground-700"></i>
            </button>
          ) : (
            <div className="w-9 h-9" />
          )}
          <div>
            <h1 className="font-heading font-bold text-xl text-foreground-900">
              {step === 'done' ? 'Payment Complete' : 'Pay Now'}
            </h1>
            <p className="font-body text-xs text-foreground-500">Total: ₵{total}</p>
          </div>
        </header>

        {/* Step Indicator — hide during processing/done */}
        {step !== 'processing' && step !== 'done' && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-label text-xs font-semibold transition-all duration-400 ${
                    s < currentStepIndex
                      ? 'bg-primary-500 text-white'
                      : s === currentStepIndex
                        ? 'bg-primary-500 text-white scale-110'
                        : 'bg-background-200 text-foreground-400'
                  }`}
                >
                  {s < currentStepIndex ? (
                    <i className="ri-check-line text-sm"></i>
                  ) : (
                    s
                  )}
                </div>
                {s < 4 && (
                  <div
                    className={`w-7 h-0.5 rounded-full transition-colors duration-400 ${
                      s < currentStepIndex ? 'bg-primary-500' : 'bg-background-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step: Method Selection */}
        {step === 'method' && (
          <div className="animate-fade-in-up">
            <p className="font-label text-xs font-semibold text-foreground-700 uppercase tracking-wider mb-3">
              Select Payment Method
            </p>

            <div className="space-y-3 mb-6">
              {/* Mobile Money */}
              <button
                onClick={() => handleMethodSelect('momo')}
                className={`w-full p-5 rounded-2xl border transition-all duration-300 active:scale-[0.99] flex items-center gap-4 ${
                  payMethod === 'momo'
                    ? 'border-primary-500 bg-primary-50/50 shadow-md shadow-primary-500/10'
                    : 'border-background-200 bg-background-50 hover:bg-background-100/50 hover:border-background-300'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                    payMethod === 'momo'
                      ? 'bg-primary-500 text-white shadow-inner'
                      : 'bg-background-100 text-foreground-500'
                  }`}
                >
                  <i className="ri-smartphone-line text-xl"></i>
                </div>
                <div className="text-left flex-1">
                  <h3 className={`font-heading font-semibold text-base transition-colors ${payMethod === 'momo' ? 'text-primary-900' : 'text-foreground-900'}`}>
                    Mobile Money
                  </h3>
                  <p className="font-body text-xs text-foreground-500 mt-0.5">
                    MTN, Vodafone, AirtelTigo
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    payMethod === 'momo'
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-background-300'
                  }`}
                >
                  {payMethod === 'momo' && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </button>

              {/* Debit/Credit Card */}
              <button
                onClick={() => handleMethodSelect('card')}
                className={`w-full p-5 rounded-2xl border transition-all duration-300 active:scale-[0.99] flex items-center gap-4 ${
                  payMethod === 'card'
                    ? 'border-primary-500 bg-primary-50/50 shadow-md shadow-primary-500/10'
                    : 'border-background-200 bg-background-50 hover:bg-background-100/50 hover:border-background-300'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                    payMethod === 'card'
                      ? 'bg-primary-500 text-white shadow-inner'
                      : 'bg-background-100 text-foreground-500'
                  }`}
                >
                  <i className="ri-bank-card-line text-xl"></i>
                </div>
                <div className="text-left flex-1">
                  <h3 className={`font-heading font-semibold text-base transition-colors ${payMethod === 'card' ? 'text-primary-900' : 'text-foreground-900'}`}>
                    Debit/Credit Card
                  </h3>
                  <p className="font-body text-xs text-foreground-500 mt-0.5">
                    Visa, Mastercard
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    payMethod === 'card'
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-background-300'
                  }`}
                >
                  {payMethod === 'card' && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </button>
            </div>

            {errors.method && (
              <p className="text-red-500 font-body text-xs mb-3 animate-fade-in">{errors.method}</p>
            )}

            <button
              onClick={handleMethodContinue}
              disabled={!payMethod}
              className={`w-full py-4 rounded-2xl font-heading font-bold text-base transition-all duration-300 active:scale-[0.98] ${
                payMethod
                  ? 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/25'
                  : 'bg-background-200 text-foreground-400 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step: Payment Details */}
        {step === 'details' && (
          <div className="animate-fade-in-up">
            {payMethod === 'momo' && (
              <>
                <p className="font-label text-xs font-semibold text-foreground-700 uppercase tracking-wider mb-3">
                  Mobile Money Details
                </p>

                {/* Network Selector */}
                <div className="mb-5">
                  <p className="font-body text-xs text-foreground-500 mb-2">Select Network</p>
                  <div className="grid grid-cols-3 gap-2">
                    {MOMO_NETWORKS.map((net) => (
                      <button
                        key={net.id}
                        onClick={() => {
                          setMomoNetwork(net.id);
                          setErrors((prev) => ({ ...prev, network: '' }));
                        }}
                        className={`p-3 rounded-xl border-2 transition-all duration-250 active:scale-[0.96] flex flex-col items-center gap-1.5 ${
                          momoNetwork === net.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-background-200 bg-background-100 hover:border-background-300 hover:bg-background-200'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-250 ${
                            momoNetwork === net.id
                              ? 'bg-primary-500 text-white'
                              : 'bg-background-200 text-foreground-600'
                          }`}
                        >
                          <i className={`${net.icon} text-lg`}></i>
                        </div>
                        <span
                          className={`font-label text-[11px] font-semibold text-center leading-tight ${
                            momoNetwork === net.id ? 'text-primary-600' : 'text-foreground-700'
                          }`}
                        >
                          {net.id === 'mtn' ? 'MTN' : net.id === 'vodafone' ? 'Vodafone' : 'AirtelTigo'}
                        </span>
                      </button>
                    ))}
                  </div>
                  {errors.network && (
                    <p className="text-red-500 font-body text-xs mt-1.5 animate-fade-in">{errors.network}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="mb-8">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-1 flex items-center">
                      <span className="font-label text-base text-foreground-400">+233</span>
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhoneNumber(raw);
                        setErrors((prev) => ({ ...prev, phone: '' }));
                        // Auto-detect network
                        if (raw.length >= 3) {
                          const prefix = raw.slice(0, 3);
                          if (['024', '054', '055', '059'].includes(prefix)) setMomoNetwork('mtn');
                          else if (['020', '050'].includes(prefix)) setMomoNetwork('vodafone');
                          else if (['027', '057', '026', '056'].includes(prefix)) setMomoNetwork('airteltigo');
                        }
                      }}
                      placeholder="XX XXX XXXX"
                      className="w-full pl-14 pr-0 py-3 bg-transparent border-b border-background-200 font-label text-base text-foreground-900 placeholder:text-foreground-300 focus:outline-none focus:border-primary-400 transition-colors duration-200 tracking-wider"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 font-body text-xs mt-1 animate-fade-in">{errors.phone}</p>
                  )}
                  <p className="font-body text-[11px] text-foreground-400 mt-2">
                    You'll receive a payment prompt on your phone to confirm
                  </p>
                </div>
              </>
            )}

            {payMethod === 'card' && (
              <>
                <p className="font-label text-xs font-semibold text-foreground-700 uppercase tracking-wider mb-3">
                  Card Details
                </p>


                {/* Card Number Input */}
                <div className="mb-5">
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => {
                        setCardNumber(e.target.value);
                        setErrors((prev) => ({ ...prev, cardNumber: '' }));
                      }}
                      placeholder="Card Number"
                      maxLength={19}
                      className="w-full px-0 py-3 bg-transparent border-b border-background-200 font-label text-base text-foreground-900 placeholder:text-foreground-300 focus:outline-none focus:border-primary-400 transition-colors duration-200 tracking-wider"
                    />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {cardNumber.replace(/\D/g, '').length >= 1 && (
                        <i className={`ri-visa-line text-lg ${cardNumber.replace(/\D/g, '').startsWith('4') ? 'text-blue-600' : 'text-foreground-300'}`}></i>
                      )}
                      {cardNumber.replace(/\D/g, '').length >= 1 && (
                        <i className={`ri-mastercard-line text-lg ${cardNumber.replace(/\D/g, '').startsWith('5') ? 'text-red-500' : 'text-foreground-300'}`}></i>
                      )}
                    </div>
                  </div>
                  {errors.cardNumber && (
                    <p className="text-red-500 font-body text-xs mt-1 animate-fade-in">{errors.cardNumber}</p>
                  )}
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => {
                        setCardExpiry(e.target.value);
                        setErrors((prev) => ({ ...prev, expiry: '' }));
                      }}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full px-0 py-3 bg-transparent border-b border-background-200 font-label text-base text-foreground-900 placeholder:text-foreground-300 focus:outline-none focus:border-primary-400 transition-colors duration-200 tracking-wider"
                    />
                    {errors.expiry && (
                      <p className="text-red-500 font-body text-xs mt-1 animate-fade-in">{errors.expiry}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      value={cardCvv}
                      onChange={(e) => {
                        setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3));
                        setErrors((prev) => ({ ...prev, cvv: '' }));
                      }}
                      placeholder="CVV"
                      maxLength={3}
                      className="w-full px-0 py-3 bg-transparent border-b border-background-200 font-label text-base text-foreground-900 placeholder:text-foreground-300 focus:outline-none focus:border-primary-400 transition-colors duration-200 tracking-widest"
                    />
                    {errors.cvv && (
                      <p className="text-red-500 font-body text-xs mt-1 animate-fade-in">{errors.cvv}</p>
                    )}
                  </div>
                </div>

                {/* Cardholder Name */}
                <div className="mb-8">
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => {
                      setCardName(e.target.value);
                      setErrors((prev) => ({ ...prev, name: '' }));
                    }}
                    placeholder="Cardholder Name"
                    className="w-full px-0 py-3 bg-transparent border-b border-background-200 font-label text-base text-foreground-900 placeholder:text-foreground-300 focus:outline-none focus:border-primary-400 transition-colors duration-200 uppercase tracking-wide"
                  />
                  {errors.name && (
                    <p className="text-red-500 font-body text-xs mt-1 animate-fade-in">{errors.name}</p>
                  )}
                </div>
              </>
            )}

            <button
              onClick={handleDetailsContinue}
              disabled={!isDetailsValid()}
              className={`w-full py-4 rounded-2xl font-heading font-bold text-base transition-all duration-300 active:scale-[0.98] ${
                isDetailsValid()
                  ? 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/25'
                  : 'bg-background-200 text-foreground-400 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <div className="animate-fade-in-up">
            <p className="font-label text-xs font-semibold text-foreground-700 uppercase tracking-wider mb-4">
              Confirm Payment
            </p>

            {/* Payment Summary Card */}
            <div className="bg-background-100 rounded-2xl p-5 space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-foreground-600">Payment Method</span>
                <span className="font-label text-sm font-semibold text-foreground-900 flex items-center gap-1.5">
                  {payMethod === 'momo' ? (
                    <>
                      <i className="ri-smartphone-line text-primary-500"></i>
                      Mobile Money
                    </>
                  ) : (
                    <>
                      <i className="ri-bank-card-line text-primary-500"></i>
                      {maskCardForDisplay(cardNumber)}
                    </>
                  )}
                </span>
              </div>

              {payMethod === 'momo' && (
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-foreground-600">Account</span>
                  <span className="font-label text-sm font-semibold text-foreground-900">
                    +233 {phoneNumber}
                  </span>
                </div>
              )}

              {payMethod === 'card' && (
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-foreground-600">Cardholder</span>
                  <span className="font-label text-sm font-semibold text-foreground-900 uppercase">
                    {cardName}
                  </span>
                </div>
              )}

              <div className="border-t border-background-200 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-foreground-600">Subtotal</span>
                  <span className="font-label text-sm text-foreground-900">
                    ₵{total - Math.round(total * 0.05)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-foreground-600">Service Charge (5%)</span>
                  <span className="font-label text-sm text-foreground-900">
                    ₵{Math.round(total * 0.05)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-background-200">
                  <span className="font-heading font-bold text-base text-foreground-900">Total</span>
                  <span className="font-heading font-extrabold text-xl text-primary-500">₵{total}</span>
                </div>
              </div>
            </div>

            {/* Items recap */}
            <div className="bg-background-100 rounded-2xl p-4 mb-6">
              <p className="font-body text-xs text-foreground-500 mb-3">Order Items ({items.length})</p>
              <div className="space-y-2">
                {items.map((item) => {
                  const addOnsTotal = item.selectedAddOns.reduce((s, a) => s + a.price, 0);
                  return (
                    <div key={item.menuItemId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-label text-xs text-foreground-500 flex-shrink-0">{item.quantity}x</span>
                        <span className="font-body text-sm text-foreground-800 truncate">{item.name}</span>
                      </div>
                      <span className="font-label text-sm font-semibold text-foreground-900 flex-shrink-0 ml-3">
                        ₵{(item.price + addOnsTotal) * item.quantity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-accent-50 border border-accent-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <i className="ri-secure-payment-line text-accent-600 text-lg mt-0.5 flex-shrink-0"></i>
              <div>
                <p className="font-label text-xs font-semibold text-accent-900 mb-0.5">Secure Payment</p>
                <p className="font-body text-xs text-accent-700">
                  Your payment details are encrypted and processed securely. We do not store your card or MoMo details.
                </p>
              </div>
            </div>

            <button
              onClick={handleConfirmPayment}
              className="w-full py-4 rounded-2xl bg-primary-500 text-white font-heading font-bold text-base transition-all duration-300 active:scale-[0.98] hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/25 flex items-center justify-center gap-2"
            >
              <i className="ri-lock-line"></i>
              <span>Pay ₵{total}</span>
            </button>
            {paymentError && (
              <p className="text-red-500 font-body text-xs mt-3 text-center">{paymentError}</p>
            )}
          </div>
        )}

        {/* Step: Processing */}
        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            {/* Animated processing card */}
            <div className="w-full max-w-sm bg-background-100 rounded-3xl p-8 flex flex-col items-center">
              {/* Animated payment icon */}
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                  {processingIndex < PROCESSING_MESSAGES.length - 1 ? (
                    <div className="relative">
                      <div className="w-8 h-8 border-3 border-primary-300 border-t-primary-500 rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="animate-bounce-in">
                      <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
                        <i className="ri-check-line text-white text-2xl"></i>
                      </div>
                    </div>
                  )}
                </div>
                {/* Pulse ring when processing */}
                {processingIndex < PROCESSING_MESSAGES.length - 1 && (
                  <div className="absolute inset-0 rounded-full animate-status-glow"></div>
                )}
              </div>

              {/* Status message */}
              <p className="font-heading font-bold text-lg text-foreground-900 mb-1 text-center transition-all duration-300">
                {PROCESSING_MESSAGES[processingIndex].text}
              </p>
              <p className="font-body text-xs text-foreground-500 mb-8">₵{total}</p>

              {/* Progress dots */}
              <div className="flex items-center gap-1.5">
                {PROCESSING_MESSAGES.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all duration-400 ${
                      idx < processingIndex
                        ? 'bg-primary-500'
                        : idx === processingIndex && idx < PROCESSING_MESSAGES.length - 1
                          ? 'bg-primary-500 animate-pulse'
                          : idx === processingIndex
                            ? 'bg-primary-500'
                            : 'bg-background-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && (
          <div className="fixed inset-0 bg-primary-500 z-50 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
            {/* Decorative background circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="w-full max-w-sm text-center relative z-10 flex flex-col items-center">
              {/* Success animation */}
              <div className="animate-bounce-in mb-8">
                <div className="w-24 h-24 rounded-[2rem] bg-white flex items-center justify-center mx-auto shadow-2xl shadow-black/10 rotate-3">
                  <i className="ri-check-double-line text-5xl text-primary-500"></i>
                </div>
              </div>

              <h2 className="font-heading font-extrabold text-3xl text-white mb-3 animate-fade-in-up animation-delay-100">
                Payment Successful!
              </h2>
              <p className="font-body text-base text-white/90 mb-8 max-w-xs mx-auto animate-fade-in-up animation-delay-200">
                Your payment of ₵{total} has been processed. Your order is now being sent to the kitchen.
              </p>

              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 mb-10 inline-block mx-auto animate-fade-in-up animation-delay-300">
                <p className="font-body text-xs text-white/80 mb-1">Order Number</p>
                <p className="font-heading font-extrabold text-2xl text-white tracking-widest">
                  #{orderId?.slice(0, 8).toUpperCase()}
                </p>
              </div>

              <button
                onClick={() => navigate(`/order/${token}/order-status`)}
                className="w-full py-4 rounded-2xl bg-white text-primary-600 font-heading font-bold text-base transition-all duration-300 active:scale-[0.98] shadow-xl shadow-black/10 flex items-center justify-center gap-2 animate-fade-in-up animation-delay-400"
              >
                <span>Track Your Order</span>
                <i className="ri-arrow-right-line"></i>
              </button>

              <p className="font-body text-xs text-white/60 mt-6 animate-fade-in-up animation-delay-500">
                Redirecting in {countdown}s...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
