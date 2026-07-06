import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { CartItem } from '@/mocks/menu';

interface CartContextType {
  items: CartItem[];
  lastOrder: CartItem[] | null;
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateInstructions: (menuItemId: string, instructions: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  serviceCharge: number;
  total: number;
}

const CartContext = createContext<CartContextType | null>(null);

const SERVICE_CHARGE_RATE = 0.05;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [lastOrder, setLastOrder] = useState<CartItem[] | null>(null);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.menuItemId);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.menuItemId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((menuItemId: string) => {
    setItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  }, []);

  const updateQuantity = useCallback((menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i))
    );
  }, []);

  const updateInstructions = useCallback(
    (menuItemId: string, instructions: string) => {
      setItems((prev) =>
        prev.map((i) =>
          i.menuItemId === menuItemId ? { ...i, specialInstructions: instructions } : i
        )
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setLastOrder([...items]);
    setItems([]);
  }, [items]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const subtotal = items.reduce((sum, i) => {
    const addOnsTotal = i.selectedAddOns.reduce((s, a) => s + a.price, 0);
    return sum + (i.price + addOnsTotal) * i.quantity;
  }, 0);

  const serviceCharge = Math.round(subtotal * SERVICE_CHARGE_RATE);
  const total = subtotal + serviceCharge;

  return (
    <CartContext.Provider
      value={{
        items,
        lastOrder,
        addItem,
        removeItem,
        updateQuantity,
        updateInstructions,
        clearCart,
        itemCount,
        subtotal,
        serviceCharge,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}

export { SERVICE_CHARGE_RATE };