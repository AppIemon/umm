/**
 * ELO Rating and Tier System
 * 
 * ELO Formula: k=8 with streak bonus
 * Streak Bonus: (currentWinStreak * sqrt(opponentWinStreak)) extra points on win
 */

export interface TierInfo {
  name: string;
  nameKr: string;
  color: string;
  minRating: number;
  icon: string;
}

export const TIER_THRESHOLDS: TierInfo[] = [
  { name: 'Grandmaster', nameKr: '그랜드마스터', color: '#ff0044', minRating: 2400, icon: '👑' },
  { name: 'Master', nameKr: '마스터', color: '#ff4488', minRating: 2100, icon: '💎' },
  { name: 'Diamond', nameKr: '다이아', color: '#00cfff', minRating: 1800, icon: '💠' },
  { name: 'Platinum', nameKr: '플래티넘', color: '#00ffa8', minRating: 1500, icon: '🔷' },
  { name: 'Gold', nameKr: '골드', color: '#ffd700', minRating: 1200, icon: '🏅' },
  { name: 'Silver', nameKr: '실버', color: '#c0c0c0', minRating: 900, icon: '🥈' },
  { name: 'Bronze', nameKr: '브론즈', color: '#cd7f32', minRating: 0, icon: '🥉' },
];

/**
 * Get tier info from rating
 */
export function getTierFromRating(rating: number): TierInfo {
  for (const tier of TIER_THRESHOLDS) {
    if (rating >= tier.minRating) {
      return tier;
    }
  }
  // Bronze is always the fallback (minRating: 0)
  return TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1]!;
}

/**
 * Calculate expected score using ELO formula
 */
function getExpectedScore(myRating: number, opponentRating: number): number {
  return 1 / (1 + Math.pow(10, (opponentRating - myRating) / 400));
}

/**
 * Calculate ELO rating change with streak bonus
 * 
 * @param myRating - Current player's rating
 * @param opponentRating - Opponent's rating  
 * @param didWin - Whether the player won
 * @param myStreak - Current player's win streak (before this game)
 * @param opponentStreak - Opponent's win streak
 * @returns Rating change (positive for gain, negative for loss)
 */
export function calculateEloChange(
  myRating: number,
  opponentRating: number,
  didWin: boolean,
  myStreak: number = 0,
  opponentStreak: number = 0
): number {
  const K = 8; // Base k-factor
  const expectedScore = getExpectedScore(myRating, opponentRating);
  const actualScore = didWin ? 1 : 0;

  // Base ELO change
  let ratingChange = Math.round(K * (actualScore - expectedScore));

  // Streak bonus: only on win
  // Formula: (currentWinStreak * sqrt(opponentWinStreak)) extra points
  if (didWin) {
    const newStreak = myStreak + 1; // This win counts toward streak
    const streakBonus = Math.round(newStreak * Math.sqrt(Math.max(opponentStreak, 1)));
    ratingChange += streakBonus;
  }

  return ratingChange;
}

/**
 * Calculate new rating and check for tier change
 */
export function calculateNewRating(
  currentRating: number,
  opponentRating: number,
  didWin: boolean,
  myStreak: number = 0,
  opponentStreak: number = 0
): {
  newRating: number;
  ratingChange: number;
  oldTier: TierInfo;
  newTier: TierInfo;
  tierChanged: boolean;
  isPromotion: boolean;
} {
  const oldTier = getTierFromRating(currentRating);
  const ratingChange = calculateEloChange(currentRating, opponentRating, didWin, myStreak, opponentStreak);
  const newRating = Math.max(0, currentRating + ratingChange); // Can't go below 0
  const newTier = getTierFromRating(newRating);

  const tierChanged = oldTier.name !== newTier.name;
  const isPromotion = tierChanged && newTier.minRating > oldTier.minRating;

  return {
    newRating,
    ratingChange,
    oldTier,
    newTier,
    tierChanged,
    isPromotion
  };
}

/**
 * Get tier index for comparison (higher = better)
 */
export function getTierIndex(tierName: string): number {
  return TIER_THRESHOLDS.length - TIER_THRESHOLDS.findIndex(t => t.name === tierName) - 1;
}
