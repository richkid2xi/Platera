import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';

export type OrderStatus =
  | 'NEW'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'CANCELLED';

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedAddOns: { id: string; name: string; price: number }[];
  specialInstructions?: string;
  spiceLevel?: number;
  prepTime?: number;
}

export type PaymentMethod = 'now' | 'cash' | null;

export interface CurrentOrder {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
}

export interface OrderState {
  tableId: string | null;
  tableNumber: number | null;
  cart: CartItem[];
  currentOrder: CurrentOrder | null;
  paymentMethod: PaymentMethod;
  feedbackSubmitted: boolean;
}

type OrderAction =
  | { type: 'INIT_TABLE'; payload: { tableId: string; tableNumber: number } }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { menuItemId: string; quantity: number } }
  | { type: 'UPDATE_INSTRUCTIONS'; payload: { menuItemId: string; instructions: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'PLACE_ORDER'; payload: { total: number; orderId: string } }
  | { type: 'UPDATE_ORDER_STATUS'; payload: OrderStatus }
  | { type: 'SUBMIT_FEEDBACK' }
  | { type: 'RESET_ORDER_KEEP_TABLE' };

const initialState: OrderState = {
  tableId: null,
  tableNumber: null,
  cart: [],
  currentOrder: null,
  paymentMethod: null,
  feedbackSubmitted: false,
};

function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case 'INIT_TABLE':
      // If table changes, completely reset state for new table
      if (state.tableId !== action.payload.tableId) {
        return {
          ...initialState,
          tableId: action.payload.tableId,
          tableNumber: action.payload.tableNumber,
        };
      }
      return state;
    case 'ADD_ITEM': {
      const existing = state.cart.find((i) => i.menuItemId === action.payload.menuItemId);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((i) =>
            i.menuItemId === action.payload.menuItemId
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          ),
        };
      }
      return { ...state, cart: [...state.cart, action.payload] };
    }
    case 'REMOVE_ITEM':
      return { ...state, cart: state.cart.filter((i) => i.menuItemId !== action.payload) };
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return { ...state, cart: state.cart.filter((i) => i.menuItemId !== action.payload.menuItemId) };
      }
      return {
        ...state,
        cart: state.cart.map((i) =>
          i.menuItemId === action.payload.menuItemId ? { ...i, quantity: action.payload.quantity } : i
        ),
      };
    }
    case 'UPDATE_INSTRUCTIONS':
      return {
        ...state,
        cart: state.cart.map((i) =>
          i.menuItemId === action.payload.menuItemId ? { ...i, specialInstructions: action.payload.instructions } : i
        ),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload };
    case 'PLACE_ORDER':
      return {
        ...state,
        currentOrder: {
          id: action.payload.orderId,
          items: [...state.cart],
          total: action.payload.total,
          status: 'NEW' as OrderStatus,
        },
        cart: [],
      };
    case 'UPDATE_ORDER_STATUS':
      if (!state.currentOrder) return state;
      return {
        ...state,
        currentOrder: { ...state.currentOrder, status: action.payload },
      };
    case 'SUBMIT_FEEDBACK':
      return { ...state, feedbackSubmitted: true };
    case 'RESET_ORDER_KEEP_TABLE':
      return {
        ...initialState,
        tableId: state.tableId,
        tableNumber: state.tableNumber,
      };
    default:
      return state;
  }
}

interface OrderContextType extends OrderState {
  dispatch: React.Dispatch<OrderAction>;
  itemCount: number;
  subtotal: number;
  serviceCharge: number;
  total: number;
}

const OrderContext = createContext<OrderContextType | null>(null);

const STORAGE_KEY = 'platera_customer_order_state';

const SERVICE_CHARGE_RATE = 0.05;

export function OrderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(orderReducer, initialState, (initial) => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as OrderState;
      }
    } catch (e) {
      console.error('Failed to parse order state from sessionStorage', e);
    }
    return initial;
  });

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const itemCount = state.cart.reduce((sum, i) => sum + i.quantity, 0);

  const subtotal = state.cart.reduce((sum, i) => {
    const addOnsTotal = i.selectedAddOns.reduce((s, a) => s + a.price, 0);
    return sum + (i.price + addOnsTotal) * i.quantity;
  }, 0);

  const serviceCharge = Math.round(subtotal * SERVICE_CHARGE_RATE);
  const total = subtotal + serviceCharge;

  return (
    <OrderContext.Provider value={{ ...state, dispatch, itemCount, subtotal, serviceCharge, total }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}
