import { useRef, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import DesktopNav from '@/pages/order/components/DesktopNav';
import { useCustomer } from '@/contexts/CustomerContext';

export default function Home() {
  const { token } = useParams<{ token: string }>();
  const { restaurant, table, menu } = useCustomer();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Derive featured specials from popular menu items
  const featuredSpecials = menu.flatMap((cat: any) => cat.items || []).filter((item: any) => item.popular);

  const updateScrollButtons = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = 280;
    const target =
      direction === 'left'
        ? el.scrollLeft - scrollAmount
        : el.scrollLeft + scrollAmount;
    el.scrollTo({ left: target, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background-50 flex flex-col">
      <DesktopNav />

      <main className="flex-1 flex flex-col ">
        <header className="px-6 pt-12 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
              <i className="ri-restaurant-2-fill text-white text-lg"></i>
            </div>
            <span className="font-heading font-bold text-xl text-foreground-900">
              {restaurant?.name || 'Platera'}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-background-100 rounded-full px-4 py-2 hover:bg-background-200 transition-colors duration-200">
            <i className="ri-table-line text-foreground-600"></i>
            <span className="font-label text-sm font-semibold text-foreground-700">
              Table {table?.tableNumber || '?'}
            </span>
          </div>
        </header>

        <div className="max-w-5xl mx-auto w-full px-6 flex flex-col flex-1">
          <div className="flex-1 flex flex-col justify-center py-8 ">
            <div className="animate-fade-in-up">
              <p className="font-label text-sm font-semibold text-primary-500 tracking-wider uppercase mb-3">
                Welcome to {restaurant?.name || 'Platera'}
              </p>
              <h1 className="font-heading font-extrabold text-4xl text-foreground-900 leading-tight mb-3">
                Good food,<br />
                <span className="text-primary-500">good vibes.</span>
              </h1>
              <p className="font-body text-foreground-600 text-base leading-relaxed mb-8 max-w-md ">
                Browse our menu, order from your table, and we'll bring everything
                straight to you. No waiting in line, no waving for attention.
              </p>
            </div>

            {featuredSpecials.length > 0 && (
              <div className="animate-fade-in-up animation-delay-200 mb-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-label text-xs font-semibold text-accent-600 uppercase tracking-wider">
                    Today's Specials
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => scroll('left')}
                      disabled={!canScrollLeft}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                        canScrollLeft
                          ? 'bg-background-200 text-foreground-600 hover:bg-background-300 hover:text-foreground-900 active:scale-90'
                          : 'bg-background-100 text-foreground-300 cursor-not-allowed'
                      }`}
                      aria-label="Scroll specials left"
                    >
                      <i className="ri-arrow-left-s-line text-base"></i>
                    </button>
                    <button
                      onClick={() => scroll('right')}
                      disabled={!canScrollRight}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                        canScrollRight
                          ? 'bg-background-200 text-foreground-600 hover:bg-background-300 hover:text-foreground-900 active:scale-90'
                          : 'bg-background-100 text-foreground-300 cursor-not-allowed'
                      }`}
                      aria-label="Scroll specials right"
                    >
                      <i className="ri-arrow-right-s-line text-base"></i>
                    </button>
                  </div>
                </div>
                <div
                  ref={scrollContainerRef}
                  onScroll={updateScrollButtons}
                  className="flex gap-3 overflow-x-auto scrollbar-hide -mx-6 px-6 scroll-smooth snap-x snap-mandatory"
                >
                  {featuredSpecials.map((special) => (
                    <div
                      key={special.id}
                      className="flex-shrink-0 w-64 bg-gradient-to-br from-background-100 to-background-200 rounded-2xl overflow-hidden snap-start hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                      data-product-shop="true"
                    >
                      <div className="h-32 overflow-hidden">
                        <img
                          src={special.image}
                          alt={special.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-3">
                        <p className="font-heading font-semibold text-sm text-foreground-900">
                          {special.name}
                        </p>
                        <p className="font-body text-xs text-foreground-500 mt-1">
                          {special.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="font-heading font-bold text-primary-500 text-lg">
                            ₵{special.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="animate-fade-in-up animation-delay-300">
              <Link
                to={`/order/${token}/menu`}
                className="group relative w-full bg-primary-500 hover:bg-primary-600 active:scale-[0.98] transition-all duration-200 text-white font-heading font-bold text-lg py-4 px-10 rounded-2xl flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-primary-500/25"
              >
                <span>View Menu</span>
                <i className="ri-arrow-right-line group-hover:translate-x-1.5 transition-transform duration-300"></i>
              </Link>
            </div>
          </div>

          <div className="py-6 animate-fade-in animation-delay-500">
            <div className="relative h-48 rounded-3xl overflow-hidden group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=600&fit=crop&q=80"
                alt="Platera restaurant dining experience"
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="font-heading font-semibold text-white text-sm ">
                  Fresh ingredients, bold flavors, unforgettable moments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
