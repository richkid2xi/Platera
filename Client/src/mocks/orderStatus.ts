export const orderSteps = [
  { id: 'placed', label: 'Order Placed', icon: 'ri-check-line' },
  { id: 'confirmed', label: 'Confirmed', icon: 'ri-check-double-line' },
  { id: 'preparing', label: 'Preparing', icon: 'ri-fire-line' },
  { id: 'ready', label: 'Ready', icon: 'ri-restaurant-2-line' },
];

export const mockOrderStatus = {
  currentStep: 'preparing',
  estimatedMinutes: 12,
  orderNumber: 'PLT-2847',
  placedAt: '14:32',
};

export const triviaQuestions = [
  {
    question: 'What is the main ingredient in Jollof rice?',
    options: ['Rice', 'Pasta', 'Potatoes', 'Bread'],
    correctIndex: 0,
    funFact: 'Jollof rice is a beloved dish across West Africa, and each country claims their version is the best!',
  },
  {
    question: 'What gives Waakye its distinctive dark color?',
    options: ['Food coloring', 'Millet leaves', 'Soy sauce', 'Cocoa powder'],
    correctIndex: 1,
    funFact: 'Millet leaves (or sorghum leaves) give Waakye its signature deep burgundy-brown color and a subtle earthy flavor.',
  },
  {
    question: 'Which country is famous for the "Jollof Wars" rivalry with Ghana?',
    options: ['Kenya', 'South Africa', 'Nigeria', 'Senegal'],
    correctIndex: 2,
    funFact: 'The friendly Jollof rivalry between Ghana and Nigeria is legendary — both claim to make the best Jollof, but we all know who wins!',
  },
  {
    question: 'What is Kelewele primarily made from?',
    options: ['Yam', 'Plantain', 'Cassava', 'Sweet potato'],
    correctIndex: 1,
    funFact: 'Kelewele is made from ripe plantains seasoned with ginger, cayenne, and spices, then fried to golden perfection.',
  },
  {
    question: 'What is the base of Fufu?',
    options: ['Wheat flour', 'Pounded cassava and plantain', 'Corn dough', 'Rice flour'],
    correctIndex: 1,
    funFact: 'Fufu is made by pounding boiled cassava and plantain until smooth and stretchy. It is a staple across West Africa!',
  },
  {
    question: 'Which Ghanaian drink is made from hibiscus flowers?',
    options: ['Chapman', 'Sobolo', 'Emudro', 'Pito'],
    correctIndex: 1,
    funFact: 'Sobolo (hibiscus tea) is not only refreshing but also packed with antioxidants and vitamin C!',
  },
  {
    question: 'What does "Akwaaba" mean?',
    options: ['Goodbye', 'Thank you', 'Welcome', 'Delicious'],
    correctIndex: 2,
    funFact: '"Akwaaba" means "Welcome" in Twi. It reflects the warmth and hospitality Ghanaians are famous for!',
  },
  {
    question: 'Red Red gets its name from...',
    options: ['The red pepper used', 'The red palm oil and plantains', 'The red tomatoes only', 'The chef who created it'],
    correctIndex: 1,
    funFact: 'Red Red is named for the vibrant red color from palm oil and the fried ripe plantains served alongside the bean stew.',
  },
];