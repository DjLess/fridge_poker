// Regular ingredients (Multiple copies added to deck)
export const BASE_INGREDIENTS = [
  // Carbs (C)
  { id: 'rice', name: 'Rice', type: 'carbs', points: 5, icon: '🍚' },
  { id: 'pasta', name: 'Pasta', type: 'carbs', points: 5, icon: '🍝' },
  { id: 'potato', name: 'Potatoes', type: 'carbs', points: 6, icon: '🥔' },
  { id: 'bread', name: 'Bread', type: 'carbs', points: 4, icon: '🍞' },

  // Vegetables (V)
  { id: 'tomato', name: 'Tomato', type: 'vegetable', points: 4, icon: '🍅' },
  { id: 'onion', name: 'Onion', type: 'vegetable', points: 4, icon: '🧅' },
  { id: 'carrot', name: 'Carrot', type: 'vegetable', points: 5, icon: '🥕' },
  { id: 'broccoli', name: 'Broccoli', type: 'vegetable', points: 6, icon: '🥦' },

  // Proteins (P)
  { id: 'beef', name: 'Beef', type: 'protein', points: 12, icon: '🥩' },
  { id: 'chicken', name: 'Chicken', type: 'protein', points: 10, icon: '🍗' },
  { id: 'egg', name: 'Egg', type: 'protein', points: 7, icon: '🥚' },
  { id: 'fish', name: 'Fish', type: 'protein', points: 11, icon: '🐟' },

  // Seasonings & Dairy (S)
  { id: 'garlic', name: 'Garlic & Herbs', type: 'spice', points: 3, multiplierBonus: 1, icon: '🧄' },
  { id: 'cheese', name: 'Cheese', type: 'dairy', points: 6, multiplierBonus: 1, icon: '🧀' },
  { id: 'butter', name: 'Butter', type: 'dairy', points: 4, multiplierBonus: 1, icon: '🧈' },
  { id: 'chili', name: 'Chili Pepper', type: 'spice', points: 2, multiplierBonus: 2, icon: '🌶️' }
];

// Metaphorical / Emotional Special Ingredients (Only 1 copy per deck)
export const METAPHORICAL_INGREDIENTS = [
  { id: 'love', name: 'Love', type: 'special', points: 15, multiplierBonus: 2, icon: '💖' },
  { id: 'patience', name: 'Patience', type: 'special', points: 10, multiplierBonus: 3, icon: '⏳' },
  { id: 'grandma_hug', name: "Grandma's Hug", type: 'special', points: 25, multiplierBonus: 4, icon: '👵' }
];