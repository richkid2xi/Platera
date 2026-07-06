export const menuCategories = [
  { id: 'starters', name: 'Starters', icon: 'ri-bowl-line' },
  { id: 'mains', name: 'Mains', icon: 'ri-restaurant-line' },
  { id: 'drinks', name: 'Drinks', icon: 'ri-goblet-line' },
  { id: 'desserts', name: 'Desserts', icon: 'ri-cake-line' },
];

export const menuItems = [
  {
    id: 'item-1',
    category: 'starters',
    name: 'Kelewele',
    description: 'Spicy fried plantains seasoned with ginger, cayenne pepper, and aromatic spices. A quintessential Ghanaian street food favorite.',
    price: 25,
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&h=800&fit=crop&q=80',
    popular: true,
    inStock: true,
    spiceLevel: 2,
    addOns: [
      { name: 'Extra Peanuts', price: 5 },
      { name: 'Side of Shito', price: 3 },
    ],
  },
  {
    id: 'item-2',
    category: 'starters',
    name: 'Grilled Suya Skewers',
    description: 'Tender beef skewers coated in suya spice blend, grilled to smoky perfection. Served with fresh onions and tomatoes.',
    price: 35,
    image: 'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?w=800&h=800&fit=crop&q=80',
    popular: true,
    inStock: true,
    spiceLevel: 3,
    addOns: [
      { name: 'Extra Suya Spice', price: 2 },
      { name: 'Fried Plantain Side', price: 8 },
    ],
  },
  {
    id: 'item-3',
    category: 'starters',
    name: 'Spring Rolls',
    description: 'Crispy golden spring rolls filled with seasoned vegetables and minced chicken. Served with sweet chili dipping sauce.',
    price: 28,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&h=800&fit=crop&q=80',
    popular: false,
    inStock: true,
    spiceLevel: 1,
    addOns: [
      { name: 'Extra Sauce', price: 2 },
    ],
  },
  {
    id: 'item-4',
    category: 'mains',
    name: 'Jollof Rice with Grilled Chicken',
    description: 'Award-winning smoky Jollof rice paired with tender grilled chicken thigh, fried plantains, and coleslaw. The pride of West Africa.',
    price: 55,
    image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&h=800&fit=crop&q=80',
    popular: true,
    inStock: true,
    spiceLevel: 2,
    addOns: [
      { name: 'Extra Chicken', price: 15 },
      { name: 'Fried Egg', price: 5 },
      { name: 'Extra Plantain', price: 8 },
    ],
  },
  {
    id: 'item-5',
    category: 'mains',
    name: 'Waakye Platter',
    description: 'Hearty rice and beans cooked with millet leaves, served with spaghetti, gari foto, boiled egg, and your choice of protein.',
    price: 45,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=800&fit=crop&q=80',
    popular: false,
    inStock: true,
    spiceLevel: 2,
    addOns: [
      { name: 'Fish', price: 12 },
      { name: 'Chicken', price: 15 },
      { name: 'Extra Egg', price: 5 },
    ],
  },
  {
    id: 'item-6',
    category: 'mains',
    name: 'Grilled Tilapia with Banku',
    description: 'Whole grilled tilapia marinated in herbs and spices, served with smooth fermented banku and fresh pepper sauce.',
    price: 65,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=800&fit=crop&q=80',
    popular: true,
    inStock: true,
    spiceLevel: 3,
    addOns: [
      { name: 'Extra Banku', price: 8 },
      { name: 'Extra Pepper Sauce', price: 3 },
    ],
  },
  {
    id: 'item-7',
    category: 'mains',
    name: 'Fufu with Light Soup',
    description: 'Smooth pounded fufu served in a flavorful light soup with tender goat meat. A comforting Ghanaian classic.',
    price: 50,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=800&fit=crop&q=80',
    popular: false,
    inStock: true,
    spiceLevel: 2,
    addOns: [
      { name: 'Extra Meat', price: 18 },
    ],
  },
  {
    id: 'item-8',
    category: 'mains',
    name: 'Red Red with Fried Plantain',
    description: 'Stewed black-eyed peas cooked in red palm oil with ripe fried plantains. A rich, hearty vegetarian favorite.',
    price: 40,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=800&fit=crop&q=80',
    popular: false,
    inStock: true,
    spiceLevel: 1,
    addOns: [
      { name: 'Avocado Side', price: 10 },
    ],
  },
  {
    id: 'item-9',
    category: 'drinks',
    name: 'Sobolo (Hibiscus Iced Tea)',
    description: 'Refreshing homemade hibiscus tea infused with ginger, pineapple, and a hint of mint. Served ice cold.',
    price: 15,
    image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=800&h=800&fit=crop&q=80',
    popular: true,
    inStock: true,
    spiceLevel: 0,
    addOns: [
      { name: 'Extra Ginger', price: 2 },
    ],
  },
  {
    id: 'item-10',
    category: 'drinks',
    name: 'Fresh Coconut Water',
    description: 'Young coconut served whole with a straw. Pure, natural, and incredibly refreshing. Straight from the coast.',
    price: 18,
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=800&h=800&fit=crop&q=80',
    popular: false,
    inStock: true,
    spiceLevel: 0,
    addOns: [],
  },
  {
    id: 'item-11',
    category: 'drinks',
    name: 'Ghanaian Ginger Drink (Emudro)',
    description: 'Bold and spicy homemade ginger drink blended with cloves and citrus. Packs a punch and aids digestion.',
    price: 12,
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&h=800&fit=crop&q=80',
    popular: false,
    inStock: false,
    spiceLevel: 0,
    addOns: [],
  },
  {
    id: 'item-12',
    category: 'drinks',
    name: 'Chapman Cocktail',
    description: 'Our signature mix of Fanta, Sprite, grenadine, cucumber, lemon, and bitters. The ultimate African party drink.',
    price: 22,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&h=800&fit=crop&q=80',
    popular: true,
    inStock: true,
    spiceLevel: 0,
    addOns: [
      { name: 'Extra Bitters', price: 3 },
    ],
  },
  {
    id: 'item-13',
    category: 'desserts',
    name: 'Pineapple Coconut Cake',
    description: 'Moist layered cake with fresh pineapple filling and coconut cream frosting. A tropical slice of heaven.',
    price: 30,
    image: 'https://images.unsplash.com/photo-1559620192-032c4bc4674e?w=800&h=800&fit=crop&q=80',
    popular: true,
    inStock: true,
    spiceLevel: 0,
    addOns: [
      { name: 'Vanilla Ice Cream Scoop', price: 8 },
    ],
  },
  {
    id: 'item-14',
    category: 'desserts',
    name: 'Bofrot (Ghanaian Doughnuts)',
    description: 'Six pieces of freshly fried golden doughnut balls, crispy outside and pillowy inside. Dusted with cinnamon sugar.',
    price: 20,
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&h=800&fit=crop&q=80',
    popular: false,
    inStock: true,
    spiceLevel: 0,
    addOns: [
      { name: 'Chocolate Dip', price: 5 },
    ],
  },
  {
    id: 'item-15',
    category: 'desserts',
    name: 'Mango Sorbet',
    description: 'Silky smooth homemade sorbet made from ripe Ghanaian mangoes. Light, refreshing, and bursting with tropical flavor.',
    price: 22,
    image: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=800&h=800&fit=crop&q=80',
    popular: false,
    inStock: true,
    spiceLevel: 0,
    addOns: [],
  },
];

export const featuredSpecials = [
  {
    id: 'special-1',
    name: "Chef's Jollof Special",
    description: 'Our award-winning Jollof with grilled chicken + free Sobolo',
    price: 60,
    originalPrice: 70,
    image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=1200&h=600&fit=crop&q=80',
  },
  {
    id: 'special-2',
    name: 'Weekend Banku Feast',
    description: 'Grilled tilapia + banku + pepper sauce combo at a special price',
    price: 55,
    originalPrice: 73,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200&h=600&fit=crop&q=80',
  },
];

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedAddOns: { name: string; price: number }[];
  specialInstructions: string;
  spiceLevel: number;
}

export const tableNumber = 7;
export const restaurantName = 'Platera';
export const serviceChargeRate = 0.05;