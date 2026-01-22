export const W = 960;
export const H = 540;

export const COLORS = {
  bgHome: 0xffeef6,
  bgGame: 0xfff0f6,
  floor: 0xffc1d9,
  stair: 0xffa6c8,
  furniture: 0xff7fb0,
  furnitureOutline: 0xff4d8d,
  text: '#222',
  accent: '#ff4d8d',
};

export const RULES = {
  startTime: 60,
  missTimePenalty: 5,
  missLifePenalty: 1,
  fakeHitScorePenalty: 1000,
  baseHitScore: 100,

  spawnIntervalMinMs: 2000,
  spawnIntervalMaxMs: 3000,
  spawnBatchMin: 2,
  spawnBatchMax: 3,

  targetLifeMinMs: 2500,
  targetLifeMaxMs: 6500,

  speedMin: 70,
  speedMax: 160,
  directionChangeMinMs: 700,
  directionChangeMaxMs: 1600,

  stairUseChance: 0.45,
  fakeChancePercent: 50,
};
