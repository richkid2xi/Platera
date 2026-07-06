export const restaurantSettings = {
  profile: {
    name: 'Platera Restaurant',
    tagline: 'Authentic Ghanaian Cuisine in the Heart of Accra',
    address: '15 Independence Avenue, Osu, Accra, Ghana',
    phone: '+233 24 567 8900',
    email: 'hello@platera.app',
    website: 'www.platera.app',
    openingHours: {
      monday: { open: '10:00', close: '22:00' },
      tuesday: { open: '10:00', close: '22:00' },
      wednesday: { open: '10:00', close: '22:00' },
      thursday: { open: '10:00', close: '23:00' },
      friday: { open: '10:00', close: '00:00' },
      saturday: { open: '09:00', close: '00:00' },
      sunday: { open: '12:00', close: '21:00' },
    },
  },
  paymentMethods: {
    momoEnabled: true,
    momoProvider: 'MTN Mobile Money',
    momoNumber: '024 567 8900',
    cashEnabled: true,
  },
  taxSettings: {
    vatRate: 12.5,
    nhilRate: 2.5,
    getfundRate: 2.5,
    serviceCharge: 5,
  },
  notifications: {
    newOrderSound: true,
    newOrderNotify: true,
    lowStockNotify: true,
    lowStockThreshold: 5,
    negativeFeedbackNotify: true,
    dailyReportEmail: true,
    dailyReportTime: '22:00',
  },
  appearance: {
    primaryColor: '#FF6B35',
    displayLanguage: 'English',
    currency: 'GHS',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24-hour',
  },
};

export const paymentProviders = [
  { id: 'momo', name: 'Mobile Money', icon: 'ri-smartphone-line', description: 'MTN, Telecel, AT' },
  { id: 'cash', name: 'Cash', icon: 'ri-money-dollar-circle-line', description: 'In-person cash payments' },
];