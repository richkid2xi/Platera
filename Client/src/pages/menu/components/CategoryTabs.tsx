import { menuCategories } from '@/mocks/menu';

interface Props {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function CategoryTabs({ activeCategory, onCategoryChange }: Props) {
  return (
    <div className="sticky top-0 lg:top-16 z-40 bg-background-50/95 backdrop-blur-md border-b border-background-200/70">
      <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide max-w-7xl mx-auto w-full">
        {menuCategories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                onCategoryChange(cat.id);
                const el = document.getElementById(`category-${cat.id}`);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full font-label text-sm font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-primary-500 text-white'
                  : 'bg-background-100 text-foreground-600 hover:bg-background-200'
              }`}
            >
              <i className={`${cat.icon} text-base`}></i>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}