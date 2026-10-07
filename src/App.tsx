import React, { useState, useEffect } from 'react';
import { Member, Court, Game, ClubSession, PartnerPair, GameType, MemberStatus, TrafficCone } from './types';
import { Header } from './components/Header';
import { CourtSection } from './components/CourtSection';
import { MemberSection } from './components/MemberSection';
import { GameSection } from './components/GameSection';
import { ParticipantView } from './components/ParticipantView';
import { MobileSectionTabBar, MobileSectionTab } from './components/MobileSectionTabBar';
import { BatchMemberModal } from './components/BatchMemberModal';
import { MemberModal } from './components/MemberModal';
import { CourtEditModal } from './components/CourtEditModal';
import { PairingModeModal } from './components/PairingModeModal';
import { ManualMatchModal } from './components/ManualMatchModal';
import { CreateSessionModal } from './components/CreateSessionModal';
import { SessionManageModal } from './components/SessionManageModal';
import { ManualModal } from './components/ManualModal';
import { ConfirmDialog, ConfirmDialogProps } from './components/ConfirmDialog';
import { MemberRegistryModal, RegistryMember } from './components/MemberRegistryModal';
import { PlayerSwapModal } from './components/PlayerSwapModal';
import { AIDiagnosisModal } from './components/AIDiagnosisModal';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { CourtAdvanceModal } from './components/CourtAdvanceModal';
import { CourtConeModal } from './components/CourtConeModal';
import { generateAutoMatches } from './utils/badmintonLogic';

const STORAGE_KEY = 'highcock_session_data_v1';
const REGISTRY_STORAGE_KEY = 'highcock_member_registry_v1';

export default function App() {
  const [mode, setMode] = useState<'admin' | 'participant'>('admin');
  const [mobileTab, setMobileTab] = useState<MobileSectionTab>('court');

  // 세션 정보
  const [sessionDate, setSessionDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [sessionStartTime, setSessionStartTime] = useState('19:00');
  const [adminCode, setAdminCode] = useState('1234');

  // 코트 목록 (기본 4개 코트 및 꼬깔 설정)
  const [courts, setCourts] = useState<Court[]>(() => [
    {
      id: 'c1',
      name: '1번 코트',
      number: 1,
      isActive: true,
      reservationRatio: 1,
      cones: [
        { id: 'cone-1-1', number: 1, isOurClub: true, label: '우리 꼬깔 (1번)' },
        { id: 'cone-1-2', number: 2, isOurClub: true, label: '우리 꼬깔 (2번)' },
      ],
    },
    {
      id: 'c2',
      name: '2번 코트',
      number: 2,
      isActive: true,
      reservationRatio: 1,
      cones: [
        { id: 'cone-2-1', number: 1, isOurClub: true, label: '우리 꼬깔 (1번)' },
        { id: 'cone-2-2', number: 2, isOurClub: false, label: '타 모임 차례' },
      ],
    },
    {
      id: 'c3',
      name: '3번 코트',
      number: 3,
      isActive: true,
      reservationRatio: 1,
      cones: [{ id: 'cone-3-1', number: 1, isOurClub: true, label: '우리 꼬깔 (1번)' }],
    },
    {
      id: 'c4',
      name: '4번 코트',
      number: 4,
      isActive: true,
      reservationRatio: 1,
      cones: [{ id: 'cone-4-1', number: 1, isOurClub: true, label: '우리 꼬깔 (1번)' }],
    },
  ]);

  // 회원 목록
  const [members, setMembers] = useState<Member[]>(() => []);

  // 게임 목록
  const [games, setGames] = useState<Game[]>(() => []);

  // 파트너 / 결별 목록
  const [partnerPairs, setPartnerPairs] = useState<PartnerPair[]>(() => []);

  // 운동 세션 목록
  const [sessions, setSessions] = useState<ClubSession[]>(() => []);

  // 상시 클럽 명부 DB
  const [registryMembers, setRegistryMembers] = useState<RegistryMember[]>(() => [
    { id: 'reg-1', name: '김철수', rank: 'B', gender: 'M', isRegular: true, phone: '010-1234-5678' },
    { id: 'reg-2', name: '홍길동', rank: 'A', gender: 'M', isRegular: true, phone: '010-2345-6789' },
    { id: 'reg-3', name: '이영희', rank: 'C', gender: 'F', isRegular: true, phone: '010-3456-7890' },
    { id: 'reg-4', name: '박민수', rank: 'B', gender: 'M', isRegular: true, phone: '010-4567-8901' },
    { id: 'reg-5', name: '정다은', rank: 'D', gender: 'F', isRegular: true, phone: '010-5678-9012' },
    { id: 'reg-6', name: '한지민', rank: 'C', gender: 'F', isRegular: true, phone: '010-6789-0123' },
  ]);

  // 모달 상태들
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);
  const [isManualMatchModalOpen, setIsManualMatchModalOpen] = useState(false);
  const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] = useState(false);
  const [isSessionManageModalOpen, setIsSessionManageModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isRegistryModalOpen, setIsRegistryModalOpen] = useState(false);
  const [isAIDiagnosisModalOpen, setIsAIDiagnosisModalOpen] = useState(false);
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);

  // 꼬깔 거는 화면 모달
  const [coneModalState, setConeModalState] = useState<{
    isOpen: boolean;
    court: Court | null;
  }>({
    isOpen: false,
    court: null,
  });

  // 선수 교체 / 스왑 모달
  const [swapModalState, setSwapModalState] = useState<{
    isOpen: boolean;
    game: Game | null;
    targetMember: Member | null;
  }>({
    isOpen: false,
    game: null,
    targetMember: null,
  });

  // 코트 회전 모달
  const [courtAdvanceState, setCourtAdvanceState] = useState<{
    isOpen: boolean;
    court: Court | null;
    current: Game | null;
    next: Game | null;
  }>({
    isOpen: false,
    court: null,
    current: null,
    next: null,
  });

  // 확인 다이얼로그
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogProps | null>(null);

  // 로컬 스토리지 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.sessionDate) setSessionDate(data.sessionDate);
        if (data.sessionStartTime) setSessionStartTime(data.sessionStartTime);
        if (data.adminCode) setAdminCode(data.adminCode);
        if (Array.isArray(data.courts) && data.courts.length > 0) {
          // ensure cones array exists
          setCourts(data.courts.map((c: any) => ({ ...c, cones: c.cones || [] })));
        }
        if (Array.isArray(data.members)) setMembers(data.members);
        if (Array.isArray(data.games)) setGames(data.games);
        if (Array.isArray(data.partnerPairs)) setPartnerPairs(data.partnerPairs);
        if (Array.isArray(data.sessions)) setSessions(data.sessions);
      }

      const savedRegistry = localStorage.getItem(REGISTRY_STORAGE_KEY);
      if (savedRegistry) {
        const regData = JSON.parse(savedRegistry);
        if (Array.isArray(regData)) setRegistryMembers(regData);
      }
    } catch (e) {
      console.error('Failed to load session data:', e);
    }
  }, []);

  // 상태 변경 시 로컬 스토리지 자동 저장
  const saveData = (
    newMembers = members,
    newCourts = courts,
    newGames = games,
    newPairs = partnerPairs
  ) => {
    try {
      const data = {
        sessionDate,
        sessionStartTime,
        adminCode,
        courts: newCourts,
        members: newMembers,
        games: newGames,
        partnerPairs: newPairs,
        sessions,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save session data:', e);
    }
  };

  const saveRegistry = (newReg: RegistryMember[]) => {
    try {
      setRegistryMembers(newReg);
      localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(newReg));
    } catch (e) {
      console.error('Failed to save registry:', e);
    }
  };

  // 회원 상태 변경 핸들러
  const handleMemberStatusChange = (id: string, newStatus: MemberStatus) => {
    setMembers((prev) => {
      const target = prev.find((m) => m.id === id);
      let nextOrder = target?.order || prev.length;

      if (target?.status === 'left' && newStatus === 'waiting') {
        const waitingMembers = prev.filter((m) => m.status !== 'left');
        const maxOrder = waitingMembers.reduce((max, m) => Math.max(max, m.order || 0), 0);
        nextOrder = maxOrder + 1;
      }

      const updated = prev.map((m) =>
        m.id === id ? { ...m, status: newStatus, order: nextOrder } : m
      );
      saveData(updated);
      return updated;
    });
  };

  // 회원 셔틀콕 제출 토글
  const handleToggleShuttlecock = (id: string) => {
    setMembers((prev) => {
      const updated = prev.map((m) =>
        m.id === id ? { ...m, shuttlecockSubmitted: !m.shuttlecockSubmitted } : m
      );
      saveData(updated);
      return updated;
    });
  };

  // 회원 추가 / 수정 저장
  const handleSaveMember = (data: Partial<Member>) => {
    setMembers((prev) => {
      let updated: Member[];
      if (editingMember) {
        updated = prev.map((m) => (m.id === editingMember.id ? ({ ...m, ...data } as Member) : m));
      } else {
        const newM: Member = {
          id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: data.name || '',
          rank: data.rank || 'D',
          gender: data.gender || 'M',
          isGuest: Boolean(data.isGuest),
          status: 'left',
          order: prev.length + 1,
          consecutiveGames: 0,
          todayGamesCount: 0,
          playedGamesCount: 0,
          shuttlecockSubmitted: false,
        };
        updated = [...prev, newM];
      }
      saveData(updated);
      return updated;
    });
    setEditingMember(null);
  };

  // 회원 삭제
  const handleDeleteMember = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      variant: 'danger',
      title: '회원 삭제',
      message: '해당 회원을 참여 명단에서 삭제하시겠습니까?',
      confirmLabel: '삭제',
      onConfirm: () => {
        setMembers((prev) => {
          const updated = prev.filter((m) => m.id !== id);
          saveData(updated);
          return updated;
        });
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  // 참여 명단 전체 초기화
  const handleClearAllMembers = () => {
    if (members.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      variant: 'danger',
      title: '참여 명단 초기화',
      message: '현재 등록된 모든 회원 명단을 삭제하시겠습니까?\n새로운 모임 시작을 위해 생성된 모든 경기와 기록도 함께 초기화됩니다.',
      confirmLabel: '명단 전체 삭제',
      onConfirm: () => {
        setMembers([]);
        setGames([]);
        saveData([], courts, []);
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  // 회원 일괄 등록 적용
  const handleBatchApply = (newMembers: Member[], replace: boolean) => {
    setMembers((prev) => {
      const updated = replace ? newMembers : [...prev, ...newMembers];
      saveData(updated);
      return updated;
    });
  };

  // 명부에서 참석자로 임포트
  const handleImportFromRegistry = (selectedReg: RegistryMember[]) => {
    setMembers((prev) => {
      const maxOrder = prev.reduce((max, m) => Math.max(max, m.order || 0), 0);
      const newItems: Member[] = selectedReg.map((r, idx) => ({
        id: `member-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
        name: r.name,
        rank: r.rank,
        gender: r.gender,
        isGuest: !r.isRegular,
        status: 'left',
        order: maxOrder + idx + 1,
        consecutiveGames: 0,
        todayGamesCount: 0,
        playedGamesCount: 0,
        shuttlecockSubmitted: false,
      }));
      const updated = [...prev, ...newItems];
      saveData(updated);
      return updated;
    });
  };

  // 자동 매칭 생성
  const handleAutoGenerateMatches = (preferredType?: GameType) => {
    const newMatches = generateAutoMatches(members, courts, games, preferredType, partnerPairs);
    if (newMatches.length === 0) {
      setConfirmDialog({
        isOpen: true,
        variant: 'warning',
        title: '자동 매칭 불가',
        message: '대기 중인 회원이 4명 미만이거나 배정 가능한 인원이 부족합니다.\n회원 상태를 [대기]로 전환한 후 다시 시도해주세요.',
        confirmLabel: '확인',
        onConfirm: () => setConfirmDialog(null),
      });
      return;
    }

    const assignedIds = new Set(
      newMatches.flatMap((g) => [g.team1[0].id, g.team1[1].id, g.team2[0].id, g.team2[1].id])
    );

    const updatedMembers = members.map((m) => {
      if (assignedIds.has(m.id)) {
        return {
          ...m,
          todayGamesCount: (m.todayGamesCount || 0) + 1,
        };
      }
      return m;
    });

    const updatedGames = [...games, ...newMatches];
    setMembers(updatedMembers);
    setGames(updatedGames);
    saveData(updatedMembers, courts, updatedGames);
  };

  // 수동 매칭 생성
  const handleCreateManualMatch = (newGame: Game) => {
    const assignedIds = new Set([
      newGame.team1[0].id,
      newGame.team1[1].id,
      newGame.team2[0].id,
      newGame.team2[1].id,
    ]);

    const updatedMembers = members.map((m) => {
      if (assignedIds.has(m.id)) {
        return {
          ...m,
          todayGamesCount: (m.todayGamesCount || 0) + 1,
        };
      }
      return m;
    });

    const updatedGames = [...games, newGame];
    setMembers(updatedMembers);
    setGames(updatedGames);
    saveData(updatedMembers, courts, updatedGames);
  };

  // 선택한 4인으로 즉시 게임 생성
  const handleCreateMatchWithSelected = (selected4: Member[]) => {
    if (selected4.length !== 4) return;
    const maxGameNumber = games.reduce((max, g) => Math.max(max, g.gameNumber), 0) + 1;
    const court = courts[0];

    const mCount = selected4.filter((m) => m.gender === 'M').length;
    const fCount = selected4.filter((m) => m.gender === 'F').length;
    let type: GameType = 'mixed';
    if (mCount === 4) type = 'men';
    else if (fCount === 4) type = 'women';

    const newGame: Game = {
      id: `game-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      gameNumber: maxGameNumber,
      courtId: court?.id || 'c1',
      status: 'before',
      team1: [selected4[0], selected4[1]],
      team2: [selected4[2], selected4[3]],
      type,
    };

    handleCreateManualMatch(newGame);
  };

  // 게임 상태 변경
  const handleGameStatusChange = (gameId: string, newStatus: 'playing' | 'end' | 'before') => {
    setGames((prev) => {
      const targetGame = prev.find((g) => g.id === gameId);
      if (!targetGame) return prev;

      const playerIds = [
        targetGame.team1[0].id,
        targetGame.team1[1].id,
        targetGame.team2[0].id,
        targetGame.team2[1].id,
      ];

      if (newStatus === 'playing') {
        setMembers((mList) =>
          mList.map((m) => (playerIds.includes(m.id) ? { ...m, status: 'playing' } : m))
        );
      } else if (newStatus === 'end') {
        setMembers((mList) =>
          mList.map((m) =>
            playerIds.includes(m.id)
              ? {
                  ...m,
                  status: 'waiting',
                  playedGamesCount: (m.playedGamesCount || 0) + 1,
                  consecutiveGames: (m.consecutiveGames || 0) + 1,
                }
              : { ...m, consecutiveGames: 0 }
          )
        );
      } else if (newStatus === 'before') {
        setMembers((mList) =>
          mList.map((m) => (playerIds.includes(m.id) ? { ...m, status: 'waiting' } : m))
        );
      }

      const updated = prev.map((g) => (g.id === gameId ? { ...g, status: newStatus } : g));
      saveData(members, courts, updated);
      return updated;
    });
  };

  // 게임 삭제
  const handleDeleteGame = (gameId: string) => {
    setConfirmDialog({
      isOpen: true,
      variant: 'danger',
      title: '경기 삭제',
      message: '이 경기를 게임 목록에서 삭제하시겠습니까?',
      confirmLabel: '삭제',
      onConfirm: () => {
        setGames((prev) => {
          const updated = prev.filter((g) => g.id !== gameId);
          saveData(members, courts, updated);
          return updated;
        });
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  // 양희우 모드 (여기부터 재매칭)
  const handleTriggerYangHeeWooMode = (fromGameId: string) => {
    const targetIdx = games.findIndex((g) => g.id === fromGameId);
    if (targetIdx === -1) return;

    setConfirmDialog({
      isOpen: true,
      variant: 'warning',
      title: '양희우 모드 (여기부터 재매칭)',
      message: `선택한 #${games[targetIdx].gameNumber} 경기부터 이후 대기 중인 모든 경기를 삭제하고,\n현재 대기 중인 회원들로 새롭게 매칭을 재생성하시겠습니까?`,
      confirmLabel: '재매칭 실행',
      onConfirm: () => {
        const preserved = games.slice(0, targetIdx);
        const newMatches = generateAutoMatches(members, courts, preserved, undefined, partnerPairs);
        const finalGames = [...preserved, ...newMatches];
        setGames(finalGames);
        saveData(members, courts, finalGames);
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  // 코트 회전 실행
  const handleAdvanceCourt = (courtId: string, endCurrentGameId?: string, startNextGameId?: string) => {
    if (endCurrentGameId) {
      handleGameStatusChange(endCurrentGameId, 'end');
    }
    if (startNextGameId) {
      handleGameStatusChange(startNextGameId, 'playing');
    }
  };

  // 코트 꼬깔 순서 업데이트
  const handleUpdateCourtCones = (courtId: string, updatedCones: TrafficCone[]) => {
    setCourts((prev) => {
      const updated = prev.map((c) => (c.id === courtId ? { ...c, cones: updatedCones } : c));
      saveData(members, updated, games);
      return updated;
    });
  };

  // 선수 상대팀 맞바꿈 (스왑)
  const handleSwapWithOpponent = (gameId: string, memberId1: string, memberId2: string) => {
    setGames((prev) => {
      const updated = prev.map((g) => {
        if (g.id !== gameId) return g;
        const all4 = [...g.team1, ...g.team2];
        const m1 = all4.find((m) => m.id === memberId1);
        const m2 = all4.find((m) => m.id === memberId2);
        if (!m1 || !m2) return g;

        const newT1 = g.team1.map((m) => (m.id === memberId1 ? m2 : m.id === memberId2 ? m1 : m)) as [Member, Member];
        const newT2 = g.team2.map((m) => (m.id === memberId1 ? m2 : m.id === memberId2 ? m1 : m)) as [Member, Member];
        return { ...g, team1: newT1, team2: newT2 };
      });
      saveData(members, courts, updated);
      return updated;
    });
  };

  // 선수 대기자로 교체
  const handleReplaceWithWaiting = (gameId: string, oldMemberId: string, newMember: Member) => {
    setGames((prev) => {
      const updated = prev.map((g) => {
        if (g.id !== gameId) return g;
        const newT1 = g.team1.map((m) => (m.id === oldMemberId ? newMember : m)) as [Member, Member];
        const newT2 = g.team2.map((m) => (m.id === oldMemberId ? newMember : m)) as [Member, Member];
        return { ...g, team1: newT1, team2: newT2 };
      });
      saveData(members, courts, updated);
      return updated;
    });
  };

  // 코트 추가
  const handleAddCourt = () => {
    if (courts.length >= 14) {
      alert('코트는 최대 14개까지 추가할 수 있습니다.');
      return;
    }
    const nextNumber = courts.length > 0 ? Math.max(...courts.map((c) => c.number)) + 1 : 1;
    const newCourt: Court = {
      id: `court-${Date.now()}`,
      name: `${nextNumber}번 코트`,
      number: nextNumber,
      isActive: true,
      reservationRatio: 1,
      cones: [{ id: `cone-${Date.now()}`, number: 1, isOurClub: true, label: '우리 꼬깔 (1번)' }],
    };
    const updated = [...courts, newCourt];
    setCourts(updated);
    saveData(members, updated, games);
  };

  // 새 운동 생성 (캡쳐로 추출된 회원 명단 즉시 자동 등록 지원)
  const handleCreateSession = async (config: {
    date: string;
    startTime?: string;
    adminCode: string;
    copyPrevious: boolean;
    initialMembers?: Member[];
  }) => {
    const newSession: ClubSession = {
      id: `session-${Date.now()}`,
      date: config.date,
      startTime: config.startTime,
      adminCode: config.adminCode,
      courts: config.copyPrevious
        ? courts
        : [
            { id: 'c1', name: '1번 코트', number: 1, isActive: true, reservationRatio: 1, cones: [{ id: 'cone-1', number: 1, isOurClub: true }] },
            { id: 'c2', name: '2번 코트', number: 2, isActive: true, reservationRatio: 1, cones: [{ id: 'cone-2', number: 1, isOurClub: true }] },
            { id: 'c3', name: '3번 코트', number: 3, isActive: true, reservationRatio: 1, cones: [{ id: 'cone-3', number: 1, isOurClub: true }] },
            { id: 'c4', name: '4번 코트', number: 4, isActive: true, reservationRatio: 1, cones: [{ id: 'cone-4', number: 1, isOurClub: true }] },
          ],
      members: config.initialMembers || [],
      games: [],
    };

    setSessionDate(config.date);
    if (config.startTime) setSessionStartTime(config.startTime);
    setAdminCode(config.adminCode);
    setMembers(config.initialMembers || []);
    setGames([]);
    setSessions((prev) => [...prev, newSession]);
    saveData(config.initialMembers || [], newSession.courts, []);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      {/* 헤더 바 */}
      <Header
        mode={mode}
        onToggleMode={() => {
          if (mode === 'participant') {
            setIsAdminPasswordModalOpen(true);
          } else {
            setMode('participant');
          }
        }}
        sessionDate={sessionDate}
        sessionStartTime={sessionStartTime}
        onOpenSessionManage={() => setIsSessionManageModalOpen(true)}
        onOpenManual={() => setIsManualModalOpen(true)}
        courtCount={courts.length}
        memberCount={members.filter((m) => m.status !== 'left').length}
        gameCount={games.length}
      />

      {/* 메인 레이아웃 컨테이너 */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5">
        {mode === 'participant' ? (
          /* 참가자 모드 뷰 */
          <ParticipantView
            courts={courts}
            games={games}
            members={members}
            sessionStartTime={sessionStartTime}
          />
        ) : (
          /* 운영진 모드 뷰 */
          <div className="space-y-4">
            {/* 모바일 화면 전용 상단 탭: 코트 현황 / 참여 명단 / 게임 목록 */}
            <MobileSectionTabBar
              activeTab={mobileTab}
              onTabChange={setMobileTab}
              courtCount={courts.length}
              memberCount={members.filter((m) => m.status !== 'left').length}
              gameCount={games.length}
            />

            {/* 1. 코트 현황 섹션 (꼬깔 거는 화면 & 회전 연결) */}
            <div className={mobileTab === 'court' ? 'block' : 'hidden lg:block'}>
              <CourtSection
                courts={courts}
                games={games}
                members={members}
                sessionStartTime={sessionStartTime}
                onAddCourt={handleAddCourt}
                onEditCourt={(court) => setEditingCourt(court)}
                onDeleteCourt={(id) => {
                  const updated = courts.filter((c) => c.id !== id);
                  setCourts(updated);
                  saveData(members, updated, games);
                }}
                onGameStatusChange={handleGameStatusChange}
                onOpenCourtAdvance={(court, current, next) => {
                  setCourtAdvanceState({ isOpen: true, court, current, next });
                }}
                onOpenCourtConeModal={(court) => {
                  setConeModalState({ isOpen: true, court });
                }}
              />
            </div>

            {/* 2. 2단 그리드: 참여 명단 & 게임 목록 */}
            <div
              className={`grid grid-cols-1 lg:grid-cols-12 gap-4 items-start ${
                mobileTab === 'court' ? 'hidden lg:grid' : ''
              }`}
            >
              {/* 참여 명단 (5컬럼) */}
              <div
                className={`lg:col-span-5 h-full ${
                  mobileTab === 'members' ? 'block' : 'hidden lg:block'
                }`}
              >
                <MemberSection
                  members={members}
                  games={games}
                  courts={courts}
                  sessionStartTime={sessionStartTime}
                  onAddMemberClick={() => {
                    setEditingMember(null);
                    setIsMemberModalOpen(true);
                  }}
                  onOpenBatchModal={() => setIsBatchModalOpen(true)}
                  onOpenRegistry={() => setIsRegistryModalOpen(true)}
                  onEditMember={(member) => {
                    setEditingMember(member);
                    setIsMemberModalOpen(true);
                  }}
                  onDeleteMember={handleDeleteMember}
                  onStatusChange={handleMemberStatusChange}
                  onToggleShuttlecock={handleToggleShuttlecock}
                  onReorderMembers={(reordered) => {
                    setMembers(reordered);
                    saveData(reordered);
                  }}
                  onResetAllGames={() => {
                    const reset = members.map((m) => ({
                      ...m,
                      todayGamesCount: 0,
                      playedGamesCount: 0,
                    }));
                    setMembers(reset);
                    saveData(reset);
                  }}
                  onClearAllMembers={handleClearAllMembers}
                  onCreateMatchWithSelected={handleCreateMatchWithSelected}
                  partnerPairs={partnerPairs}
                  onOpenPairingModal={() => setIsPairingModalOpen(true)}
                />
              </div>

              {/* 게임 목록 (7컬럼) */}
              <div
                className={`lg:col-span-7 h-full ${
                  mobileTab === 'games' ? 'block' : 'hidden lg:block'
                }`}
              >
                <GameSection
                  games={games}
                  courts={courts}
                  members={members}
                  onAutoGenerateClick={handleAutoGenerateMatches}
                  onManualGenerateClick={() => setIsManualMatchModalOpen(true)}
                  onGameStatusChange={handleGameStatusChange}
                  onDeleteGame={handleDeleteGame}
                  onTriggerYangHeeWooMode={handleTriggerYangHeeWooMode}
                  onSwapPlayerClick={(game, member) => {
                    setSwapModalState({ isOpen: true, game, targetMember: member });
                  }}
                  onOpenAIDiagnosis={() => setIsAIDiagnosisModalOpen(true)}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 모달 컴포넌트들 */}
      <BatchMemberModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onApply={handleBatchApply}
        existingMembers={members}
      />

      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
        initialMember={editingMember}
      />

      <CourtEditModal
        isOpen={Boolean(editingCourt)}
        court={editingCourt}
        onClose={() => setEditingCourt(null)}
        onSave={(courtId, updates) => {
          const updated = courts.map((c) => (c.id === courtId ? { ...c, ...updates } : c));
          setCourts(updated);
          saveData(members, updated, games);
        }}
        onDelete={(courtId) => {
          const updated = courts.filter((c) => c.id !== courtId);
          setCourts(updated);
          saveData(members, updated, games);
        }}
      />

      {/* 꼬깔 걸기 및 순서 배정 화면 모달 */}
      <CourtConeModal
        isOpen={coneModalState.isOpen}
        court={coneModalState.court}
        games={games}
        onClose={() => setConeModalState({ isOpen: false, court: null })}
        onUpdateCourtCones={handleUpdateCourtCones}
      />

      <PairingModeModal
        isOpen={isPairingModalOpen}
        onClose={() => setIsPairingModalOpen(false)}
        members={members}
        partnerPairs={partnerPairs}
        onAddPair={(type, memberId1, memberId2) => {
          const newPair: PartnerPair = { id: `pair-${Date.now()}`, type, memberId1, memberId2 };
          const updated = [...partnerPairs, newPair];
          setPartnerPairs(updated);
          saveData(members, courts, games, updated);
        }}
        onDeletePair={(id) => {
          const updated = partnerPairs.filter((p) => p.id !== id);
          setPartnerPairs(updated);
          saveData(members, courts, games, updated);
        }}
      />

      <ManualMatchModal
        isOpen={isManualMatchModalOpen}
        onClose={() => setIsManualMatchModalOpen(false)}
        members={members.filter((m) => m.status === 'waiting' || m.status === 'playing')}
        courts={courts.filter((c) => c.isActive)}
        existingGames={games}
        onCreateMatch={handleCreateManualMatch}
      />

      <CreateSessionModal
        isOpen={isCreateSessionModalOpen}
        todayDate={sessionDate}
        availableDates={sessions.map((s) => s.date)}
        onClose={() => setIsCreateSessionModalOpen(false)}
        onCreate={handleCreateSession}
      />

      <SessionManageModal
        isOpen={isSessionManageModalOpen}
        onClose={() => setIsSessionManageModalOpen(false)}
        sessions={sessions}
        currentSessionId=""
        onSelectSession={(id) => {
          const s = sessions.find((x) => x.id === id);
          if (s) {
            setSessionDate(s.date);
            if (s.startTime) setSessionStartTime(s.startTime);
            setCourts((s.courts || []).map((c: any) => ({ ...c, cones: c.cones || [] })));
            setMembers(s.members || []);
            setGames(s.games || []);
          }
        }}
        onOpenCreateSession={() => setIsCreateSessionModalOpen(true)}
      />

      <MemberRegistryModal
        isOpen={isRegistryModalOpen}
        onClose={() => setIsRegistryModalOpen(false)}
        registryMembers={registryMembers}
        onAddRegistryMember={(newM) => {
          saveRegistry([...registryMembers, { ...newM, id: `reg-${Date.now()}` }]);
        }}
        onUpdateRegistryMember={(id, updates) => {
          saveRegistry(registryMembers.map((m) => (m.id === id ? { ...m, ...updates } : m)));
        }}
        onDeleteRegistryMember={(id) => {
          saveRegistry(registryMembers.filter((m) => m.id !== id));
        }}
        onImportToSession={handleImportFromRegistry}
      />

      <PlayerSwapModal
        isOpen={swapModalState.isOpen}
        onClose={() => setSwapModalState({ isOpen: false, game: null, targetMember: null })}
        game={swapModalState.game}
        targetMember={swapModalState.targetMember}
        waitingMembers={members.filter((m) => m.status === 'waiting')}
        onSwapWithOpponent={handleSwapWithOpponent}
        onReplaceWithWaiting={handleReplaceWithWaiting}
      />

      <CourtAdvanceModal
        isOpen={courtAdvanceState.isOpen}
        onClose={() => setCourtAdvanceState({ isOpen: false, court: null, current: null, next: null })}
        court={courtAdvanceState.court}
        currentGame={courtAdvanceState.current}
        nextGame={courtAdvanceState.next}
        onAdvance={handleAdvanceCourt}
      />

      <AIDiagnosisModal
        isOpen={isAIDiagnosisModalOpen}
        onClose={() => setIsAIDiagnosisModalOpen(false)}
        games={games}
        members={members}
        courts={courts}
      />

      <AdminPasswordModal
        isOpen={isAdminPasswordModalOpen}
        onClose={() => setIsAdminPasswordModalOpen(false)}
        correctCode={adminCode}
        onSuccess={() => setMode('admin')}
      />

      <ManualModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        mode={mode}
      />

      {confirmDialog && <ConfirmDialog {...confirmDialog} />}
    </div>
  );
}
