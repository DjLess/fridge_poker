export const LEVEL_CONFIGS = [
  { week: 1, targetScore: 120, startingCoins: 10, levelName: 'Home Kitchen' },
  { week: 2, targetScore: 250, startingCoins: 15, levelName: 'Local Bistro' },
  { week: 3, targetScore: 500, startingCoins: 20, levelName: 'Gourmet Restaurant' },
  { week: 4, targetScore: 1000, startingCoins: 25, levelName: 'Michelin Star Kitchen' }
];

export class LevelManager {
  static getLevel(weekNumber) {
    const level = LEVEL_CONFIGS.find(l => l.week === weekNumber);
    if (level) return level;

    // Procedural scaling for higher levels past defined list
    return {
      week: weekNumber,
      targetScore: Math.round(1000 * Math.pow(1.6, weekNumber - 4)),
      startingCoins: 30,
      levelName: `Grand Kitchen W${weekNumber}`
    };
  }
}