export type MemberRank = 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type MemberStatus = 'waiting' | 'playing' | 'break' | 'lesson' | 'left';

export interface Member {
  id: string;
  name: string;
  rank: MemberRank;
  gender: 'M' | 'F';
  isGuest?: boolean;
  status: MemberStatus;
  order: number;
  consecutiveGames: number;
  todayGamesCount: number;
  playedGamesCount: number;
  shuttlecockSubmitted: boolean;
  coneNumber?: string;
  lessonStartTime?: string;
  breakStartTime?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface TrafficCone {
  id: string;
  number: number; // 꼬깔 번호 (예: 1번, 2번...)
  isOurClub: boolean; // true: 우리 모임 꼬깔, false: 타 모임/일반 꼬깔
  gameId?: string; // 이 꼬깔에 배정된 경기 ID
  label?: string; // 라벨
}

export interface Court {
  id: string;
  name: string;
  number: number;
  isActive: boolean;
  reservationRatio?: number; // 꼬깔 점유 비율
  cones: TrafficCone[]; // 코트에 걸려 있는 꼬깔 순서 목록
}

export type GameStatus = 'before' | 'playing' | 'end';
export type GameType = 'men' | 'women' | 'mixed';

export interface Game {
  id: string;
  gameNumber: number;
  courtId: string;
  status: GameStatus;
  team1: [Member, Member];
  team2: [Member, Member];
  type: GameType;
  score1?: number;
  score2?: number;
  startTime?: string;
  endTime?: string;
  isYangHeeWooMode?: boolean; // 양희우 모드 (여기부터 재매칭)
  coneId?: string; // 배정된 꼬깔 ID
}

export interface PartnerPair {
  id: string;
  type: 'partner' | 'breakup';
  memberId1: string;
  memberId2: string;
  member1Name?: string;
  member2Name?: string;
}

export interface MemberDiffItem {
  id: string;
  name: string;
  existingRank: MemberRank;
  newRank: MemberRank;
  existingGender: 'M' | 'F';
  newGender: 'M' | 'F';
  rankChanged: boolean;
  genderChanged: boolean;
  selected: boolean;
  rawNewMember?: Member;
}

export interface ClubSession {
  id: string;
  date: string;
  startTime?: string;
  adminCode: string;
  courts: Court[];
  members: Member[];
  games: Game[];
  partnerPairs?: PartnerPair[];
}
