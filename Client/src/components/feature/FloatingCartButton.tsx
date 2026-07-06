import { useCart } from '@/hooks/useCart';
import { useNavigate, useLocation } from 'react-router-dom';

export default function FloatingCartButton() {
  const { itemCount, total } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  if (itemCount === 0 || location.pathname === '/cart' || location.pathname === '/checkout') {
    return null;
  }

  const pagesWithBottomNav = ['/menu', '/order-status', '/feedback'];
  const hasBottomNav = pagesWithBottomNav.includes(location.pathname);
  const bottomClass = hasBottomNav ? 'bottom-20 lg:bottom-6' : 'bottom-6';

  const handleClick = () => {
    navigate('/cart');
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed ${bottomClass} left-4 right-4 z-50 bg-foreground-900 text-white rounded-2xl px-5 py-4 flex items-center justify-between active:scale-[0.98] transition-transform duration-150`}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
            <i className="ri-shopping-bag-3-line text-white text-lg"></i>
          </div>
          {itemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent-500 text-white font-label text-[10px] font-bold flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </div>
        <div className="text-left">
          <p className="font-label text-xs text-background-300">View Cart</p>
          <p className="font-heading font-bold text-sm">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <span className="font-heading font-bold text-lg text-primary-400">
        ₵{total}
      </span>
    </button>
  );
}