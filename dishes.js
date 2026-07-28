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
  static evaluate(selectedCards, activeDiets = []) {
    if (!selectedCards || selectedCards.length === 0) {
      return { name: 'Empty Plate', multiplier: 0, basePoints: 0, icon: '🍽️', validCardIndices: [] };
    }

    const allowDuplicates = activeDiets.some(d => d.type === 'buffet' || d.allowDuplicateCategories);

    const types = selectedCards.map(c => c.type);
    const names = selectedCards.map(c => c.name.toLowerCase());

    const hasProtein = types.includes(CARD_TYPES.PROTEIN);
    const hasCarb = types.includes(CARD_TYPES.CARB);
    const hasVeggie = types.includes(CARD_TYPES.VEGGIE);

    let matchedDish = { name: 'Side Snack', multiplier: 0.5, icon: '🥪' };

    // 1. Grandma's Comfort Pot
    if (names.includes("grandma's hug") && hasProtein && names.includes('carrot')) {
      matchedDish = { name: "Grandma's Comfort Pot", multiplier: 3.5, icon: '🍲' };
    }
    // 2. Veggie Power Bowl
    else if (names.includes('tofu') && names.includes('broccoli') && names.includes('carrot')) {
      matchedDish = { name: 'Veggie Power Bowl', multiplier: 3.0, icon: '🥗' };
    }
    // 3. Midnight Delight
    else if (names.includes('midnight snack') && names.includes('grated cheese') && names.includes('pasta')) {
      matchedDish = { name: 'Midnight Delight', multiplier: 2.8, icon: '🍝' };
    }
    // 4. Sweet & Savory Roast
    else if (names.includes('beef') && names.includes('carrot') && names.includes('love')) {
      matchedDish = { name: 'Sweet & Savory Roast', multiplier: 2.7, icon: '🍖' };
    }
    // 5. Gourmet Fusion
    else if (names.includes('secret sauce') && hasProtein && hasCarb) {
      matchedDish = { name: 'Gourmet Fusion', multiplier: 2.6, icon: '🍱' };
    }
    // 6. Stir-fry Beef Rice
    else if (names.includes('beef') && names.includes('rice') && names.includes('broccoli')) {
      matchedDish = { name: 'Stir-fry Beef Rice', multiplier: 2.5, icon: '🥘' };
    }
    // 7. Cheesy Chicken Pasta
    else if (names.includes('chicken') && names.includes('pasta') && names.includes('grated cheese')) {
      matchedDish = { name: 'Cheesy Chicken Pasta', multiplier: 2.2, icon: '🧆' };
    }
    // Category Fallbacks
    else if (hasProtein && hasCarb && hasVeggie) {
      matchedDish = { name: 'Balanced Meal', multiplier: 1.5, icon: '🍽️' };
    } else if (hasProtein || hasCarb || hasVeggie) {
      matchedDish = { name: 'Simple Plate', multiplier: 1.0, icon: '🍛' };
    }

    // Filtrado de cartas válidas (regla de no duplicar categoría salvo permiso por Dieta)
    const validCardIndices = [];
    const usedCategories = new Set();

    selectedCards.forEach((card, idx) => {
      const isMainCategory = [CARD_TYPES.PROTEIN, CARD_TYPES.CARB, CARD_TYPES.VEGGIE].includes(card.type);

      if (isMainCategory) {
        if (!usedCategories.has(card.type) || allowDuplicates) {
          usedCategories.add(card.type);
          validCardIndices.push(idx);
        }
      } else {
        // Extras y Meta siempre pasan salvo descartes explícitos
        validCardIndices.push(idx);
      }
    });

    const basePoints = validCardIndices.reduce((sum, idx) => sum + selectedCards[idx].points, 0);

    return {
      name: matchedDish.name,
      multiplier: matchedDish.multiplier,
      basePoints,
      icon: matchedDish.icon,
      validCardIndices
    };
  }
}