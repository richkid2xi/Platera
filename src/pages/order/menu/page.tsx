import { useState, useRef, useEffect, useCallback } from 'react';

import CategoryTabs from './components/CategoryTabs';
import MenuItemCard from './components/MenuItemCard';
import ItemDetailModal from './components/ItemDetailModal';

import BottomNav from '@/pages/order/components/BottomNav';
import DesktopNav from '@/pages/order/components/DesktopNav';
import { useOrder } from '@/contexts/OrderContext';
import { useCustomer } from '@/contexts/CustomerContext';

interface MenuItemType {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  image: string;
  popular: boolean;
  available: boolean;
  prepTime: number;
  variants: { id: string; name: string; priceModifier: number }[];
  addOns: { id: string; name: string; price: number }[];
}

export default function Menu() {
  const { menu, restaurant } = useCustomer();
  const [activeCategory, setActiveCategory] = useState(menu[0]?.id || '');
  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);
  const { tableNumber } = useOrder();
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleCategoryChange = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-120px 0px -60% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const categoryId = entry.target.id.replace('category-', '');
          setActiveCategory(categoryId);
        }
      });
    }, observerOptions);

    Object.values(categoryRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background-50 pb-24 ">
      <DesktopNav />

      <header className="px-6 pt-12 pb-4 flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          {restaurant?.logoUrl ? (
            <div className="w-10 h-10 rounded-xl bg-background-100 flex items-center justify-center overflow-hidden p-1.5">
              <img src={restaurant.logoUrl} alt={restaurant.name} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-background-100 flex items-center justify-center overflow-hidden p-1.5">
              <img src="/favicon.png" alt="Platera" className="w-full h-full object-contain" />
            </div>
          )}
          <span className="font-heading font-bold text-xl text-foreground-900">
            {restaurant?.name || 'Platera'}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-background-100 rounded-full px-4 py-2 hover:bg-background-200 transition-colors duration-200">
          <i className="ri-table-line text-foreground-600"></i>
          <span className="font-label text-sm font-semibold text-foreground-700">
            Table {tableNumber}
          </span>
        </div>
      </header>

      <div className="px-4 pt-2 pb-1 max-w-7xl mx-auto w-full">
        <h2 className="font-heading font-extrabold text-2xl text-foreground-900">
          Our Menu
        </h2>
        <p className="font-body text-sm text-foreground-500 mt-1">
          Tap an item to customize your order
        </p>
      </div>

      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <div className="px-4 pt-4 space-y-8 max-w-7xl mx-auto w-full">
        {menu.map((cat: any) => {
          const items = cat.items || [];
          return (
            <div
              key={cat.id}
              id={`category-${cat.id}`}
              className="scroll-mt-20"
              ref={(el) => {
                categoryRefs.current[cat.id] = el;
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {/* Default icon for now */}
                  <i className={`ri-restaurant-line text-primary-500 text-lg`}></i>
                  <h3 className="font-heading font-bold text-lg text-foreground-900">
                    {cat.name}
                  </h3>
                </div>
                <span className="font-label text-xs text-foreground-400 bg-background-100 rounded-full px-2.5 py-1">
                  {items.length} items
                </span>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-10 bg-background-100 rounded-2xl">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-background-200 flex items-center justify-center">
                    <i className="ri-restaurant-line text-2xl text-foreground-300"></i>
                  </div>
                  <p className="font-body text-sm text-foreground-400">
                    No items in this category yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 ">
                  {items.map((item: any) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onSelect={() => setSelectedItem(item)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>


      <BottomNav />

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem as any}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

