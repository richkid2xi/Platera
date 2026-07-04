export const restaurantInfo = {
  name: 'Platera',
  fullName: 'Platera Restaurant',
  location: 'Accra, Ghana',
  logo: 'Platera',
};

export const metricCards = [
  {
    id: 'revenue',
    label: "Today's Revenue",
    value: 'GH₵ 4,850',
    trend: 12.5,
    trendUp: true,
    vsLabel: 'vs yesterday',
    icon: 'ri-money-dollar-circle-line',
  },
  {
    id: 'orders',
    label: 'Orders Today',
    value: '47',
    trend: 8.3,
    trendUp: true,
    vsLabel: 'vs yesterday',
    icon: 'ri-shopping-bag-3-line',
  },
  {
    id: 'avgOrder',
    label: 'Avg Order Value',
    value: 'GH₵ 103.20',
    trend: 3.2,
    trendUp: true,
    vsLabel: 'vs yesterday',
    icon: 'ri-line-chart-line',
  },
  {
    id: 'activeTables',
    label: 'Active Tables',
    value: '12 / 20',
    trend: 5.0,
    trendUp: false,
    vsLabel: 'tables available',
    icon: 'ri-restaurant-line',
  },
];

export const liveOrdersSummary = {
  new: 5,
  confirmed: 3,
  preparing: 8,
  ready: 4,
  served: 27,
};

export const lowStockItems = [
  { id: 1, name: 'Coca-Cola (Bottle)', stock: 3, threshold: 10, unit: 'bottles', category: 'Drinks' },
  { id: 2, name: 'Fresh Tilapia', stock: 2, threshold: 8, unit: 'kg', category: 'Proteins' },
  { id: 3, name: 'Jollof Rice Pack', stock: 1, threshold: 5, unit: 'packs', category: 'Dry Goods' },
  { id: 4, name: 'Plantain', stock: 4, threshold: 15, unit: 'bunches', category: 'Produce' },
  { id: 5, name: 'Tomato Paste', stock: 5, threshold: 12, unit: 'cans', category: 'Condiments' },
];

export const recentFeedback = [
  {
    id: 1,
    table: 7,
    rating: 5,
    comment: 'The jollof rice was absolutely perfect! Best I have had in Accra. Service was fast and the waiter was very attentive.',
    date: '2026-07-03T14:30:00',
    reviewer: 'Kwame A.',
    flagged: false,
    reviewed: false,
  },
  {
    id: 2,
    table: 3,
    rating: 2,
    comment: 'Waited over 40 minutes for our drinks. The food was okay but the slow service really ruined the evening.',
    date: '2026-07-03T13:15:00',
    reviewer: 'Abena M.',
    flagged: true,
    reviewed: false,
  },
  {
    id: 3,
    table: 12,
    rating: 4,
    comment: 'Great ambiance and the grilled tilapia was fresh. Would come back again. The banku was a bit too soft though.',
    date: '2026-07-03T12:00:00',
    reviewer: 'Kofi D.',
    flagged: false,
    reviewed: true,
  },
  {
    id: 4,
    table: 5,
    rating: 5,
    comment: 'Birthday dinner was amazing! The staff sang for us and the cake was on the house. Such a thoughtful touch!',
    date: '2026-07-02T20:45:00',
    reviewer: 'Akua S.',
    flagged: false,
    reviewed: true,
  },
  {
    id: 5,
    table: 9,
    rating: 1,
    comment: 'Found a hair in my waakye. Completely unacceptable. Manager did not even apologize properly. Will not return.',
    date: '2026-07-02T18:30:00',
    reviewer: 'Yaw B.',
    flagged: true,
    reviewed: false,
  },
];

export const salesTrend = [
  { day: 'Jun 27', revenue: 3800, orders: 38 },
  { day: 'Jun 28', revenue: 4200, orders: 42 },
  { day: 'Jun 29', revenue: 5100, orders: 51 },
  { day: 'Jun 30', revenue: 3900, orders: 36 },
  { day: 'Jul 01', revenue: 4500, orders: 44 },
  { day: 'Jul 02', revenue: 4700, orders: 46 },
  { day: 'Jul 03', revenue: 4850, orders: 47 },
];

export const bestSellers = [
  {
    id: 1,
    name: 'Jollof Rice with Chicken',
    category: 'Mains',
    orders: 28,
    revenue: 'GH₵ 1,680',
    image: 'https://readdy.ai/api/search-image?query=Delicious%20Ghanaian%20jollof%20rice%20with%20grilled%20chicken%20on%20a%20white%20ceramic%20plate%2C%20warm%20lighting%2C%20top-down%20food%20photography%2C%20clean%20minimal%20composition%2C%20steaming%20fresh%2C%20vibrant%20orange-red%20rice%20with%20golden%20chicken%20piece%2C%20restaurant%20quality%20presentation&width=120&height=120&seq=platera-bestseller-01&orientation=squarish',
  },
  {
    id: 2,
    name: 'Grilled Tilapia with Banku',
    category: 'Mains',
    orders: 24,
    revenue: 'GH₵ 1,920',
    image: 'https://readdy.ai/api/search-image?query=Grilled%20whole%20tilapia%20fish%20on%20a%20white%20plate%20with%20banku%20balls%2C%20garnished%20with%20sliced%20tomatoes%20and%20onions%2C%20top-down%20food%20photography%2C%20clean%20bright%20lighting%2C%20minimal%20composition%2C%20authentic%20Ghanaian%20dish%20presentation&width=120&height=120&seq=platera-bestseller-02&orientation=squarish',
  },
  {
    id: 3,
    name: 'Waakye Special',
    category: 'Mains',
    orders: 20,
    revenue: 'GH₵ 1,000',
    image: 'https://readdy.ai/api/search-image?query=Authentic%20Ghanaian%20waakye%20rice%20and%20beans%20dish%20on%20a%20white%20ceramic%20plate%20with%20spaghetti%2C%20gari%2C%20and%20stew%2C%20top-down%20food%20photography%2C%20warm%20natural%20lighting%2C%20clean%20composition%2C%20vibrant%20colors&width=120&height=120&seq=platera-bestseller-03&orientation=squarish',
  },
  {
    id: 4,
    name: 'Fresh Coconut Juice',
    category: 'Drinks',
    orders: 32,
    revenue: 'GH₵ 640',
    image: 'https://readdy.ai/api/search-image?query=Fresh%20young%20coconut%20with%20straw%20on%20a%20white%20surface%2C%20minimal%20clean%20product%20photography%2C%20bright%20natural%20lighting%2C%20tropical%20vibe%2C%20food%20photography%20style%2C%20simple%20elegant%20composition&width=120&height=120&seq=platera-bestseller-04&orientation=squarish',
  },
  {
    id: 5,
    name: 'Kelewele (Spiced Plantain)',
    category: 'Starters',
    orders: 26,
    revenue: 'GH₵ 520',
    image: 'https://readdy.ai/api/search-image?query=Golden%20fried%20spiced%20plantain%20kelewele%20cubes%20on%20a%20white%20plate%20with%20groundnuts%2C%20top-down%20food%20photography%2C%20warm%20lighting%2C%20crispy%20texture%20visible%2C%20minimal%20clean%20presentation%2C%20vibrant%20golden%20brown%20color&width=120&height=120&seq=platera-bestseller-05&orientation=squarish',
  },
];