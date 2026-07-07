import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useOrder } from '@/contexts/OrderContext';

const navItems = [
  { path: '/menu', label: 'Menu', icon: 'ri-restaurant-2-line' },
  { path: '/cart', label: 'Cart', icon: 'ri-shopping-bag-3-line', showBadge: true },
  { path: '/order-status', label: 'Games', icon: 'ri-gamepad-line' },
  { path: '/feedback', label: 'Feedback', icon: 'ri-star-line' },
];

export default function BottomNav() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount } = useOrder();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 bg-background-50 border-t border-background-200/70 px-2 pb-[env(safe-area-inset-bottom,8px)]">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const fullPath = `/order/${token}${item.path}`;
          const isActive = location.pathname === fullPath;
          return (
            <button
              key={item.path}
              onClick={() => navigate(fullPath)}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-1 relative active:scale-90 transition-transform duration-150"
            >
              <div className="relative">
                <div className="w-7 h-7 flex items-center justify-center">
                  <i
                    className={`${item.icon} text-xl ${isActive ? 'text-primary-500' : 'text-foreground-400'}`}
                  ></i>
                </div>
                {item.showBadge && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-3 w-[18px] h-[18px] rounded-full bg-primary-500 text-white font-label text-[9px] font-bold flex items-center justify-center animate-scale-in">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>
              <span
                className={`font-label text-[10px] font-semibold ${
                  isActive ? 'text-primary-500' : 'text-foreground-400'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-1 h-1 rounded-full bg-primary-500"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
