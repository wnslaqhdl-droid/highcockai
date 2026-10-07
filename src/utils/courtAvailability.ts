import { Court, Game } from '../types';

export interface OccupancyStats {
  totalCourts: number;
  activeCourts: number;
  occupiedCourtsRatio: number;
  overallConeOccupancyRate: number;
}

export function calculateOccupancyStats(courts: Court[], games: Game[]): OccupancyStats {
  const totalCourts = courts.length;
  const activeCourts = courts.filter((c) => c.isActive).length;

  if (totalCourts === 0) {
    return {
      totalCourts: 0,
      activeCourts: 0,
      occupiedCourtsRatio: 0,
      overallConeOccupancyRate: 0,
    };
  }

  // 합산 점유 코트 수
  let sumRatio = 0;
  courts.forEach((c) => {
    sumRatio += (c.reservationRatio ?? 1);
  });

  const overallConeOccupancyRate = Math.round((sumRatio / totalCourts) * 100);

  return {
    totalCourts,
    activeCourts,
    occupiedCourtsRatio: Math.round(sumRatio * 10) / 10,
    overallConeOccupancyRate,
  };
}
