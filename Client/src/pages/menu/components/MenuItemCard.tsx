interface Props {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    popular: boolean;
    inStock: boolean;
    spiceLevel: number;
  };
  onSelect: () => void;
}

export default function MenuItemCard({ item, onSelect }: Props) {
  return (
    <button
      onClick={onSelect}
      disabled={!item.inStock}
      className={`w-full text-left bg-background-100 rounded-2xl overflow-hidden transition-all duration-300 active:scale-[0.97] hover:scale-[1.02] hover:bg-background-200 ${
        item.inStock ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
      }`}
      data-product-shop="true"
    >
      <div className="relative h-44 lg:h-48 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            item.inStock ? 'group-hover:scale-110 hover:scale-105' : ''
          }`}
          loading="lazy"
        />
        {item.popular && item.inStock && (
          <div className="absolute top-3 left-3 bg-accent-500 text-white font-label text-[10px] font-bold px-2.5 py-1 rounded-full animate-bounce-in">
            Popular
          </div>
        )}
        {!item.inStock && (
          <div className="absolute inset-0 bg-foreground-900/60 flex items-center justify-center">
            <span className="bg-background-50 text-foreground-800 font-heading font-bold text-sm px-4 py-1.5 rounded-full">
              Sold Out
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-20 pointer-events-none"></div>
        <div className="absolute bottom-3 right-3 bg-background-50/95 backdrop-blur-sm rounded-full px-3 py-1.5 font-heading font-bold text-sm text-foreground-900">
          ₵{item.price}
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-heading font-semibold text-sm text-foreground-900 leading-tight">
            {item.name}
          </h4>
          {item.spiceLevel > 0 && (
            <div className="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <i
                  key={i}
                  className={`ri-fire-fill text-[10px] ${
                    i < item.spiceLevel ? 'text-primary-500' : 'text-background-300'
                  }`}
                ></i>
              ))}
            </div>
          )}
        </div>
        <p className="font-body text-xs text-foreground-500 mt-1 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      </div>
    </button>
  );
}