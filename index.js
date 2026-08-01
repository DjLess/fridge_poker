import { BASE_INGREDIENTS, VEGETARIAN_PROTEINS, METAPHORICAL_INGREDIENTS } from './ingredients.js';
import { DishEvaluator, RECIPE_BOOK } from './dishes.js';
import { BASE_DIETS } from './diets.js';
import { LevelManager } from './levels.js';
import { GameUI } from './game-ui.js';

const MAX_HAND_SIZE = 9;

export const KITCHENWARE_DB = [
  { id: 'skillet', name: 'Cast Iron Skillet', icon: '🍳', costForks: 4, desc: '+3 Mult if dish has Protein' },
  { id: 'blender', name: 'High-Speed Blender', icon: '🌪️', costForks: 4, desc: '+15 Pts for every Vegetable' },
  { id: 'knife', name: "Chef's Knife", icon: '🔪', costForks: 3, desc: '+2 Mult if dish has exactly 1 Protein' },
  { id: 'airfryer', name: 'Air Fryer', icon: '🍟', costForks: 5, desc: '+50 Pts if no Dairy in dish' },
  { id: 'garlic_press', name: 'Garlic Press', icon: '🧄', costForks: 3, desc: '+1 Mult on Spice/Herb dishes' },
  { id: 'spicerack', name: 'Spice Rack', icon: '🌶️', costForks: 4, desc: 'Spice cards give +0.5 Mult' },
  { id: 'containers', name: 'Prep Containers', icon: '🍱', costForks: 6, desc: '+1 Hand Size bonus' },
  { id: 'deepfryer', name: 'Deep Fryer', icon: '🍤', costForks: 5, desc: 'x1.5 Mult bonus on all dishes' },
  { id: 'sousvide', name: 'Sous Vide', icon: '🌡️', costForks: 4, desc: '+20 Pts bonus on Protein cards' },
  { id: 'wok', name: 'Golden Wok', icon: '🥘', costForks: 5, desc: '+$2 Forks on valid Rice/Carb dishes' }
];

export const CHEF_SKILLS_DB = [
  { id: 'flash_freeze', name: 'Flash Freeze', icon: '❄️', costForks: 2, desc: 'Freeze 1 card (1 turn timer)' },
  { id: 'gourmet_touch', name: 'Gourmet Touch', icon: '✨', costForks: 3, desc: 'Make 1 selected card Gourmet (+0.5 Mult)' },
  { id: 'tenderize', name: 'Tenderize', icon: '🔨', costForks: 2, desc: '+15 Base Points to 1 selected card' },
  { id: 'restock', name: 'Pantry Restock', icon: '🔄', costForks: 2, desc: 'Redraw selected cards instantly' },
  { id: 'ferment', name: 'Quick Ferment', icon: '🧪', costForks: 2, desc: 'Add +2 Mult bonus to 1 card' },
  { id: 'marinate', name: 'Marinate', icon: '🥩', costForks: 3, desc: 'Convert 1 card into Protein' },
  { id: 'julienne', name: 'Julienne', icon: '🥕', costForks: 2, desc: 'Convert 1 card into Vegetable' },
  { id: 'grandma_secret', name: 'Grandma Secret', icon: '👵', costForks: 4, desc: "Spawn a Grandma's Hug card" },
  { id: 'clean', name: 'Deep Clean', icon: '🧹', costForks: 2, desc: 'Remove all low-point cards from hand' },
  { id: 'duplicate', name: 'Duplication', icon: '👯', costForks: 4, desc: 'Duplicate 1 selected card' }
];

const TYPE_ORDER = { carbs: 1, vegetable: 2, protein: 3, spice: 4, dairy: 4, special: 4 };

let state = {
  week: 1,
  targetScore: 100,
  targetDishes: 2,
  score: 0,
  handsLeft: 4,
  discardsLeft: 3,
  forks: 0,
  fridgeDeck: [],
  hand: [],
  selectedIndices: [],
  kitchenware: [],
  activeDiets: [],
  chefSkills: [],
  finishedDishes: [],
  isAnimating: false,
  sortScoreAscending: false,
  selectedDeckType: 'regular'
};

function applyDeckType(deckType) {
  let sourceIngredients = [...BASE_INGREDIENTS];

  if (deckType === 'vegetarian') {
    sourceIngredients = sourceIngredients.map(card => {
      if (card.type === 'protein') {
        if (card.id === 'beef') return { ...VEGETARIAN_PROTEINS.find(p => p.id === 'seitan') };
        if (card.id === 'chicken') return { ...VEGETARIAN_PROTEINS.find(p => p.id === 'tofu') };
        if (card.id === 'egg') return { ...VEGETARIAN_PROTEINS.find(p => p.id === 'tempeh') };
        if (card.id === 'fish') return { ...VEGETARIAN_PROTEINS.find(p => p.id === 'veggie_burger') };
      }
      return { ...card };
    });
  }

  let deck = [...sourceIngredients, ...sourceIngredients, ...sourceIngredients].map(card => {
    let c = { ...card };

    if (deckType === 'special') {
      const rand = Math.random();
      if (rand < 0.35) {
        c.state = 'gourmet';
        c.name = `Gourmet ${c.name}`;
      } else if (rand < 0.70) {
        c.state = 'frozen';
        c.frozenTimer = 1;
        c.name = `Frozen ${c.name}`;
      } else {
        c.state = 'expiring';
        c.name = `Fresh ${c.name} (Expiring)`;
      }
    } else if (deckType === 'regular' || deckType === 'vegetarian') {
      const isSpecialChance = Math.random();
      if (isSpecialChance < 0.10) {
        const randState = Math.random();
        if (randState < 0.33) {
          c.state = 'gourmet';
          c.name = `Gourmet ${c.name}`;
        } else if (randState < 0.66) {
          c.state = 'frozen';
          c.frozenTimer = 1;
          c.name = `Frozen ${c.name}`;
        } else {
          c.state = 'expiring';
          c.name = `Fresh ${c.name} (Expiring)`;
        }
      } else {
        c.state = c.state || 'normal';
        c.frozenTimer = c.state === 'frozen' ? 1 : 0;
      }
    } else {
      c.state = c.state || 'normal';
      c.frozenTimer = c.state === 'frozen' ? 1 : 0;
    }
    return c;
  });

  shuffle(deck);
  return deck;
}

async function initGame() {
  const level = LevelManager.getLevel(state.week);
  state.targetScore = level.targetScore;
  state.targetDishes = level.targetDishes;
  state.handsLeft = level.maxHands;
  state.discardsLeft = level.maxDiscards;
  state.score = 0;
  state.finishedDishes = [];
  state.hand = [];
  state.selectedIndices = [];

  document.getElementById('ui-dish-shelf').innerHTML = '';
  state.fridgeDeck = applyDeckType(state.selectedDeckType);

  GameUI.renderSlots(state, useSkill);
  GameUI.updateHUD(state);
  await performInitialDeal();
}

function shuffle(arr) { arr.sort(() => Math.random() - 0.5); }

function getFridgeOffset() {
  const fridgeEl = document.getElementById('ui-fridge');
  const handWrapper = document.querySelector('.hand-arc-wrapper');
  if (!fridgeEl || !handWrapper) return { x: -130, y: -220 };

  const fridgeRect = fridgeEl.getBoundingClientRect();
  const handRect = handWrapper.getBoundingClientRect();

  const startX = (fridgeRect.left + fridgeRect.width / 2) - (handRect.left + handRect.width / 2);
  const startY = (fridgeRect.top + fridgeRect.height / 2) - (handRect.top + handRect.height / 2);

  return { x: startX, y: startY };
}

function useSkill(slotIndex) {
  const skill = state.chefSkills[slotIndex];
  if (!skill || state.isAnimating) return;

  if (skill.id === 'flash_freeze') {
    if (state.selectedIndices.length !== 1) return alert("Select 1 card to freeze!");
    const card = state.hand[state.selectedIndices[0]];
    card.state = 'frozen';
    card.frozenTimer = 1;
  } else if (skill.id === 'gourmet_touch') {
    if (state.selectedIndices.length !== 1) return alert("Select 1 card!");
    const card = state.hand[state.selectedIndices[0]];
    card.state = 'gourmet';
  } else if (skill.id === 'tenderize') {
    if (state.selectedIndices.length !== 1) return alert("Select 1 card!");
    const card = state.hand[state.selectedIndices[0]];
    card.points = (card.points || 0) + 15;
  } else if (skill.id === 'restock') {
    if (state.selectedIndices.length === 0) return alert("Select card(s) to restock!");
    state.hand = state.hand.filter((_, idx) => !state.selectedIndices.includes(idx));
    state.selectedIndices = [];
    drawHand();
  } else if (skill.id === 'marinate') {
    if (state.selectedIndices.length !== 1) return alert("Select 1 card!");
    state.hand[state.selectedIndices[0]].type = 'protein';
  } else if (skill.id === 'julienne') {
    if (state.selectedIndices.length !== 1) return alert("Select 1 card!");
    state.hand[state.selectedIndices[0]].type = 'vegetable';
  } else if (skill.id === 'grandma_secret') {
    state.hand.push({ id: 'grandma_hug', name: "Grandma's Hug", type: 'special', points: 25, multiplierBonus: 3, icon: '👵', state: 'normal' });
  } else if (skill.id === 'duplicate') {
    if (state.selectedIndices.length !== 1) return alert("Select 1 card to duplicate!");
    const card = state.hand[state.selectedIndices[0]];
    state.hand.push({ ...card });
  } else if (skill.id === 'clean') {
    state.hand = state.hand.filter(c => (c.points || 0) > 5 && c.state !== 'rotten');
  } else if (skill.id === 'ferment') {
    if (state.selectedIndices.length !== 1) return alert("Select 1 card!");
    const card = state.hand[state.selectedIndices[0]];
    card.multiplierBonus = (card.multiplierBonus || 0) + 2;
  }

  state.chefSkills.splice(slotIndex, 1);
  GameUI.renderSlots(state, useSkill);
  renderHandUI();
  evaluateDishPreview();
}

function processTurnCardStateUpdates() {
  state.hand.forEach(card => {
    if (card.state === 'expiring' && !card.usedThisTurn) {
      card.state = 'rotten';
    }

    if (card.state === 'frozen') {
      if (card.frozenTimer > 0) {
        card.frozenTimer -= 1;
      } else {
        card.state = 'normal';
        card.points = (card.points || 0) + 50;
      }
    }
    card.usedThisTurn = false;
  });
}

function initializeStartingHand(deck, deckType) {
  const cardTypes = ["protein", "vegetable", "carbs", "special"];
  let startingHand = [];

  cardTypes.forEach(type => {
    let pool = deck.filter(card => card.type === type || (type === 'special' && card.type === 'spice'));
    if (pool.length > 0) {
      let randomIndex = Math.floor(Math.random() * pool.length);
      let selectedCard = { ...pool[randomIndex] };
      startingHand.push(selectedCard);
    }
  });

  while (startingHand.length < MAX_HAND_SIZE && deck.length > 0) {
    let randomIndex = Math.floor(Math.random() * deck.length);
    startingHand.push({ ...deck[randomIndex] });
    deck.splice(randomIndex, 1);
  }

  return startingHand;
}

async function performInitialDeal() {
  state.isAnimating = true;
  const fridgeEl = document.getElementById('ui-fridge');
  const iconEl = document.getElementById('ui-fridge-icon');

  fridgeEl.classList.add('dealing');
  iconEl.innerText = '⏳';
  iconEl.classList.add('spinning');

  state.hand = initializeStartingHand(state.fridgeDeck, state.selectedDeckType);
  renderHandUI();

  fridgeEl.classList.remove('dealing');
  iconEl.innerText = '🧊';
  iconEl.classList.remove('spinning');
  state.isAnimating = false;
  evaluateDishPreview();
  GameUI.updateHUD(state);
}

async function drawHand() {
  const effectiveHandSize = MAX_HAND_SIZE + (state.kitchenware.some(k => k.id === 'containers') ? 1 : 0);
  const cardsNeeded = effectiveHandSize - state.hand.length;
  if (cardsNeeded <= 0 || state.fridgeDeck.length === 0) return;

  state.isAnimating = true;
  const fridgeEl = document.getElementById('ui-fridge');
  const iconEl = document.getElementById('ui-fridge-icon');

  fridgeEl.classList.add('dealing');
  iconEl.innerText = '⏳';
  iconEl.classList.add('spinning');

  for (let i = 0; i < cardsNeeded; i++) {
    if (state.fridgeDeck.length > 0) {
      const drawnCard = { ...state.fridgeDeck.pop() };
      drawnCard.drawnThisTurn = true;
      state.hand.push(drawnCard);
      renderHandUI();

      const handEl = document.getElementById('ui-hand');
      const lastCard = handEl.lastElementChild;
      if (lastCard) {
        const offset = getFridgeOffset();
        lastCard.style.setProperty('--start-x', `${offset.x}px`);
        lastCard.style.setProperty('--start-y', `${offset.y}px`);
        lastCard.classList.add('fly-draw-anim');
      }
      GameUI.updateHUD(state);
      await sleep(80);
    }
  }

  fridgeEl.classList.remove('dealing');
  iconEl.innerText = '🧊';
  iconEl.classList.remove('spinning');
  state.isAnimating = false;
  evaluateDishPreview();
}

let holdTimer = null;
const HOLD_DURATION = 600;

function setupCardHoldListener(cardElement, cardData) {
  const startHold = () => {
    holdTimer = setTimeout(() => {
      showCardPopup(cardData);
    }, HOLD_DURATION);
  };

  const cancelHold = () => {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
  };

  cardElement.addEventListener("mousedown", startHold);
  cardElement.addEventListener("mouseup", cancelHold);
  cardElement.addEventListener("mouseleave", cancelHold);
  cardElement.addEventListener("touchstart", startHold);
  cardElement.addEventListener("touchend", cancelHold);
  cardElement.addEventListener("touchmove", cancelHold);
}

function showCardPopup(card) {
  document.getElementById("popup-card-title").innerText = card.name;
  document.getElementById("popup-card-desc").innerText = card.description || `Category: ${card.type.toUpperCase()} | Points: +${card.points || 0}`;
  document.getElementById("card-popup-modal").classList.remove("hidden");
}

document.getElementById("popup-close-btn").addEventListener("click", () => {
  document.getElementById("card-popup-modal").classList.add("hidden");
});

document.getElementById("card-popup-modal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("card-popup-modal")) {
    document.getElementById("card-popup-modal").classList.add("hidden");
  }
});

function renderHandUI() {
  GameUI.renderHand(
    state,
    (idx) => {
      if (state.isAnimating) return;
      toggleSelectCard(idx);
    },
    setupCardHoldListener
  );
  evaluateDishPreview();
}

function toggleSelectCard(index) {
  const selIdx = state.selectedIndices.indexOf(index);
  if (selIdx > -1) state.selectedIndices.splice(selIdx, 1);
  else if (state.selectedIndices.length < 5) state.selectedIndices.push(index);
  renderHandUI();
}

function sortHandByType() {
  if (state.isAnimating || state.hand.length === 0) return;
  const selectedObjects = state.selectedIndices.map(i => state.hand[i]);

  state.hand.sort((a, b) => {
    const orderA = TYPE_ORDER[a.type] || 4;
    const orderB = TYPE_ORDER[b.type] || 4;
    if (orderA !== orderB) return orderA - orderB;
    return b.points - a.points;
  });

  state.selectedIndices = selectedObjects.map(obj => state.hand.indexOf(obj)).filter(i => i !== -1);
  renderHandUI();
}

function sortHandByScore() {
  if (state.isAnimating || state.hand.length === 0) return;
  const selectedObjects = state.selectedIndices.map(i => state.hand[i]);

  state.sortScoreAscending = !state.sortScoreAscending;

  state.hand.sort((a, b) => {
    return state.sortScoreAscending ? a.points - b.points : b.points - a.points;
  });

  state.selectedIndices = selectedObjects.map(obj => state.hand.indexOf(obj)).filter(i => i !== -1);
  renderHandUI();
}

function evaluateDishPreview() {
  const cookBtn = document.getElementById('ui-cook-btn');
  const discardBtn = document.getElementById('ui-discard-btn');
  const bannerDish = document.getElementById('ui-banner-dish');
  const bannerCalc = document.getElementById('ui-banner-calc');

  const hasSelection = state.selectedIndices.length > 0;
  cookBtn.disabled = !hasSelection || state.handsLeft <= 0 || state.isAnimating;
  discardBtn.disabled = !hasSelection || state.discardsLeft <= 0 || state.isAnimating;

  if (!hasSelection) {
    bannerDish.innerText = "Select Cards";
    bannerCalc.innerText = "";
    return;
  }

  const selectedCards = state.selectedIndices.map(i => state.hand[i]);
  const dish = DishEvaluator.evaluate(selectedCards, state.activeDiets);

  let totalMult = dish.multiplier;
  selectedCards.forEach(c => {
    if (c.state !== 'frozen' && c.state !== 'rotten') {
      if (c.multiplierBonus) totalMult += c.multiplierBonus;
      if (c.state === 'gourmet') totalMult += 0.5;
    }
  });

  const validCards = selectedCards.filter(c => c.state !== 'frozen' && c.state !== 'rotten');
  state.kitchenware.forEach(kw => {
    if (kw.id === 'skillet' && validCards.some(c => c.type === 'protein')) totalMult += 3;
    if (kw.id === 'knife' && validCards.filter(c => c.type === 'protein').length === 1) totalMult += 2;
    if (kw.id === 'spicerack') totalMult += validCards.filter(c => c.type === 'spice').length * 0.5;
    if (kw.id === 'deepfryer') totalMult *= 1.5;
  });

  bannerDish.innerText = dish.name;
  bannerCalc.innerText = `(${dish.basePoints} pts x ${totalMult.toFixed(1)})`;
}

async function cookSelected() {
  if (state.handsLeft <= 0 || state.isAnimating) return;
  state.isAnimating = true;

  document.getElementById('ui-cook-btn').disabled = true;
  document.getElementById('ui-discard-btn').disabled = true;

  const selectedCards = state.selectedIndices.map(i => state.hand[i]);
  const dish = DishEvaluator.evaluate(selectedCards, state.activeDiets);
  const potEl = document.getElementById('ui-cooking-pot');

  const bannerDish = document.getElementById('ui-banner-dish');
  const bannerCalc = document.getElementById('ui-banner-calc');

  let accumulatedPoints = dish.basePoints;
  let accumulatedMult = dish.multiplier;
  let hasSpecialIngredient = false;

  const validCards = selectedCards.filter(c => c.state !== 'frozen' && c.state !== 'rotten');
  state.kitchenware.forEach(kw => {
    if (kw.id === 'skillet' && validCards.some(c => c.type === 'protein')) accumulatedMult += 3;
    if (kw.id === 'blender') accumulatedPoints += validCards.filter(c => c.type === 'vegetable').length * 15;
    if (kw.id === 'knife' && validCards.filter(c => c.type === 'protein').length === 1) accumulatedMult += 2;
    if (kw.id === 'airfryer' && !validCards.some(c => c.type === 'dairy')) accumulatedPoints += 50;
    if (kw.id === 'spicerack') accumulatedMult += validCards.filter(c => c.type === 'spice').length * 0.5;
    if (kw.id === 'deepfryer') accumulatedMult *= 1.5;
    if (kw.id === 'wok' && validCards.some(c => c.type === 'carbs')) state.forks += 2;
  });

  for (let i = 0; i < state.selectedIndices.length; i++) {
    const idx = state.selectedIndices[i];
    const card = state.hand[idx];
    const potCardEl = document.getElementById(`pot-card-${idx}`);
    card.usedThisTurn = true;

    if (GameUI.getCategoryLetter(card.type) === 'S') {
      hasSpecialIngredient = true;
    }

    if (potCardEl) {
      potCardEl.classList.add('scoring-active');
    }
    await sleep(220);

    const isCardValid = dish.validCardIndices.includes(i) && card.state !== 'frozen' && card.state !== 'rotten';

    if (isCardValid) {
      let cardPts = card.points || 0;

      if (card.state === 'expiring' && card.drawnThisTurn) {
        cardPts += 25;
        if (potCardEl) GameUI.triggerFloatingText(`+25 FRESH BONUS!`, potCardEl);
      }

      if (state.kitchenware.some(k => k.id === 'sousvide') && card.type === 'protein') {
        cardPts += 20;
      }

      if (card.state === 'gourmet') {
        accumulatedMult += 0.5;
        if (potCardEl) GameUI.triggerFloatingText(`+0.5x GOURMET!`, potCardEl);
      }

      if (card.multiplierBonus) {
        accumulatedMult += card.multiplierBonus;
        if (potCardEl) GameUI.triggerFloatingText(`+${card.multiplierBonus}x MULT!`, potCardEl);
      } else {
        accumulatedPoints += cardPts;
        if (potCardEl) GameUI.triggerFloatingText(`+${cardPts}`, potCardEl);
      }
      bannerCalc.className = 'score-pop';
      bannerCalc.innerText = `${accumulatedPoints} pts x ${accumulatedMult.toFixed(1)}`;
    } else {
      const failReason = card.state === 'frozen' ? 'FROZEN!' : (card.state === 'rotten' ? 'ROTTEN!' : 'TRASH!');
      if (potCardEl) {
        GameUI.triggerFloatingText(`+0 ${failReason}`, potCardEl);
        potCardEl.classList.remove('scoring-active');
        potCardEl.classList.add('trashed-card');
        potCardEl.classList.add('fly-trash');
      }
      bannerCalc.className = 'score-pop';
      bannerCalc.innerText = `${accumulatedPoints} pts (+0 ${failReason})`;
    }

    await sleep(300);
    bannerCalc.className = '';
    if (isCardValid && potCardEl) potCardEl.classList.remove('scoring-active');
  }

  potEl.classList.add('mixing-pot');
  bannerDish.innerText = "Cooking & Mixing... 🍳";
  await sleep(650);
  potEl.classList.remove('mixing-pot');

  potEl.innerHTML = '';
  const plateEl = document.createElement('div');
  plateEl.className = 'serving-plate';
  plateEl.innerText = dish.icon;
  potEl.appendChild(plateEl);

  state.activeDiets.forEach(diet => {
    if (diet.applyEffect) {
      accumulatedPoints = diet.applyEffect(selectedCards, accumulatedPoints);
    }
  });

  const finalScore = Math.max(0, Math.round(accumulatedPoints * accumulatedMult));
  bannerDish.innerText = `${dish.name.toUpperCase()}! 🔥`;
  bannerCalc.innerText = `${accumulatedPoints} x ${accumulatedMult.toFixed(1)} = +${finalScore} PTS!`;
  bannerCalc.className = 'score-pop';
  GameUI.triggerFloatingText(`+${finalScore}!`, potEl);

  await sleep(850);

  if (accumulatedMult > 0) {
    addDishToShelf(dish.icon, dish.name, hasSpecialIngredient);
  }

  state.score += finalScore;
  state.handsLeft -= 1;

  state.hand = state.hand.filter((_, idx) => !state.selectedIndices.includes(idx));
  state.selectedIndices = [];

  potEl.innerHTML = '';
  state.isAnimating = false;

  processTurnCardStateUpdates();
  GameUI.updateHUD(state);
  await drawHand();
  checkLevelEnd();
}

function addDishToShelf(icon, name, isSpecial) {
  const shelf = document.getElementById('ui-dish-shelf');
  const dishEl = document.createElement('div');
  dishEl.className = 'shelf-item';
  dishEl.innerHTML = `${icon}${isSpecial ? '<div class="special-badge">⭐</div>' : ''}`;
  shelf.appendChild(dishEl);

  state.finishedDishes.push({ icon, name, isSpecial });
}

async function discardSelected() {
  if (state.discardsLeft <= 0 || state.isAnimating) return;
  state.isAnimating = true;

  state.selectedIndices.forEach(idx => {
    const potCardEl = document.getElementById(`pot-card-${idx}`);
    if (potCardEl) potCardEl.classList.add('fly-trash');
  });

  await sleep(320);

  state.discardsLeft -= 1;
  state.hand = state.hand.filter((_, idx) => !state.selectedIndices.includes(idx));
  state.selectedIndices = [];

  state.isAnimating = false;
  document.getElementById('ui-cooking-pot').innerHTML = '';
  
  processTurnCardStateUpdates();
  GameUI.updateHUD(state);
  await drawHand();
}

function checkLevelEnd() {
  if (state.handsLeft <= 0) {
    const dishesCompleted = state.finishedDishes.length;
    const reachedDishes = dishesCompleted >= state.targetDishes;
    const reachedScore = state.score >= state.targetScore;

    if (reachedDishes && reachedScore) {
      const extraDishes = Math.max(0, dishesCompleted - state.targetDishes);
      const bonusForks = 5 + (extraDishes * 2);
      state.forks += bonusForks;

      document.getElementById('ui-complete-summary').innerText = 
        `Goals Reached: ${dishesCompleted}/${state.targetDishes} Dishes & ${state.score}/${state.targetScore} Pts. Bonus Forks earned: +${bonusForks}`;

      document.getElementById('ui-level-complete-modal').classList.remove('hidden');
    } else {
      alert(`Game Over! Both goals were not met.\nDishes: ${dishesCompleted}/${state.targetDishes} ${reachedDishes ? '✅' : '❌'}\nScore: ${state.score}/${state.targetScore} ${reachedScore ? '✅' : '❌'}`);
      state.week = 1;
      state.forks = 0;
      state.kitchenware = [];
      state.activeDiets = [];
      state.chefSkills = [];
      initGame();
    }
  }
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function renderRecipes() {
  const listEl = document.getElementById('ui-recipe-list');
  listEl.innerHTML = '';
  RECIPE_BOOK.forEach(r => {
    const item = document.createElement('div');
    item.className = 'recipe-card';
    item.innerHTML = `
      <div style="font-size:2rem;">${r.icon}</div>
      <div>
        <div style="font-weight:bold; font-size:1rem;">${r.name} (${r.multiplier}x)</div>
        <div style="font-size:0.85rem; color:#666;">${r.desc}</div>
      </div>
    `;
    listEl.appendChild(item);
  });
}

function renderDishesReview() {
  const reviewList = document.getElementById('ui-review-list');
  reviewList.innerHTML = '';

  if (state.finishedDishes.length === 0) {
    reviewList.innerHTML = '<p style="text-align:center; color:#888;">No dishes prepared in this level.</p>';
    return;
  }

  state.finishedDishes.forEach((d, idx) => {
    const item = document.createElement('div');
    item.className = 'review-item';
    item.innerHTML = `
      <div style="font-size:2rem; position:relative;">
        ${d.icon}
        ${d.isSpecial ? '<span style="font-size:0.7rem; position:absolute; bottom:0; left:0;">⭐</span>' : ''}
      </div>
      <div>
        <div style="font-weight:bold; font-size:1rem;">#${idx + 1} - ${d.name}</div>
        <div style="font-size:0.85rem; color:#666;">${d.isSpecial ? 'Special Edition Dish' : 'Standard Recipe'}</div>
      </div>
    `;
    reviewList.appendChild(item);
  });
}

function copyDishesToClipboard() {
  if (state.finishedDishes.length === 0) {
    alert("No dishes to copy!");
    return;
  }

  const dishText = state.finishedDishes
    .map((d, i) => `${i + 1}. ${d.icon} ${d.name}${d.isSpecial ? ' ⭐ (Special)' : ''}`)
    .join('\n');

  const fullMessage = `🍳 Culinary Crafter - Level ${state.week} Dishes:\n${dishText}\nTotal Score: ${state.score} pts!`;

  navigator.clipboard.writeText(fullMessage).then(() => {
    alert("Dishes copied to clipboard!");
  }).catch(err => {
    console.error("Clipboard copy failed: ", err);
    alert("Could not copy to clipboard automatically.");
  });
}

function generateShopCard() {
  const randomBase = BASE_INGREDIENTS[Math.floor(Math.random() * BASE_INGREDIENTS.length)];
  const card = { ...randomBase };

  const randState = Math.random();
  if (randState < 0.25) {
    card.state = 'gourmet';
    card.name = `Gourmet ${card.name}`;
    card.costForks = (card.costForks || 3) + 2;
  } else if (randState < 0.45) {
    card.state = 'frozen';
    card.frozenTimer = 1;
    card.name = `Frozen ${card.name}`;
    card.costForks = (card.costForks || 3) + 1;
  } else if (randState < 0.60) {
    card.state = 'expiring';
    card.name = `Fresh ${card.name} (Expiring)`;
    card.costForks = (card.costForks || 3) + 1;
  } else {
    card.state = 'normal';
  }

  return card;
}

function renderShopItems() {
  const shopGrid = document.getElementById('ui-shop-items');
  shopGrid.innerHTML = '';

  const shopOptions = [
    KITCHENWARE_DB[Math.floor(Math.random() * KITCHENWARE_DB.length)],
    CHEF_SKILLS_DB[Math.floor(Math.random() * CHEF_SKILLS_DB.length)],
    BASE_DIETS[Math.floor(Math.random() * BASE_DIETS.length)],
    generateShopCard()
  ];

  shopOptions.forEach((item, idx) => {
    const isKitchenware = KITCHENWARE_DB.some(k => k.id === item.id);
    const isSkill = CHEF_SKILLS_DB.some(s => s.id === item.id);
    const isDiet = 'description' in item || BASE_DIETS.some(d => d.name === item.name);

    let stateBadge = '';
    if (item.state === 'frozen') stateBadge = ' 🧊 [Frozen]';
    if (item.state === 'gourmet') stateBadge = ' ✨ [Gourmet]';
    if (item.state === 'expiring') stateBadge = ' 🔥 [Expiring]';

    const cost = item.costForks || 3;
    const itemEl = document.createElement('div');
    itemEl.className = 'shop-item';
    itemEl.innerHTML = `
      <div style="font-size:1.6rem;">${item.icon || '📜'}</div>
      <div style="font-weight:bold; font-size:0.9rem;">${item.name}${stateBadge}</div>
      <div style="font-size: 0.75rem; color: #666;">${item.desc || item.description || (item.multiplierBonus ? `+${item.multiplierBonus}x Mult` : `+${item.points} pts`)}</div>
      <button class="btn btn-cook" style="padding: 6px; font-size: 0.85rem;" id="buy-${idx}">Buy (🍴${cost})</button>
    `;
    shopGrid.appendChild(itemEl);

    document.getElementById(`buy-${idx}`).onclick = () => buyItem(item, cost, isKitchenware, isSkill, isDiet);
  });
}

function buyItem(item, cost, isKitchenware, isSkill, isDiet) {
  if (state.forks < cost) return alert("Not enough Forks!");

  if (isKitchenware) {
    if (state.kitchenware.length >= 3) return alert("Kitchenware slots full (3/3)!");
    state.kitchenware.push(item);
  } else if (isSkill) {
    if (state.chefSkills.length >= 2) return alert("Chef Skill slots full (2/2)!");
    state.chefSkills.push(item);
  } else if (isDiet) {
    if (state.activeDiets.length >= 2) return alert("Diet slots full (2/2)!");
    state.activeDiets.push(item);
  } else {
    state.fridgeDeck.push({ ...item });
  }

  state.forks -= cost;
  GameUI.renderSlots(state, useSkill);
  GameUI.updateHUD(state);
}

document.getElementById('ui-btn-goto-deck-select').onclick = () => {
  document.getElementById('ui-start-screen').classList.add('hidden');
  document.getElementById('ui-deck-screen').classList.remove('hidden');
};

document.getElementById('ui-btn-back-start').onclick = () => {
  document.getElementById('ui-deck-screen').classList.add('hidden');
  document.getElementById('ui-start-screen').classList.remove('hidden');
};

document.getElementById('deck-regular').onclick = () => {
  state.selectedDeckType = 'regular';
  document.getElementById('ui-deck-screen').classList.add('hidden');
  initGame();
};

document.getElementById('deck-vegetarian').onclick = () => {
  state.selectedDeckType = 'vegetarian';
  document.getElementById('ui-deck-screen').classList.add('hidden');
  initGame();
};

document.getElementById('deck-special').onclick = () => {
  state.selectedDeckType = 'special';
  document.getElementById('ui-deck-screen').classList.add('hidden');
  initGame();
};

document.getElementById('ui-cook-btn').onclick = cookSelected;
document.getElementById('ui-discard-btn').onclick = discardSelected;
document.getElementById('ui-sort-type-btn').onclick = sortHandByType;
document.getElementById('ui-sort-score-btn').onclick = sortHandByScore;

document.getElementById('ui-fridge').onclick = () => {
  if (!state.isAnimating && state.hand.length < MAX_HAND_SIZE) drawHand();
};

document.getElementById('ui-open-recipes-btn').onclick = () => {
  renderRecipes();
  document.getElementById('ui-recipes-modal').classList.remove('hidden');
};

document.getElementById('ui-close-recipes-btn').onclick = () => {
  document.getElementById('ui-recipes-modal').classList.add('hidden');
};

document.getElementById('ui-btn-review-dishes').onclick = () => {
  document.getElementById('ui-level-complete-modal').classList.add('hidden');
  renderDishesReview();
  document.getElementById('ui-review-modal').classList.remove('hidden');
};

document.getElementById('ui-copy-clipboard-btn').onclick = copyDishesToClipboard;

document.getElementById('ui-close-review-btn').onclick = () => {
  document.getElementById('ui-review-modal').classList.add('hidden');
  document.getElementById('ui-shop').classList.remove('hidden');
  renderShopItems();
};

document.getElementById('ui-btn-go-shop').onclick = () => {
  document.getElementById('ui-level-complete-modal').classList.add('hidden');
  document.getElementById('ui-shop').classList.remove('hidden');
  renderShopItems();
};

document.getElementById('ui-next-week-btn').onclick = () => {
  document.getElementById('ui-shop').classList.add('hidden');
  state.week += 1;
  initGame();
};
