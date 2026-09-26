/**
 * Standard Elo Rating Calculations (FIDE / USCF standard)
 */

export function calculateExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function calculateNewRatings(
  ratingWhite: number,
  ratingBlack: number,
  result: 1 | 0.5 | 0, // 1: White wins, 0.5: Draw, 0: Black wins
  kFactor: number = 32
): {
  newRatingWhite: number;
  newRatingBlack: number;
  deltaWhite: number;
  deltaBlack: number;
} {
  const expectedWhite = calculateExpectedScore(ratingWhite, ratingBlack);
  const expectedBlack = 1 - expectedWhite;

  const resultWhite = result;
  const resultBlack = 1 - result;

  const deltaWhite = Math.round(kFactor * (resultWhite - expectedWhite));
  const deltaBlack = Math.round(kFactor * (resultBlack - expectedBlack));

  return {
    newRatingWhite: Math.max(400, ratingWhite + deltaWhite),
    newRatingBlack: Math.max(400, ratingBlack + deltaBlack),
    deltaWhite,
    deltaBlack,
  };
}
