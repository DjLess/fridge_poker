export class Diet {
  constructor(id, name, description, type, cost = 15) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.type = type;
    this.cost = cost;
  }

  // Applies passive modifiers to score/cards
  applyEffect(selectedCards, currentBasePoints) {
    let scoreMod = 0;

    if (this.type === 'veg') {
      const hasMeat = selectedCards.some(c => c.tags.includes('meat'));
      if (hasMeat) scoreMod -= 15; // Penalty for meat on vegetarian diet
    }

    if (this.type === 'sweet') {
      const hasExtra = selectedCards.some(c => c.type === 'extra');
      if (hasExtra) scoreMod += 30; // Bonus for extra/dessert ingredients
    }

    return currentBasePoints + scoreMod;
  }
}

export const BASE_DIETS = [
  new Diet('d1', 'Vegetarian', 'Penalizes meat proteins (-15 pts)', 'veg', 15),
  new Diet('d2', 'Sweet Tooth', '+30 pts if dish includes Extras/Dessert', 'sweet', 15)
];