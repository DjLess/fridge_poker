// game-ui.js - Módulo específico para la UI de la pantalla de juego y renderizado de cartas/HUD
export class GameUI {
  static getCategoryLetter(type) {
    if (type === 'carbs') return 'C';
    if (type === 'vegetable') return 'V';
    if (type === 'protein') return 'P';
    return 'S';
  }

  static getCardStateBadgeHTML(card) {
    if (card.state === 'frozen') {
      return `<div class="card-state-badge badge-frozen">🧊 ${card.frozenTimer ?? 1}t</div>`;
    }
    if (card.state === 'gourmet') {
      return `<div class="card-state-badge badge-gourmet">✨ +0.5x</div>`;
    }
    if (card.state === 'expiring') {
      return `<div class="card-state-badge badge-expiring">🔥 Now!</div>`;
    }
    if (card.state === 'rotten') {
      return `<div class="card-state-badge badge-rotten">💀 Rot</div>`;
    }
    return '';
  }

  static renderSlots(state, onSkillClick) {
    const kwContainer = document.getElementById('ui-kitchenware-slots');
    if (kwContainer) {
      kwContainer.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const item = state.kitchenware[i];
        const slot = document.createElement('div');
        slot.className = `slot-item ${item ? 'filled' : ''}`;
        slot.title = item ? `${item.name}: ${item.desc}` : 'Empty Kitchenware Slot';
        slot.innerHTML = item ? item.icon : '🍳';
        kwContainer.appendChild(slot);
      }
    }

    const dietContainer = document.getElementById('ui-diet-slots');
    if (dietContainer) {
      dietContainer.innerHTML = '';
      for (let i = 0; i < 2; i++) {
        const item = state.activeDiets[i];
        const slot = document.createElement('div');
        slot.className = `slot-item diet-slot ${item ? 'filled' : ''}`;
        slot.title = item ? `${item.name}: ${item.description || item.desc}` : 'Empty Diet Slot';
        slot.innerHTML = item ? (item.icon || '🥗') : '🥗';
        dietContainer.appendChild(slot);
      }
    }

    const skillContainer = document.getElementById('ui-skill-slots');
    if (skillContainer) {
      skillContainer.innerHTML = '';
      for (let i = 0; i < 2; i++) {
        const item = state.chefSkills[i];
        const slot = document.createElement('div');
        slot.className = `slot-item skill-slot ${item ? 'filled' : ''}`;
        slot.title = item ? `${item.name}: ${item.desc} (Click to Use)` : 'Empty Skill Slot';
        slot.innerHTML = item ? item.icon : '📜';
        if (item && onSkillClick) {
          slot.onclick = () => onSkillClick(i);
        }
        skillContainer.appendChild(slot);
      }
    }
  }

  static updateHUD(state) {
    document.getElementById('ui-target-score').innerText = state.targetScore;
    document.getElementById('ui-target-dishes').innerText = `${state.finishedDishes.length}/${state.targetDishes}`;
    document.getElementById('ui-score').innerText = state.score;
    document.getElementById('ui-hands').innerText = state.handsLeft;
    document.getElementById('ui-discards').innerText = state.discardsLeft;
    document.getElementById('ui-forks').innerText = `🍴 ${state.forks}`;
    document.getElementById('ui-deck-count').innerText = state.fridgeDeck.length;
  }

  static renderHand(state, onCardClick, onCardHold) {
    const handEl = document.getElementById('ui-hand');
    handEl.innerHTML = '';

    const total = state.hand.length;
    const maxAngle = 30;
    const angleStep = total > 1 ? (maxAngle * 2) / (total - 1) : 0;
    const centerOffset = (total - 1) / 2;

    state.hand.forEach((card, idx) => {
      const cardEl = document.createElement('div');
      const isSelected = state.selectedIndices.includes(idx);

      const offset = idx - centerOffset;
      const angle = offset * angleStep;
      const translateY = Math.abs(offset) * 4;

      const cardStateClass = card.state ? `state-${card.state}` : '';
      cardEl.className = `card ${cardStateClass} ${isSelected ? 'selected' : ''}`;
      cardEl.dataset.index = idx;
      cardEl.style.zIndex = idx + 1;

      let transformStr = `rotate(${angle}deg) translateY(${translateY}px)`;
      if (isSelected) {
        transformStr = `rotate(${angle}deg) translateY(${translateY - 14}px) scale(1.05)`;
      }

      cardEl.style.transform = transformStr;
      cardEl.style.left = `calc(50% - 33px + ${(offset) * 36}px)`;

      if (onCardClick) {
        cardEl.onclick = () => onCardClick(idx);
      }

      if (onCardHold) {
        onCardHold(cardEl, card);
      }

      const categoryLetter = this.getCategoryLetter(card.type);
      const isSpecialCat = categoryLetter === 'S';

      cardEl.innerHTML = `
        <div class="card-corner ${isSpecialCat ? 'type-special' : `type-${card.type}`}">${categoryLetter}</div>
        ${this.getCardStateBadgeHTML(card)}
        <div class="card-icon">${card.state === 'rotten' ? '🤢' : card.icon}</div>
        <div class="card-title">${card.name}</div>
        <div class="card-points">${card.multiplierBonus ? `${card.multiplierBonus}x` : `+${card.points}`}</div>
      `;
      handEl.appendChild(cardEl);
    });

    this.renderSelectedZone(state);
  }

  static renderSelectedZone(state) {
    const potEl = document.getElementById('ui-cooking-pot');
    potEl.innerHTML = '';

    state.selectedIndices.forEach(idx => {
      const card = state.hand[idx];
      const miniEl = document.createElement('div');
      const categoryLetter = this.getCategoryLetter(card.type);
      const isSpecialCat = categoryLetter === 'S';
      const cardStateClass = card.state ? `state-${card.state}` : '';

      miniEl.className = `card ${cardStateClass}`;
      miniEl.id = `pot-card-${idx}`;
      miniEl.style.position = 'relative';
      miniEl.style.transform = 'scale(0.85)';
      miniEl.style.left = '0';
      miniEl.style.zIndex = '5';
      miniEl.innerHTML = `
        <div class="card-corner ${isSpecialCat ? 'type-special' : `type-${card.type}`}">${categoryLetter}</div>
        ${this.getCardStateBadgeHTML(card)}
        <div class="card-icon">${card.state === 'rotten' ? '🤢' : card.icon}</div>
        <div class="card-title">${card.name}</div>
        <div class="card-points">${card.multiplierBonus ? `${card.multiplierBonus}x` : `+${card.points}`}</div>
      `;
      potEl.appendChild(miniEl);
    });
  }

  static triggerFloatingText(text, containerEl) {
    const floatEl = document.createElement('div');
    floatEl.className = 'floating-text';
    floatEl.innerText = text;
    containerEl.appendChild(floatEl);
    setTimeout(() => floatEl.remove(), 800);
  }
}
