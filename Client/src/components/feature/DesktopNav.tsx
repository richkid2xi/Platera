import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';

const desktopNavItems = [
  { path: '/menu', label: 'Menu', icon: 'ri-restaurant-2-line' },
  { path: '/cart', label: 'Cart', icon: 'ri-shopping-bag-3-line', showBadge: true },
  { path: '/order-status', label: 'Games', icon: 'ri-gamepad-line' },
  { path: '/feedback', label: 'Feedback', icon: 'ri-star-line' },
];

export default function DesktopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount } = useCart();

  void location.pathname;

  return (
    <header className="hidden lg:flex fixed top-0 left-0 right-0 z-50 bg-background-50/90 backdrop-blur-xl border-b border-background-200/70">
      <div className="w-full max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <i className="ri-restaurant-2-fill text-white text-base"></i>
          </div>
          <span className="font-heading font-bold text-lg text-foreground-900">
            Platera
          </span>
        </button>

        <nav className="flex items-center gap-1">
          {desktopNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-label text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                    : 'text-foreground-600 hover:bg-background-100 hover:text-foreground-900'
                }`}
              >
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <i className={`${item.icon} text-base`}></i>
                  {item.showBadge && itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 w-[18px] h-[18px] rounded-full bg-accent-500 text-white font-label text-[9px] font-bold flex items-center justify-center animate-cart-badge">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}