import { CARD_TYPES } from './ingredients.js';

export class DishEvaluator {
  static evaluate(selectedCards) {
    if (!selectedCards || selectedCards.length === 0) {
      return { name: 'Empty Plate', multiplier: 0, basePoints: 0 };
    }

    const types = selectedCards.map(c => c.type);
    const basePoints = selectedCards.reduce((sum, c) => sum + c.points, 0);

    const hasProtein = types.includes(CARD_TYPES.PROTEIN);
    const hasCarb = types.includes(CARD_TYPES.CARB);
    const hasVeggie = types.includes(CARD_TYPES.VEGGIE);

    // Named special recipe matching logic
    const names = selectedCards.map(c => c.name.toLowerCase());
    if (names.includes('beef') && names.includes('rice') && names.includes('broccoli')) {
      return { name: 'Stir-fry Beef Rice', multiplier: 2.5, basePoints };
    }

    // Default combinations
    if (hasProtein && hasCarb && hasVeggie) {
      return { name: 'Complete Balanced Meal', multiplier: 1.5, basePoints };
    } else if (hasProtein || hasCarb || hasVeggie) {
      return { name: 'Incomplete Meal', multiplier: 1.0, basePoints };
    } else {
      return { name: 'Side Snack', multiplier: 0.5, basePoints };
    }
  }
}