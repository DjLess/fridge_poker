// ingredients.js
export const CARD_TYPES = {
  PROTEIN: 'protein',
  CARB: 'carb',
  VEGGIE: 'veggie',
  EXTRA: 'extra'
};

export class IngredientCard {
  constructor(id, name, type, points, icon = '🍽️', tags = []) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.points = points;
    this.icon = icon;
    this.tags = tags;
  }
}

export const BASE_INGREDIENTS = [
  // Standard Ingredients
  new IngredientCard('c1', 'Chicken', CARD_TYPES.PROTEIN, 15, '🍗', ['meat']),
  new IngredientCard('c2', 'Beef', CARD_TYPES.PROTEIN, 20, '🥩', ['meat']),
  new IngredientCard('c3', 'Tofu', CARD_TYPES.PROTEIN, 10, '🧊', ['vegan']),
  new IngredientCard('c4', 'Rice', CARD_TYPES.CARB, 10, '🍚', []),
  new IngredientCard('c5', 'Pasta', CARD_TYPES.CARB, 12, '🍝', []),
  new IngredientCard('c6', 'Broccoli', CARD_TYPES.VEGGIE, 8, '🥦', ['vegan']),
  new IngredientCard('c7', 'Carrot', CARD_TYPES.VEGGIE, 6, '🥕', ['vegan']),
  new IngredientCard('c8', 'Grated Cheese', CARD_TYPES.EXTRA, 15, '🧀', []),
  
  // Metaphorical / Special Cards
  new IngredientCard('m1', 'Love', CARD_TYPES.EXTRA, 25, '❤️', ['meta']),
  new IngredientCard('m2', 'Patience', CARD_TYPES.EXTRA, 10, '⏳', ['meta']),
  new IngredientCard('m3', 'Secret Sauce', CARD_TYPES.EXTRA, 30, '🏺', ['meta']),
  new IngredientCard('m4', "Grandma's Hug", CARD_TYPES.EXTRA, 20, '👵', ['meta']),
  new IngredientCard('m5', 'Midnight Snack', CARD_TYPES.EXTRA, 18, '🌙', ['meta'])
];