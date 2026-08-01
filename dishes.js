{
    id: 'stir_fry_beef',
    name: 'Sautéed Protein & Veggies',
    icon: '🥘',
    multiplier: 4,
    basePoints: 25,
    desc: 'Protein (Beef/Seitan) + Rice/Potato + Onion/Tomato',
    check: (counts, ingredients) => {
      const hasProtein = ingredients.some(i => i.id === 'beef' || i.id === 'seitan' || i.id === 'tofu' || i.id === 'chicken');
      const hasCarb = counts.carbs > 0;
      const hasVeg = counts.vegetable > 0;
      return hasProtein && hasCarb && hasVeg;
    }
  },
  {
    id: 'chicken_rice_veggies',
    name: 'Protein Rice Bowl',
    icon: '🍲',
    multiplier: 3,
    basePoints: 20,
    desc: 'Chicken/Tofu + Rice + Any Vegetable',
    check: (counts, ingredients) => {
      const hasProtein = ingredients.some(i => i.id === 'chicken' || i.id === 'tofu' || i.id === 'beef' || i.id === 'seitan');
      const hasRice = ingredients.some(i => i.id === 'rice');
      return hasProtein && hasRice && counts.vegetable > 0;
    }
  },
  {
    id: 'pasta_bolognese',
    name: 'Classic Protein Pasta',
    icon: '🍝',
    multiplier: 3,
    basePoints: 18,
    desc: 'Pasta + Beef/Seitan + Tomato',
    check: (counts, ingredients) => {
      const hasPasta = ingredients.some(i => i.id === 'pasta');
      const hasProtein = ingredients.some(i => i.id === 'beef' || i.id === 'seitan');
      const hasTomato = ingredients.some(i => i.id === 'tomato');
      return hasPasta && hasProtein && hasTomato;
    }
  },
  {
    id: 'veggie_omelette',
    name: 'Cheesy Veggie Omelette',
    icon: '🍳',
    multiplier: 3,
    basePoints: 15,
    desc: 'Egg/Tempeh + Vegetable + Cheese/Butter',
    check: (counts, ingredients) => {
      const hasEggOrTempeh = ingredients.some(i => i.id === 'egg' || i.id === 'tempeh');
      const hasDairy = counts.dairy > 0;
      return hasEggOrTempeh && counts.vegetable > 0 && hasDairy;
    }
  },
  {
    id: 'garden_soup',
    name: 'Hearty Garden Soup',
    icon: '🥣',
    multiplier: 2,
    basePoints: 12,
    desc: 'At least 3 different vegetables',
    check: (counts, ingredients) => {
      const uniqueVegs = new Set(ingredients.filter(i => i.type === 'vegetable').map(i => i.id));
      return uniqueVegs.size >= 3;
    }
  }
];

export class DishEvaluator {
  static evaluate(selectedCards, activeDiets = []) {
    if (!selectedCards || selectedCards.length === 0) {
      return this.invalidDish("Empty Plate");
    }

    // Filter out invalid ingredients (Frozen or Rotten cards fail ingredient checks)
    const validCards = selectedCards.filter(c => c.state !== 'frozen' && c.state !== 'rotten');

    // Category counters for valid cards only
    const counts = { carbs: 0, vegetable: 0, protein: 0, spice: 0, dairy: 0, special: 0 };
    validCards.forEach(c => {
      if (counts[c.type] !== undefined) counts[c.type]++;
      else counts.special++;
    });

    // Check for Emotional / Metaphorical modifiers in the dish
    let emotionalNote = "";
    if (validCards.some(i => i.id === 'love')) emotionalNote = " (Made with Love)";
    else if (validCards.some(i => i.id === 'patience')) emotionalNote = " (Cooked with Patience)";
    else if (validCards.some(i => i.id === 'grandma_hug')) emotionalNote = " (Grandma's Style)";

    const validIndices = selectedCards
      .map((c, i) => (c.state !== 'frozen' && c.state !== 'rotten' ? i : -1))
      .filter(i => i !== -1);

    // 1. Check Specific Named Recipes
    for (const recipe of RECIPE_BOOK) {
      if (recipe.check(counts, validCards)) {
        return {
          name: `${recipe.name}${emotionalNote}`,
          icon: recipe.icon,
          multiplier: recipe.multiplier,
          basePoints: recipe.basePoints,
          validCardIndices: validIndices
        };
      }
    }

    // 2. Descriptive Household Plate (Full Trio: Protein + Carb + Veggie)
    if (counts.protein > 0 && counts.carbs > 0 && counts.vegetable > 0) {
      const mainProtein = validCards.find(i => i.type === 'protein')?.name || 'Protein';
      const mainCarb = validCards.find(i => i.type === 'carbs')?.name || 'Carbs';

      return {
        name: `${mainProtein} with ${mainCarb} and Veggies${emotionalNote || " (Home Cooked)"}`,
        icon: '🍽️',
        multiplier: 2,
        basePoints: 10,
        validCardIndices: validIndices
      };
    }

    // 3. Basic Home Meal (Protein + Carb OR Protein + Veggie)
    if ((counts.protein > 0 && counts.carbs > 0) || (counts.protein > 0 && counts.vegetable > 0)) {
      const mainProtein = validCards.find(i => i.type === 'protein')?.name || 'Protein';
      const side = validCards.find(i => i.type === 'carbs' || i.type === 'vegetable')?.name || 'Side';

      return {
        name: `${mainProtein} with ${side}${emotionalNote}`,
        icon: '🍱',
        multiplier: 2,
        basePoints: 8,
        validCardIndices: validIndices
      };
    }

    // 4. CHECK ACTIVE DIET CARDS (Validates non-standard combos)
    const hasKeto = activeDiets.some(d => d.id === 'keto');
    if (hasKeto && counts.protein >= 2 && counts.carbs === 0) {
      return {
        name: `Keto Protein Feast${emotionalNote}`,
        icon: '🥩',
        multiplier: 3,
        basePoints: 15,
        validCardIndices: validIndices
      };
    }

    const hasCarbLoad = activeDiets.some(d => d.id === 'carbs_only');
    if (hasCarbLoad && counts.carbs >= 2 && counts.protein === 0) {
      return {
        name: `Carb Load Platter${emotionalNote}`,
        icon: '🍞',
        multiplier: 2,
        basePoints: 12,
        validCardIndices: validIndices
      };
    }

    // 5. DOES NOT MAKE REAL-LIFE SENSE -> INEDIBLE MIX
    return this.invalidDish("Inedible Mix");
  }

  static invalidDish(reason) {
    return {
      name: `${reason} (Invalid)`,
      icon: '🤢',
      multiplier: 0,
      basePoints: 0,
      validCardIndices: [] // Cards won't score
    };
  }
}