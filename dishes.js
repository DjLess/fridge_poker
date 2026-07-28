// dishes.js
import { CARD_TYPES } from './ingredients.js';

export const RECIPE_BOOK = [
  {
    name: "Grandma's Comfort Pot",
    reqs: ["Grandma's Hug", 'Any Protein', 'Carrot'],
    multiplier: 3.5,
    icon: '🍲',
    desc: "Grandma's Hug + Protein + Carrot"
  },
  {
    name: 'Veggie Power Bowl',
    reqs: ['Tofu', 'Broccoli', 'Carrot'],
    multiplier: 3.0,
    icon: '🥗',
    desc: 'Tofu + Broccoli + Carrot'
  },
  {
    name: 'Midnight Delight',
    reqs: ['Midnight Snack', 'Grated Cheese', 'Pasta'],
    multiplier: 2.8,
    icon: '🍝',
    desc: 'Midnight Snack + Cheese + Pasta'
  },
  {
    name: 'Sweet & Savory Roast',
    reqs: ['Beef', 'Carrot', 'Love'],
    multiplier: 2.7,
    icon: '🍖',
    desc: 'Beef + Carrot + Love'
  },
  {
    name: 'Gourmet Fusion',
    reqs: ['Secret Sauce', '1 Protein', '1 Carb'],
    multiplier: 2.6,
    icon: '🍱',
    desc: 'Secret Sauce + Any Protein + Any Carb'
  },
  {
    name: 'Stir-fry Beef Rice',
    reqs: ['Beef', 'Rice', 'Broccoli'],
    multiplier: 2.5,
    icon: '🥘',
    desc: 'Beef + Rice + Broccoli'
  },
  {
    name: 'Cheesy Chicken Pasta',
    reqs: ['Chicken', 'Pasta', 'Grated Cheese'],
    multiplier: 2.2,
    icon: '🧆',
    desc: 'Chicken + Pasta + Cheese'
  },
  {
    name: 'Balanced Meal',
    reqs: ['1 Protein', '1 Carb', '1 Veggie'],
    multiplier: 1.5,
    icon: '🍽️',
    desc: 'Any Protein + Carb + Veggie'
  },
  {
    name: 'Simple Plate',
    reqs: ['Any 1-2 Categories'],
    multiplier: 1.0,
    icon: '🍛',
    desc: 'Incomplete ingredient combinations'
  },
  {
    name: 'Side Snack',
    reqs: ['Extras Only'],
    multiplier: 0.5,
    icon: '🥪',
    desc: 'Only Extras or Metaphorical items'
  }
];

export class DishEvaluator {
  static evaluate(selectedCards) {
    if (!selectedCards || selectedCards.length === 0) {
      return { name: 'Empty Plate', multiplier: 0, basePoints: 0, icon: '🍽️' };
    }

    const types = selectedCards.map(c => c.type);
    const names = selectedCards.map(c => c.name.toLowerCase());
    const basePoints = selectedCards.reduce((sum, c) => sum + c.points, 0);

    const hasProtein = types.includes(CARD_TYPES.PROTEIN);
    const hasCarb = types.includes(CARD_TYPES.CARB);
    const hasVeggie = types.includes(CARD_TYPES.VEGGIE);

    // 1. Grandma's Comfort Pot
    if (names.includes("grandma's hug") && hasProtein && names.includes('carrot')) {
      return { name: "Grandma's Comfort Pot", multiplier: 3.5, basePoints, icon: '🍲' };
    }

    // 2. Veggie Power Bowl
    if (names.includes('tofu') && names.includes('broccoli') && names.includes('carrot')) {
      return { name: 'Veggie Power Bowl', multiplier: 3.0, basePoints, icon: '🥗' };
    }

    // 3. Midnight Delight
    if (names.includes('midnight snack') && names.includes('grated cheese') && names.includes('pasta')) {
      return { name: 'Midnight Delight', multiplier: 2.8, basePoints, icon: '🍝' };
    }

    // 4. Sweet & Savory Roast
    if (names.includes('beef') && names.includes('carrot') && names.includes('love')) {
      return { name: 'Sweet & Savory Roast', multiplier: 2.7, basePoints, icon: '🍖' };
    }

    // 5. Gourmet Fusion
    if (names.includes('secret sauce') && hasProtein && hasCarb) {
      return { name: 'Gourmet Fusion', multiplier: 2.6, basePoints, icon: '🍱' };
    }

    // 6. Stir-fry Beef Rice
    if (names.includes('beef') && names.includes('rice') && names.includes('broccoli')) {
      return { name: 'Stir-fry Beef Rice', multiplier: 2.5, basePoints, icon: '🥘' };
    }

    // 7. Cheesy Chicken Pasta
    if (names.includes('chicken') && names.includes('pasta') && names.includes('grated cheese')) {
      return { name: 'Cheesy Chicken Pasta', multiplier: 2.2, basePoints, icon: '🧆' };
    }

    // Category Fallbacks
    if (hasProtein && hasCarb && hasVeggie) {
      return { name: 'Balanced Meal', multiplier: 1.5, basePoints, icon: '🍽️' };
    } else if (hasProtein || hasCarb || hasVeggie) {
      return { name: 'Simple Plate', multiplier: 1.0, basePoints, icon: '🍛' };
    } else {
      return { name: 'Side Snack', multiplier: 0.5, basePoints, icon: '🥪' };
    }
  }
}