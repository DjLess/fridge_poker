// diets.js
export class Diet {
  constructor(id, name, description, type, costForks = 5, allowDuplicateCategories = false) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.type = type;
    this.costForks = costForks;
    this.allowDuplicateCategories = allowDuplicateCategories;
  }

  applyEffect(selectedCards, currentBasePoints) {
    let scoreMod = 0;

    if (this.type === 'veg') {
      const hasMeat = selectedCards.some(c => c.tags.includes('meat'));
      if (hasMeat) scoreMod -= 15;
    }

    if (this.type === 'sweet') {
      const hasExtra = selectedCards.some(c => c.type === 'extra');
      if (hasExtra) scoreMod += 30;
    }

    if (this.type === 'keto') {
      const hasCarb = selectedCards.some(c => c.type === 'carb');
      if (hasCarb) {
        scoreMod -= 25;
      } else {
        const proteinCount = selectedCards.filter(c => c.type === 'protein').length;
        scoreMod += proteinCount * 20;
      }
    }

    if (this.type === 'comfort') {
      const hasMeta = selectedCards.some(c => c.tags.includes('meta'));
      if (hasMeta) scoreMod += 40;
    }

    if (this.type === 'zero_waste') {
      if (selectedCards.length === 5) {
        scoreMod += 50;
      }
    }

    if (this.type === 'buffet') {
      scoreMod += 15;
    }

    return currentBasePoints + scoreMod;
  }
}

export const BASE_DIETS = [
  new Diet('d1', 'Vegetarian', 'Penalizes meat (-15 pts)', 'veg', 5),
  new Diet('d2', 'Sweet Tooth', '+30 pts when Extras are included', 'sweet', 5),
  new Diet('d3', 'Keto Craze', '+20 pts per Protein, but -25 pts if Carbs present', 'keto', 7),
  new Diet('d4', 'Hearty Comfort', '+40 pts when using Metaphorical cards', 'comfort', 6),
  new Diet('d5', 'Zero Waste', '+50 pts when cooking exactly 5 cards at once', 'zero_waste', 8),
  new Diet('d6', 'All-You-Can-Eat', 'Allows multiple ingredients of same category in 1 dish (+15 pts)', 'buffet', 8, true)
];