// Shared menu types used across frontend
export interface MenuItemVariant {
  id: string;
  name: string;
  priceModifier: number;
}

export interface MenuItemAddOn {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string | number;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  imageUrl?: string;
  available: boolean;
  popular?: boolean;
  requiresPrep?: boolean;
  prepTime?: number;
  variants?: MenuItemVariant[];
  addOns?: MenuItemAddOn[];
}

export type OrderStatus =
  | 'NEW'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'CANCELLED';
