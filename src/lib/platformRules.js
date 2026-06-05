export const WITHDRAWAL_REFERRAL_REQUIREMENT = 10;
export const MIN_WITHDRAWAL_ETB = 500;
export const POINT_TO_ETB_RATE = 10;
export const ETHIOPIA_TIME_OFFSET_MINUTES = 180;
export const FREE_RESET_HOURS = 12;

export const vipPlans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    reward: 0,
    color: 'green',
    perks: ['Free registration', 'Can invite people', 'One free entertainment play per day'],
  },
  {
    id: 'silver',
    name: 'VIP Silver',
    price: 500,
    reward: 250,
    color: 'silver',
    perks: ['Unlocks withdrawals after 10 valid referrals', 'Earns 250 ETB per valid referral', 'Counts as valid for inviter'],
  },
  {
    id: 'gold',
    name: 'VIP Golden',
    price: 700,
    reward: 350,
    color: 'gold',
    perks: ['Earns 350 ETB per valid referral', 'Higher earning tier', 'Withdrawal eligible after 10 valid referrals'],
  },
  {
    id: 'platinum',
    name: 'VIP Platinum',
    price: 900,
    reward: 450,
    color: 'platinum',
    perks: ['Earns 450 ETB per valid referral', 'Priority admin review', 'Withdrawal eligible after 10 valid referrals'],
  },
  {
    id: 'diamond',
    name: 'VIP Diamond',
    price: 1100,
    reward: 550,
    color: 'diamond',
    perks: ['Earns 550 ETB per valid referral', 'Highest referral payout', 'Withdrawal eligible after 10 valid referrals'],
  },
];

export const planLevels = vipPlans.reduce((levels, plan, index) => {
  levels[plan.name] = index;
  return levels;
}, {});

export const dailyGames = [
  {
    id: 'treasure',
    name: 'Daily Treasure Hunt',
    type: 'daily',
    freeLimit: 3,
    freeLabel: '3 free clicks every 12 hours',
    summary: 'Open 3 chests on a 4x4 treasure map. After the third click every chest reveals.',
    rewards: [
      { label: 'Empty box', icon: 'Box', points: 0, weight: 55 },
      { label: 'Small gem', icon: 'Gem', points: 5, weight: 20 },
      { label: 'Gold coin', icon: 'Coin', points: 10, weight: 16 },
      { label: 'Treasure chest', icon: 'Cash', points: 15, weight: 7 },
      { label: 'Diamond', icon: 'Diamond', points: 25, weight: 2 },
    ],
  },
  {
    id: 'mystery',
    name: 'Mystery Box Auction',
    type: 'daily',
    freeLimit: 1,
    freeLabel: '1 free pick every 12 hours',
    summary: 'Choose one of five identical boxes. All boxes reveal after your pick.',
    rewards: [
      { label: 'Tiny prize', icon: 'Gift', points: 2, weight: 20 },
      { label: 'Small prize', icon: 'Gem', points: 5, weight: 28 },
      { label: 'Medium prize', icon: 'Coin', points: 10, weight: 24 },
      { label: 'Empty box', icon: 'Box', points: 0, weight: 20 },
      { label: 'Jackpot', icon: 'Diamond', points: 50, weight: 8 },
    ],
  },
  {
    id: 'memory',
    name: 'Memory Match',
    type: 'daily',
    freeLimit: 1,
    freeLabel: '1 free game every 12 hours',
    summary: 'Flip 16 fruit cards, match all 8 pairs, and win a 30 point reward.',
    rewards: [
      { label: 'Completed board', icon: 'Brain', points: 30, weight: 1 },
    ],
  },
];

export const betGames = [
  {
    id: 'slot',
    name: 'Slot Machine',
    type: 'bet',
    freeLimit: 1,
    freeBetPoints: 10,
    minEtb: 5,
    maxEtb: 100,
    betOptions: [5, 10, 20, 50, 100],
    summary: 'Spin three visual reels. Matching symbols across the middle row pay multipliers.',
  },
  {
    id: 'plinko',
    name: 'Plinko',
    type: 'bet',
    freeLimit: 1,
    freeBetPoints: 20,
    minEtb: 10,
    maxEtb: 100,
    betOptions: [5, 10, 20, 50, 100],
    summary: 'Drop a ball through pegs into bottom multiplier slots.',
  },
  {
    id: 'dice',
    name: 'Dice Duel',
    type: 'bet',
    freeLimit: 1,
    freeBetPoints: 10,
    minEtb: 5,
    maxEtb: 100,
    betOptions: [5, 10, 20, 50, 100],
    summary: 'Choose a target from 1 to 96, then roll a flashing 100-number dice cube.',
  },
  {
    id: 'apple',
    name: 'Good Apple vs Bad Apple',
    type: 'bet',
    freeLimit: 1,
    freeBetPoints: 10,
    minEtb: 5,
    maxEtb: 50,
    betOptions: [5, 10, 20, 50],
    summary: 'Collect good apples, avoid bad apples, and multiply your score by your bet.',
  },
  {
    id: 'higherlower',
    name: 'Higher or Lower',
    type: 'bet',
    freeLimit: 1,
    freeBetPoints: 10,
    minEtb: 5,
    maxEtb: 50,
    betOptions: [5, 10, 20, 50],
    summary: 'Guess whether the next card will be higher or lower. Correct guesses pay 2x.',
  },
];

export const defaultGameSettings = {
  slotDiamondWeight: 1,
  slotCherryWeight: 30,
  plinkoTenXWeight: 8,
  diceHouseEdgePercent: 0,
  appleGoodMultiplier: 0.5,
  appleBadAppleWeight: 30,
  higherLowerMultiplier: 2,
  memoryWinPoints: 30,
};

export function getPlanLevel(rank = 'Starter') {
  return planLevels[rank] ?? 0;
}

export function hasSilverOrAbove(user) {
  return getPlanLevel(user?.rank) >= getPlanLevel('VIP Silver');
}

export function canWithdraw(user) {
  return hasSilverOrAbove(user) && Number(user?.validReferrals || 0) >= WITHDRAWAL_REFERRAL_REQUIREMENT;
}

export function pointsToEtb(points) {
  return Number(points || 0) / POINT_TO_ETB_RATE;
}

export function etbToPoints(etb) {
  return Math.round(Number(etb || 0) * POINT_TO_ETB_RATE);
}

export function getEthiopiaDayKey(date = new Date()) {
  const ethiopiaTime = new Date(date.getTime() + ETHIOPIA_TIME_OFFSET_MINUTES * 60 * 1000);
  return ethiopiaTime.toISOString().slice(0, 10);
}

export function getEthiopiaHalfDayKey(date = new Date()) {
  const ethiopiaTime = new Date(date.getTime() + ETHIOPIA_TIME_OFFSET_MINUTES * 60 * 1000);
  const period = ethiopiaTime.getUTCHours() < 12 ? 'am' : 'pm';
  return `${ethiopiaTime.toISOString().slice(0, 10)}-${period}`;
}

export function getNextEthiopiaHalfDayReset(date = new Date()) {
  const ethiopiaTime = new Date(date.getTime() + ETHIOPIA_TIME_OFFSET_MINUTES * 60 * 1000);
  const nextHour = ethiopiaTime.getUTCHours() < 12 ? 12 : 24;
  ethiopiaTime.setUTCHours(nextHour, 0, 0, 0);
  return new Date(ethiopiaTime.getTime() - ETHIOPIA_TIME_OFFSET_MINUTES * 60 * 1000);
}

export function getNextEthiopiaMidnight(date = new Date()) {
  const ethiopiaTime = new Date(date.getTime() + ETHIOPIA_TIME_OFFSET_MINUTES * 60 * 1000);
  ethiopiaTime.setUTCHours(24, 0, 0, 0);
  return new Date(ethiopiaTime.getTime() - ETHIOPIA_TIME_OFFSET_MINUTES * 60 * 1000);
}

export function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}

export function formatClockCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function weightedPick(items) {
  const total = items.reduce((sum, item) => sum + Number(item.weight || 1), 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= Number(item.weight || 1);
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

export function cryptoRandomInt(min, max) {
  const low = Math.ceil(min);
  const high = Math.floor(max);
  const range = high - low + 1;
  const array = new Uint32Array(1);
  globalThis.crypto?.getRandomValues?.(array);
  const value = array[0] || Math.floor(Math.random() * 2 ** 32);
  return low + (value % range);
}

export function shuffle(items) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = cryptoRandomInt(0, index);
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}
