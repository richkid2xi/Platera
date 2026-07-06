import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CategoryTabs from './components/CategoryTabs';
import MenuItemCard from './components/MenuItemCard';
import ItemDetailModal from './components/ItemDetailModal';
import FloatingCartButton from '@/components/feature/FloatingCartButton';
import BottomNav from '@/components/feature/BottomNav';
import DesktopNav from '@/components/feature/DesktopNav';
import { menuCategories, menuItems } from '@/mocks/menu';

interface MenuItemType {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  image: string;
  popular: boolean;
  inStock: boolean;
  spiceLevel: number;
  addOns: { name: string; price: number }[];
}

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState(menuCategories[0].id);
  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleCategoryChange = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
  }, []);

  const groupedItems = menuCategories.reduce(
    (acc, cat) => {
      acc[cat.id] = menuItems.filter((item) => item.category === cat.id);
      return acc;
    },
    {} as Record<string, typeof menuItems>
  );

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
    <div className="min-h-screen bg-background-50 pb-24 lg:pb-8 lg:pt-16">
      <DesktopNav />

      <header className="px-4 pt-12 lg:pt-6 pb-2 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link
          to="/"
          className="w-9 h-9 rounded-xl bg-background-100 flex items-center justify-center active:scale-90 hover:bg-background-200 transition-all duration-200"
        >
          <i className="ri-arrow-left-line text-foreground-700"></i>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <i className="ri-restaurant-2-fill text-white text-sm"></i>
          </div>
          <span className="font-heading font-bold text-lg text-foreground-900">
            Platera
          </span>
        </div>
        <div className="w-9 h-9"></div>
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
        {menuCategories.map((cat) => {
          const items = groupedItems[cat.id] || [];
          return (
            <div
              key={cat.id}
              id={`category-${cat.id}`}
              ref={(el) => {
                categoryRefs.current[cat.id] = el;
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <i className={`${cat.icon} text-primary-500 text-lg`}></i>
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
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                  {items.map((item) => (
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

      <FloatingCartButton />
      <BottomNav />

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}