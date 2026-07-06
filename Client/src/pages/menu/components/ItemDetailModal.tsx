import { useState } from 'react';
import { useCart } from '@/hooks/useCart';

interface AddOn {
  name: string;
  price: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  popular: boolean;
  inStock: boolean;
  spiceLevel: number;
  addOns: AddOn[];
}

interface Props {
  item: MenuItem;
  onClose: () => void;
}

export default function ItemDetailModal({ item, onClose }: Props) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [spiceLevel, setSpiceLevel] = useState(item.spiceLevel);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [addedAnimation, setAddedAnimation] = useState(false);

  const toggleAddOn = (addon: AddOn) => {
    setSelectedAddOns((prev) =>
      prev.find((a) => a.name === addon.name)
        ? prev.filter((a) => a.name !== addon.name)
        : [...prev, addon]
    );
  };

  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const itemTotal = (item.price + addOnsTotal) * quantity;

  const handleAddToCart = () => {
    const cartItem = {
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity,
      selectedAddOns,
      specialInstructions,
      spiceLevel,
    };
    addItem(cartItem);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
      <div
        className="absolute inset-0 bg-foreground-900/60 animate-fade-in"
        onClick={onClose}
      ></div>

      <div className="relative w-full lg:max-w-lg bg-background-50 rounded-t-3xl lg:rounded-3xl animate-slide-up lg:animate-scale-in max-h-[85vh] lg:max-h-[90vh] overflow-y-auto lg:m-4">
        <div className="sticky top-0 z-10 bg-background-50 pt-4 px-5 pb-2 flex items-center justify-between">
          <div className="w-8 h-1 bg-background-300 rounded-full mx-auto absolute top-2 left-1/2 -translate-x-1/2"></div>
          <span className="font-heading font-bold text-base text-foreground-900">
            {item.name}
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-background-100 flex items-center justify-center active:scale-90 transition-transform"
          >
            <i className="ri-close-line text-foreground-600"></i>
          </button>
        </div>

        <div className="px-5">
          <div className="h-56 rounded-2xl overflow-hidden mt-1">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        <div className="px-5 pt-4 pb-6 space-y-5">
          <div>
            <p className="font-body text-sm text-foreground-600 leading-relaxed">
              {item.description}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="font-heading font-bold text-2xl text-foreground-900">
                ₵{item.price}
              </span>
              {item.spiceLevel > 0 && (
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <i
                      key={i}
                      className={`ri-fire-fill text-sm ${
                        i < item.spiceLevel ? 'text-primary-500' : 'text-background-300'
                      }`}
                    ></i>
                  ))}
                </div>
              )}
            </div>
          </div>

          {item.spiceLevel > 0 && (
            <div>
              <p className="font-label text-xs font-semibold text-foreground-700 uppercase tracking-wider mb-2">
                Spice Level
              </p>
              <div className="flex gap-2">
                {[
                  { level: 1, label: 'Mild' },
                  { level: 2, label: 'Medium' },
                  { level: 3, label: 'Hot' },
                ].map((s) => (
                  <button
                    key={s.level}
                    onClick={() => setSpiceLevel(s.level)}
                    className={`flex-1 py-2.5 rounded-xl font-label text-xs font-semibold transition-all duration-200 active:scale-95 ${
                      spiceLevel >= s.level
                        ? 'bg-primary-500 text-white'
                        : 'bg-background-100 text-foreground-500'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {item.addOns.length > 0 && (
            <div>
              <p className="font-label text-xs font-semibold text-foreground-700 uppercase tracking-wider mb-2">
                Add-ons
              </p>
              <div className="space-y-2">
                {item.addOns.map((addon) => {
                  const isSelected = selectedAddOns.some((a) => a.name === addon.name);
                  return (
                    <button
                      key={addon.name}
                      onClick={() => toggleAddOn(addon)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 active:scale-[0.99] ${
                        isSelected
                          ? 'bg-primary-100 border border-primary-300'
                          : 'bg-background-100 border border-transparent'
                      }`}
                    >
                      <span className="font-body text-sm text-foreground-800">
                        {addon.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-label text-xs text-foreground-500">
                          +₵{addon.price}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-primary-500 text-white'
                              : 'border-2 border-background-300'
                          }`}
                        >
                          {isSelected && <i className="ri-check-line text-xs"></i>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <p className="font-label text-xs font-semibold text-foreground-700 uppercase tracking-wider mb-2">
              Special Instructions
            </p>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value.slice(0, 150))}
              placeholder='e.g. "No pepper please", "Extra spicy"...'
              maxLength={150}
              rows={2}
              className="w-full bg-background-100 border border-background-200 rounded-xl px-4 py-3 font-body text-sm text-foreground-800 placeholder:text-foreground-400 resize-none focus:outline-none focus:border-primary-400 transition-all duration-200 hover:border-background-300"
            ></textarea>
            <p className="font-body text-[10px] text-foreground-400 text-right mt-1">
              {specialInstructions.length}/150
            </p>
          </div>

          <div>
            <p className="font-label text-xs font-semibold text-foreground-700 uppercase tracking-wider mb-2">
              Quantity
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-xl bg-background-100 flex items-center justify-center active:scale-90 transition-transform"
              >
                <i className="ri-subtract-line text-foreground-700"></i>
              </button>
              <span className="font-heading font-bold text-lg text-foreground-900 w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                className="w-10 h-10 rounded-xl bg-background-100 flex items-center justify-center active:scale-90 transition-transform"
              >
                <i className="ri-add-line text-foreground-700"></i>
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className={`w-full py-4 rounded-2xl font-heading font-bold text-base transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 animate-haptic-press ${
              addedAnimation
                ? 'bg-accent-500 text-white animate-cart-ripple'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            }`}
          >
            {addedAnimation ? (
              <>
                <i className="ri-check-line text-xl"></i>
                <span>Added!</span>
              </>
            ) : (
              <>
                <i className="ri-shopping-bag-3-line"></i>
                <span>Add to Cart — ₵{itemTotal}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}