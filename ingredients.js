// CARD TYPES
export const CARD_TYPES = {
  PROTEIN: 'protein',
  CARB: 'carb',
  VEGGIE: 'veggie',
  EXTRA: 'extra'
};

// INGREDIENT CARD CLASS
export class IngredientCard {
  constructor(id, name, type, points, tags = []) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.points = points;
    this.tags = tags; // e.g., ['meat'], ['vegan'], ['meta']
  }
}

// BASE INGREDIENTS LIST
export const BASE_INGREDIENTS = [
  new IngredientCard('c1', 'Chicken', CARD_TYPES.PROTEIN, 15, ['meat']),
  new IngredientCard('c2', 'Beef', CARD_TYPES.PROTEIN, 20, ['meat']),
  new IngredientCard('c3', 'Tofu', CARD_TYPES.PROTEIN, 10, ['vegan']),
  new IngredientCard('c4', 'Rice', CARD_TYPES.CARB, 10, []),
  new IngredientCard('c5', 'Pasta', CARD_TYPES.CARB, 12, []),
  new IngredientCard('c6', 'Broccoli', CARD_TYPES.VEGGIE, 8, ['vegan']),
  new IngredientCard('c7', 'Carrot', CARD_TYPES.VEGGIE, 6, ['vegan']),
  new IngredientCard('c8', 'Grated Cheese', CARD_TYPES.EXTRA, 15, []),
  new IngredientCard('c9', 'Love', CARD_TYPES.EXTRA, 25, ['meta'])
];