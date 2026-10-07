import { Member, Game, Court, GameType, PartnerPair, MemberRank } from '../types';

export const RANK_SCORES: Record<MemberRank, number> = {
  S: 7,
  A: 6,
  B: 5,
  C: 4,
  D: 3,
  E: 2,
  F: 1,
};

export function getRankScore(rank: MemberRank): number {
  return RANK_SCORES[rank] || 3;
}

export function generateAutoMatches(
  members: Member[],
  courts: Court[],
  existingGames: Game[],
  preferredType?: GameType,
  partnerPairs: PartnerPair[] = []
): Game[] {
  // Select active waiting members
  const waitingMembers = members.filter(
    (m) => m.status === 'waiting' && m.consecutiveGames < 2
  );

  if (waitingMembers.length < 4) {
    return [];
  }

  // Sort by order/priority, games played (fewer games first)
  const sorted = [...waitingMembers].sort((a, b) => {
    if (a.todayGamesCount !== b.todayGamesCount) {
      return a.todayGamesCount - b.todayGamesCount;
    }
    return a.order - b.order;
  });

  const newGames: Game[] = [];
  const usedMemberIds = new Set<string>();

  // Active courts
  const activeCourts = courts.filter((c) => c.isActive);

  for (const court of activeCourts) {
    const candidates = sorted.filter((m) => !usedMemberIds.has(m.id));
    if (candidates.length < 4) break;

    // Filter by type if preferred
    let selected4: Member[] = [];
    if (preferredType === 'men') {
      const men = candidates.filter((m) => m.gender === 'M');
      if (men.length >= 4) selected4 = men.slice(0, 4);
    } else if (preferredType === 'women') {
      const women = candidates.filter((m) => m.gender === 'F');
      if (women.length >= 4) selected4 = women.slice(0, 4);
    } else if (preferredType === 'mixed') {
      const men = candidates.filter((m) => m.gender === 'M');
      const women = candidates.filter((m) => m.gender === 'F');
      if (men.length >= 2 && women.length >= 2) {
        selected4 = [men[0], men[1], women[0], women[1]];
      }
    }

    if (selected4.length < 4) {
      selected4 = candidates.slice(0, 4);
    }

    selected4.forEach((m) => usedMemberIds.add(m.id));

    // Best 2v2 split to balance rank score
    // 3 combinations of pairing:
    // 1) (0,1) vs (2,3)
    // 2) (0,2) vs (1,3)
    // 3) (0,3) vs (1,2)
    const combinations: [ [Member, Member], [Member, Member] ][] = [
      [[selected4[0], selected4[1]], [selected4[2], selected4[3]]],
      [[selected4[0], selected4[2]], [selected4[1], selected4[3]]],
      [[selected4[0], selected4[3]], [selected4[1], selected4[2]]],
    ];

    let bestPairing = combinations[0];
    let minDiff = 999;

    combinations.forEach((combo) => {
      const team1Score = getRankScore(combo[0][0].rank) + getRankScore(combo[0][1].rank);
      const team2Score = getRankScore(combo[1][0].rank) + getRankScore(combo[1][1].rank);
      const diff = Math.abs(team1Score - team2Score);

      // Check partner / breakup constraints
      let penalty = 0;
      partnerPairs.forEach((pair) => {
        const id1 = pair.memberId1;
        const id2 = pair.memberId2;
        const isTeam1 = (combo[0][0].id === id1 && combo[0][1].id === id2) || (combo[0][0].id === id2 && combo[0][1].id === id1);
        const isTeam2 = (combo[1][0].id === id1 && combo[1][1].id === id2) || (combo[1][0].id === id2 && combo[1][1].id === id1);

        if (pair.type === 'partner') {
          if (!isTeam1 && !isTeam2) penalty += 50;
        } else if (pair.type === 'breakup') {
          // In same game
          const all4Ids = [combo[0][0].id, combo[0][1].id, combo[1][0].id, combo[1][1].id];
          if (all4Ids.includes(id1) && all4Ids.includes(id2)) penalty += 100;
        }
      });

      if (diff + penalty < minDiff) {
        minDiff = diff + penalty;
        bestPairing = combo;
      }
    });

    const mCount = selected4.filter((m) => m.gender === 'M').length;
    const fCount = selected4.filter((m) => m.gender === 'F').length;
    let finalType: GameType = 'mixed';
    if (mCount === 4) finalType = 'men';
    else if (fCount === 4) finalType = 'women';

    const maxGameNumber = existingGames.reduce((max, g) => Math.max(max, g.gameNumber), 0) + newGames.length + 1;

    newGames.push({
      id: `game-${Date.now()}-${newGames.length}-${Math.random().toString(36).substr(2, 5)}`,
      gameNumber: maxGameNumber,
      courtId: court.id,
      status: 'before',
      team1: bestPairing[0],
      team2: bestPairing[1],
      type: finalType,
    });
  }

  return newGames;
}
