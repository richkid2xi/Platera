import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderSteps, mockOrderStatus } from '@/mocks/orderStatus';
import { useCart } from '@/hooks/useCart';
import TriviaGame from './components/TriviaGame';
import ReflexGame from './components/ReflexGame';
import BottomNav from '@/components/feature/BottomNav';
import DesktopNav from '@/components/feature/DesktopNav';

function ProgressTracker({ currentStep }: { currentStep: string }) {
  const currentIndex = orderSteps.findIndex((s) => s.id === currentStep);

  return (
    <div className="px-4 max-w-2xl mx-auto w-full">
      <div className="flex items-start justify-between relative">
        <div className="absolute top-5 left-[calc(12.5%+10px)] right-[calc(12.5%+10px)] h-1 bg-background-200 rounded-full">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${(currentIndex / (orderSteps.length - 1)) * 100}%`,
            }}
          ></div>
        </div>
        {orderSteps.map((step, idx) => {
          const isActive = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div
              key={step.id}
              className="flex flex-col items-center relative z-10 flex-1"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'bg-background-200 text-foreground-400'
                } ${isCurrent ? 'animate-status-glow' : ''}`}
              >
                <i className={`${step.icon} text-sm`}></i>
              </div>
              <span
                className={`font-label text-[10px] mt-2 text-center leading-tight transition-colors duration-300 ${
                  isActive ? 'text-foreground-900 font-semibold' : 'text-foreground-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WaitTimeDisplay({ minutes }: { minutes: number }) {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const displayMinutes = Math.floor(timeLeft / 60);
  const displaySeconds = timeLeft % 60;

  return (
    <div className="px-4 max-w-2xl mx-auto w-full">
      <div className="bg-gradient-to-br from-foreground-900 to-foreground-800 rounded-2xl p-5 text-center">
        <p className="font-label text-xs font-semibold text-background-300 uppercase tracking-wider mb-2">
          Estimated Wait Time
        </p>
        <div className="font-heading font-extrabold text-5xl text-white mb-1">
          {displayMinutes}:{String(displaySeconds).padStart(2, '0')}
        </div>
        <p className="font-body text-sm text-background-300">
          {timeLeft > 0
            ? 'Your food is being prepared with care'
            : 'Your order should be ready now!'}
        </p>
        <div className="mt-3 inline-flex items-center gap-2 bg-background-50/10 rounded-full px-4 py-1.5">
          <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></span>
          <span className="font-label text-xs text-background-200">
            Order #{mockOrderStatus.orderNumber}
          </span>
        </div>
      </div>
    </div>
  );
}

function GameSwitcher() {
  const [activeGame, setActiveGame] = useState<'trivia' | 'reflex'>('trivia');

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="px-4 flex items-center justify-between mb-3">
        <h3 className="font-heading font-bold text-lg text-foreground-900">
          While You Wait
        </h3>
      </div>

      <div className="px-4 mb-4">
        <div className="flex bg-background-100 rounded-full p-1">
          <button
            onClick={() => setActiveGame('trivia')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full font-label text-xs font-semibold transition-all duration-300 active:scale-95 ${
              activeGame === 'trivia'
                ? 'bg-accent-500 text-white'
                : 'text-foreground-500 hover:text-foreground-700'
            }`}
          >
            <i className="ri-lightbulb-flash-line text-sm"></i>
            <span>Trivia</span>
          </button>
          <button
            onClick={() => setActiveGame('reflex')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full font-label text-xs font-semibold transition-all duration-300 active:scale-95 ${
              activeGame === 'reflex'
                ? 'bg-secondary-500 text-white'
                : 'text-foreground-500 hover:text-foreground-700'
            }`}
          >
            <i className="ri-flashlight-line text-sm"></i>
            <span>Tap Frenzy</span>
          </button>
        </div>
      </div>

      {activeGame === 'trivia' ? <TriviaGame /> : <ReflexGame />}
    </div>
  );
}

function CallWaiterButton() {
  const [called, setCalled] = useState(false);

  const handleCall = () => {
    setCalled(true);
    setTimeout(() => setCalled(false), 3000);
  };

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-30">
      <button
        onClick={handleCall}
        className={`flex items-center gap-2 px-4 py-3 rounded-full font-label text-sm font-semibold transition-all duration-300 active:scale-95 animate-haptic-press hover:shadow-lg ${
          called
            ? 'bg-accent-500 text-white'
            : 'bg-foreground-900 text-white hover:bg-foreground-800'
        }`}
      >
        <i className={`${called ? 'ri-check-line' : 'ri-user-voice-line'} text-base`}></i>
        <span>{called ? 'Waiter Called!' : 'Call Waiter'}</span>
      </button>
    </div>
  );
}

export default function OrderStatus() {
  const { items, lastOrder } = useCart();
  const displayItems = items.length > 0 ? items : (lastOrder || []);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  return (
    <div className="min-h-screen bg-background-50 pb-24 lg:pb-8">
      <DesktopNav />

      <div className="lg:pt-24">
        <header className="px-4 pt-12 lg:pt-0 pb-4 flex items-center gap-3 max-w-2xl mx-auto w-full">
          <Link
            to="/menu"
            className="w-9 h-9 rounded-xl bg-background-100 flex items-center justify-center active:scale-90 hover:bg-background-200 transition-all duration-200"
          >
            <i className="ri-arrow-left-line text-foreground-700"></i>
          </Link>
          <div>
            <h1 className="font-heading font-bold text-xl text-foreground-900">
              Order Status
            </h1>
            <p className="font-body text-xs text-foreground-500">
              #{mockOrderStatus.orderNumber}
            </p>
          </div>
          <div className="flex-1"></div>
          <span className="font-label text-xs text-foreground-500">
            {mockOrderStatus.placedAt}
          </span>
        </header>

        <div className="space-y-6">
          <ProgressTracker currentStep={mockOrderStatus.currentStep} />
          <WaitTimeDisplay minutes={mockOrderStatus.estimatedMinutes} />
          <GameSwitcher />

          {mockOrderStatus.currentStep === 'ready' && (
            <div className="px-4 max-w-2xl mx-auto w-full">
              <div className="bg-gradient-to-br from-accent-100 to-accent-50 rounded-2xl p-5 text-center animate-status-ready">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-accent-500 flex items-center justify-center">
                  <i className="ri-star-line text-2xl text-white"></i>
                </div>
                <h4 className="font-heading font-bold text-lg text-foreground-900 mb-1">
                  Enjoy your meal!
                </h4>
                <p className="font-body text-sm text-foreground-600 mb-4">
                  When you're done, let us know how everything tasted. Your feedback helps us improve!
                </p>
                <Link
                  to="/feedback"
                  className="inline-flex items-center gap-2 bg-accent-500 text-white font-heading font-bold text-sm py-3 px-6 rounded-xl active:scale-95 hover:bg-accent-600 transition-all duration-200 hover:shadow-lg hover:shadow-accent-500/25"
                >
                  <i className="ri-edit-line"></i>
                  <span>Leave Feedback</span>
                </Link>
              </div>
            </div>
          )}

          <div className="px-4 max-w-2xl mx-auto w-full">
            <Link
              to="/feedback"
              className="w-full flex items-center justify-between py-3 px-4 bg-background-100 rounded-xl active:scale-[0.99] hover:bg-background-200 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent-100 flex items-center justify-center">
                  <i className="ri-star-line text-accent-500 text-lg"></i>
                </div>
                <span className="font-heading font-semibold text-sm text-foreground-800">
                  Leave Feedback
                </span>
              </div>
              <i className="ri-arrow-right-s-line text-foreground-400"></i>
            </Link>
          </div>

          <div className="px-4 max-w-2xl mx-auto w-full">
            <button
              onClick={() => setShowOrderDetails(!showOrderDetails)}
              className="w-full flex items-center justify-between py-3 px-4 bg-background-100 rounded-xl hover:bg-background-200 transition-all duration-200"
            >
              <span className="font-heading font-semibold text-sm text-foreground-800">
                {showOrderDetails ? 'Hide Order Details' : 'View Order Details'}
              </span>
              <i
                className={`${
                  showOrderDetails ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'
                } text-foreground-500 transition-transform duration-300`}
              ></i>
            </button>

            {showOrderDetails && (
              <div className="mt-2 bg-background-100 rounded-xl p-3 space-y-2 animate-fade-in">
                {displayItems.length > 0
                  ? displayItems.map((item) => (
                      <div
                        key={item.menuItemId}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-label text-xs text-foreground-600">
                            {item.quantity}x
                          </span>
                          <span className="font-body text-sm text-foreground-800">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-label text-xs text-foreground-500">
                          ₵{item.price}
                        </span>
                      </div>
                    ))
                  : (
                    <p className="font-body text-sm text-foreground-500 text-center py-4">
                      Order details will appear here once your order is placed.
                    </p>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>

      <CallWaiterButton />
      <BottomNav />
    </div>
  );
}