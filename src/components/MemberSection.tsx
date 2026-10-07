import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Member, MemberStatus, Rank, Game, Court, PartnerPair } from '../types';
import { calculateMemberWaitingGames } from '../utils/courtAvailability';
import {
  Users,
  UserPlus,
  GripVertical,
  Check,
  X,
  Edit2,
  Trash2,
  Filter,
  Sparkles,
  ClipboardList,
  RotateCcw,
  Clock,
  HeartHandshake,
  HelpCircle,
} from 'lucide-react';

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTE_OPTIONS = ['00', '10', '20', '30', '40', '50'];

interface MemberSectionProps {
  members: Member[];
  games?: Game[];
  courts?: Court[];
  sessionStartTime?: string;
  onAddMemberClick: () => void;
  onOpenBatchModal: () => void;
  onOpenRegistry?: () => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onStatusChange: (id: string, newStatus: MemberStatus) => void;
  onSetMemberLessonTime?: (memberId: string, lessonStartTime: string, targetStatus?: MemberStatus) => void;
  onToggleShuttlecock: (id: string) => void;
  onSubmitShuttlecockWithCone?: (id: string, coneNumber: string) => void;
  onReorderMembers: (reordered: Member[]) => void;
  onResetAllGames: () => void;
  onClearAllMembers: () => void;
  onCreateMatchWithSelected?: (selectedMembers: Member[], mode: 'manual' | 'auto') => void;
  partnerPairs?: PartnerPair[];
  onOpenPairingModal?: () => void;
}

export const MemberSection: React.FC<MemberSectionProps> = ({
  members,
  games = [],
  courts = [],
  sessionStartTime,
  onAddMemberClick,
  onOpenBatchModal,
  onOpenRegistry,
  onEditMember,
  onDeleteMember,
  onStatusChange,
  onSetMemberLessonTime,
  onToggleShuttlecock,
  onSubmitShuttlecockWithCone,
  onReorderMembers,
  onResetAllGames,
  onClearAllMembers,
  onCreateMatchWithSelected,
  partnerPairs = [],
  onOpenPairingModal,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<'all' | 'M' | 'F'>('all');
  const [filterUnassignedOnly, setFilterUnassignedOnly] = useState<boolean>(false);
  const [sortGames, setSortGames] = useState<'none' | 'asc' | 'desc'>('none');
  const [draggedMemberId, setDraggedMemberId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  // 특정 1~4명 선택 상태 (선택 순서 보존을 위해 string[] 배열)
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // 꼬깔 번호 입력 팝업 상태
  const [coneModalTarget, setConeModalTarget] = useState<Member | null>(null);
  const [coneInput, setConeInput] = useState('');
  const coneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (coneModalTarget) {
      const timer = setTimeout(() => {
        coneInputRef.current?.focus();
        coneInputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [coneModalTarget]);

  const handleOpenConeModal = (member: Member) => {
    setConeModalTarget(member);
    setConeInput(member.coneNumber || '');
  };

  const handleConfirmConeModal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!coneModalTarget) return;

    if (onSubmitShuttlecockWithCone) {
      onSubmitShuttlecockWithCone(coneModalTarget.id, coneInput);
    } else {
      onToggleShuttlecock(coneModalTarget.id);
    }
    setConeModalTarget(null);
    setConeInput('');
  };

  const handleCloseConeModal = () => {
    setConeModalTarget(null);
    setConeInput('');
  };

  // 레슨 시작 시간 입력 팝업 상태
  const [lessonModalTarget, setLessonModalTarget] = useState<Member | null>(null);
  const [lessonHour, setLessonHour] = useState<string>('19');
  const [lessonMinute, setLessonMinute] = useState<string>('00');

  // 1번 요구사항: 예정 시간 입력 칸의 기본 시작 시간은 해당일자 운동 시작 시간으로 하고,
  // 해당 시간이 지난 이후에는 조회시점 이후(10분단위) 시간을 기본값으로 함.
  const calculateDefaultLessonTime = (startTimeStr?: string): { hh: string; mm: string } => {
    const now = new Date();
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    const currentTotalMins = currentH * 60 + currentM;

    let baseH = 19;
    let baseM = 0;
    if (startTimeStr && startTimeStr.includes(':')) {
      const [sh, sm] = startTimeStr.split(':').map(Number);
      if (!isNaN(sh) && !isNaN(sm)) {
        baseH = sh;
        baseM = sm;
      }
    }
    const baseTotalMins = baseH * 60 + baseM;

    if (currentTotalMins > baseTotalMins) {
      // 조회 시점 이후(10분 단위 올림) 시간
      const roundedMins = Math.ceil((currentM + 1) / 10) * 10;
      let nextH = currentH;
      let nextM = roundedMins;
      if (nextM >= 60) {
        nextH = (nextH + 1) % 24;
        nextM = 0;
      }
      return {
        hh: String(nextH).padStart(2, '0'),
        mm: String(nextM).padStart(2, '0'),
      };
    } else {
      // 해당 시간이 지나지 않은 경우 운동 시작 시간을 기본값으로 함
      const roundedBaseM = Math.floor(baseM / 10) * 10;
      return {
        hh: String(baseH).padStart(2, '0'),
        mm: String(roundedBaseM).padStart(2, '0'),
      };
    }
  };

  const handleOpenLessonModal = (member: Member) => {
    setLessonModalTarget(member);
    if (member.lessonStartTime && member.lessonStartTime.includes(':')) {
      const [h, m] = member.lessonStartTime.split(':');
      setLessonHour(h.padStart(2, '0'));
      const minNum = Number(m);
      const roundedM = isNaN(minNum) ? '00' : String(Math.floor(minNum / 10) * 10).padStart(2, '0');
      setLessonMinute(roundedM);
    } else {
      const def = calculateDefaultLessonTime(sessionStartTime);
      setLessonHour(def.hh);
      setLessonMinute(def.mm);
    }
  };

  const handleCloseLessonModal = () => {
    setLessonModalTarget(null);
  };

  // '지금' 버튼 클릭: 현재 대기에서 레슨으로 변경하여 레슨 시간이 입력되는 현재 적용되어 있는 것과 동일하게 함
  const handleLessonNow = () => {
    if (!lessonModalTarget) return;
    const now = new Date();
    const nowTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (onSetMemberLessonTime) {
      onSetMemberLessonTime(lessonModalTarget.id, nowTimeStr, 'lesson');
    } else {
      onStatusChange(lessonModalTarget.id, 'lesson');
    }
    setLessonModalTarget(null);
  };

  // '확인' 버튼 클릭: 회원 상세/정보 수정에의 레슨 시작 시간을 입력값으로 입력하게 함
  const handleLessonConfirm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!lessonModalTarget) return;
    const selectedTime = `${lessonHour}:${lessonMinute}`;

    if (onSetMemberLessonTime) {
      onSetMemberLessonTime(lessonModalTarget.id, selectedTime);
    } else {
      onStatusChange(lessonModalTarget.id, 'lesson');
    }
    setLessonModalTarget(null);
  };

  // 조(실력) 뱃지 스타일
  const getRankBadgeStyle = (rank: Rank) => {
    switch (rank) {
      case 'S':
        return 'bg-purple-100 text-purple-900 border-purple-300 font-black';
      case 'A':
        return 'bg-red-100 text-red-900 border-red-300 font-bold';
      case 'B':
        return 'bg-orange-100 text-orange-900 border-orange-300 font-bold';
      case 'C':
        return 'bg-blue-100 text-blue-900 border-blue-300 font-bold';
      case 'D':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold';
      case 'E':
        return 'bg-teal-100 text-teal-900 border-teal-300 font-semibold';
      case 'F':
        return 'bg-slate-100 text-slate-700 border-slate-300 font-medium';
    }
  };

  // 상태 한글 라벨 및 색상 스타일 (대기 / 게임중 / 휴식 / 레슨 / 퇴장)
  const getStatusInfo = (status: MemberStatus, lessonStartTime?: string, breakStartTime?: string) => {
    switch (status) {
      case 'waiting':
      case 'attending':
        return {
          label: lessonStartTime ? `대기 (${lessonStartTime} 레슨)` : '대기',
          badgeClass: lessonStartTime
            ? 'bg-purple-50 text-purple-900 border-purple-300 font-extrabold shadow-2xs'
            : 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold shadow-2xs',
          nameClass: 'text-slate-900 font-bold',
        };
      case 'playing':
        return {
          label: '게임중',
          badgeClass: 'bg-blue-600 text-white border-blue-600 font-black shadow-xs animate-pulse',
          nameClass: 'text-blue-700 font-black',
        };
      case 'lesson':
        return {
          label: lessonStartTime ? `레슨 (${lessonStartTime})` : '레슨',
          badgeClass: 'bg-purple-100 text-purple-900 border-purple-300 font-extrabold shadow-2xs',
          nameClass: 'text-purple-700 font-extrabold',
        };
      case 'resting':
        return {
          label: breakStartTime ? `휴식 (${breakStartTime}~)` : '휴식',
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold shadow-2xs',
          nameClass: 'text-amber-700 font-extrabold',
        };
      case 'left':
      default:
        return {
          label: '퇴장',
          badgeClass: 'bg-slate-100 text-slate-400 border-slate-200 font-medium',
          nameClass: 'text-slate-400 line-through',
        };
    }
  };

  // 선호 게임 유형 라벨
  const getPrefLabel = (pref: string) => {
    switch (pref) {
      case 'mixed':
        return '혼복';
      case 'men':
        return '남복';
      case 'women':
        return '여복';
      default:
        return '무관';
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedMemberId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = () => {
    setDraggedMemberId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = draggedMemberId;
    setDraggedMemberId(null);
    if (!sourceId || sourceId === targetId) return;

    const sourceIndex = members.findIndex((m) => m.id === sourceId);
    const targetIndex = members.findIndex((m) => m.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const newMembers = [...members];
    const [movedItem] = newMembers.splice(sourceIndex, 1);
    newMembers.splice(targetIndex, 0, movedItem);

    // 순번(order) 재할당 (1부터 시작)
    const reindexed = newMembers.map((m, idx) => ({
      ...m,
      order: idx + 1,
    }));

    onReorderMembers(reindexed);
  };

  const waitingCount = members.filter((m) => m.status === 'waiting' || m.status === 'attending').length;
  const playingCount = members.filter((m) => m.status === 'playing').length;
  const restingCount = members.filter((m) => m.status === 'resting').length;
  const lessonCount = members.filter((m) => m.status === 'lesson').length;
  const leftCount = members.filter((m) => m.status === 'left').length;
  const attendingCount = waitingCount + playingCount;
  const submittedShuttlecockCount = members.filter((m) => m.submittedShuttlecock).length;

  // 미배정 인원: 진행/배정이 0/0, 1/1, 2/2, ..., n/n인 사람 (즉, 다음 예정 게임이 없는 인원)
  const isUnassignedMember = (m: Member) => m.completedGames === m.totalGames;
  const unassignedCount = members.filter(
    (m) => m.status !== 'left' && isUnassignedMember(m)
  ).length;

  // 각 회원의 현재 대기 중 게임 수 맵 (미배정 인원 필터 3단계 우선순위 정렬 및 렌더링 최적화)
  const waitingGamesMap = useMemo(() => {
    const map = new Map<string, number>();
    members.forEach((m) => {
      const waitInfo = calculateMemberWaitingGames(m, games, courts);
      map.set(m.id, waitInfo.waitingGamesCount);
    });
    return map;
  }, [members, games, courts]);

  const isFilterActive =
    filterUnassignedOnly || filterStatus !== 'all' || filterGender !== 'all';

  const filteredMembers = members
    .filter((m) => {
      if (filterStatus !== 'all') {
        if (filterStatus === 'waiting') {
          if (m.status !== 'waiting' && m.status !== 'attending') return false;
        } else if (m.status !== filterStatus) {
          return false;
        }
      }
      if (filterGender !== 'all' && m.gender !== filterGender) return false;
      // 미배정 인원 필터: 진행/배정이 0/0, 1/1, ..., n/n으로 다음 예정 게임이 없는 사람만 표시
      if (filterUnassignedOnly) {
        if (!isUnassignedMember(m)) return false;
        if (filterStatus === 'all' && m.status === 'left') return false;
      }
      return true;
    })
    .sort((a, b) => {
      // [요청 반영] 미배정 인원 보기 필터 적용 시 3단계 우선순위 정렬
      // 1. 대기 중 게임 수가 많은 회원 (내림차순)
      // 2. 분모의 게임 수가 적은 회원 (totalGames 오름차순)
      // 3. 참가 순서(순번)가 앞인 회원 (order 오름차순)
      if (filterUnassignedOnly) {
        const waitA = waitingGamesMap.get(a.id) ?? 0;
        const waitB = waitingGamesMap.get(b.id) ?? 0;
        if (Math.abs(waitB - waitA) > 0.001) {
          return waitB - waitA; // 1. 대기 중 게임 수 많은 순
        }
        if (a.totalGames !== b.totalGames) {
          return a.totalGames - b.totalGames; // 2. 분모(배정) 게임 수 적은 순
        }
        return a.order - b.order; // 3. 참가 순서(순번) 앞선 순
      }

      if (sortGames === 'asc') {
        if (a.totalGames !== b.totalGames) return a.totalGames - b.totalGames;
        return a.order - b.order;
      }
      if (sortGames === 'desc') {
        if (a.totalGames !== b.totalGames) return b.totalGames - a.totalGames;
        return a.order - b.order;
      }
      return a.order - b.order;
    });

  const handleToggleSelectMember = (id: string) => {
    setSelectedMemberIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 4) {
        // 이미 4명이 선택되어 있으면 추가 불가
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleClearSelected = () => {
    setSelectedMemberIds([]);
  };

  const handleCreateSelectedMatch = (mode: 'manual' | 'auto') => {
    if (!onCreateMatchWithSelected || selectedMemberIds.length === 0) return;
    const selectedList = selectedMemberIds
      .map((id) => members.find((m) => m.id === id))
      .filter(Boolean) as Member[];
    onCreateMatchWithSelected(selectedList, mode);
    setSelectedMemberIds([]);
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col h-full">
      {/* 헤더 바 */}
      <div className="pb-3 border-b border-slate-100 space-y-2.5">
        {/* 1단: 좌측 [참여명단 + 도움말(?) 버튼] & 우측 [대기, 게임중, 전체인원 현황] (충돌 및 줄바꿈 완전 방지) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <Users className="w-4 h-4 text-emerald-600 shrink-0" />
            <h2 className="text-base font-bold text-slate-900 whitespace-nowrap">참여명단</h2>
            <button
              type="button"
              onClick={() => setShowHelp((prev) => !prev)}
              className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                showHelp
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-200'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
              }`}
              title="도움말 보기 (클릭)"
              aria-label="참여명단 안내 도움말 토글"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold whitespace-nowrap shrink-0">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60">
              대기 <strong className="font-extrabold text-emerald-900">{waitingCount}</strong>
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200/60">
              게임중 <strong className="font-extrabold text-blue-900">{playingCount}</strong>
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/60">
              전체인원 <strong className="font-extrabold text-slate-900">{members.length}명</strong>
            </span>
          </div>
        </div>

        {/* 2단: 조작 버튼 그룹 ("통합명부" / "일괄등록" / "파트너" / "명단 초기화" / "회원 추가") */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {onOpenRegistry && (
            <button
              type="button"
              onClick={onOpenRegistry}
              className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors cursor-pointer"
              title="누적 출석 및 전체 클럽 회원 명부를 확인하고 오늘 운동에 바로 불러옵니다"
            >
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span>통합명부</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenBatchModal}
            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
            title="카카오톡 명단 등을 복사하여 오늘의 참여 명단을 한 번에 일괄 등록합니다"
          >
            <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
            <span>일괄등록</span>
          </button>
          {onOpenPairingModal && (
            <button
              type="button"
              id="pairing-mode-btn"
              onClick={onOpenPairingModal}
              className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 active:scale-95 transition-all shadow-2xs cursor-pointer"
              title="대회 준비 파트너 모드 및 같은 경기 절대 배제 결별 모드 설정"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-indigo-600" />
              <span>파트너</span>
              {partnerPairs.length > 0 && (
                <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.2 rounded-full font-black shadow-2xs">
                  {partnerPairs.length}
                </span>
              )}
            </button>
          )}
          {members.length > 0 && (
            <button
              type="button"
              onClick={onClearAllMembers}
              className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
              title="새로운 모임 날을 위해 현재 등록된 회원 명단을 모두 비웁니다"
            >
              <RotateCcw className="w-3 h-3 text-rose-600" />
              <span>명단 초기화</span>
            </button>
          )}
          <button
            type="button"
            id="add-member-btn"
            onClick={onAddMemberClick}
            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>회원 추가</span>
          </button>
        </div>

        {/* 물음표(?) 버튼을 눌렀을 때만 노출되는 도움말 패널 */}
        {showHelp && (
          <div className="p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-[11.5px] text-slate-600 leading-relaxed shadow-2xs animate-in fade-in duration-150 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold shrink-0">💡</span>
              <span>순번 드래그로 우선순위 변경 가능 · 화면이 좁은 기기에서는 [수정(✏️)] 버튼으로 콕/상태/꼬깔 상세를 확인 및 변경할 수 있습니다.</span>
            </div>
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5 rounded cursor-pointer shrink-0"
              aria-label="도움말 닫기"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* 상태 요약 바 & 필터 영역 (필터 적용 시 다른 사람도 즉시 인지하고 풀 수 있도록 눈에 띄게 강조) */}
      <div
        className={`transition-all rounded-xl ${
          isFilterActive
            ? 'bg-amber-50/95 border-2 border-amber-400 p-2.5 shadow-sm ring-2 ring-amber-300/50 my-1.5'
            : 'border-b border-slate-100 py-2'
        }`}
      >
        {/* 필터 활성화 경고/안내 배너 (부재 시 다른 사람이 봐도 즉시 알아보고 해제할 수 있도록 제공) */}
        {isFilterActive && (
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 mb-2 bg-amber-500 text-white rounded-lg text-xs font-black shadow-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-base shrink-0 leading-none">⚠️</span>
              <span className="truncate">
                {filterUnassignedOnly
                  ? `[미배정 인원] 대기 많은 순 ➔ 배정 적은 순 ➔ 순번 순 (${filteredMembers.length}명 / 전체 ${members.length}명)`
                  : `[필터 적용 중] 일부 회원만 표시 중 (${filteredMembers.length}명 / 전체 ${members.length}명)`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setFilterUnassignedOnly(false);
                setFilterStatus('all');
                setFilterGender('all');
              }}
              className="px-2.5 py-1 bg-white text-amber-950 rounded-md font-black text-[11px] hover:bg-amber-100 active:scale-95 transition-all shrink-0 cursor-pointer shadow-2xs border border-amber-200"
              title="모든 필터를 해제하여 전체 회원 명단을 표시합니다"
            >
              필터 해제 (전체 보기) ✕
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2 text-[11px] flex-wrap">
            <span className="font-semibold text-slate-800">콕 제출:</span>
            <span className="text-emerald-700 font-bold">
              {submittedShuttlecockCount}/{members.length}명
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-[10px] text-slate-500">
              진행/배정 게임수
            </span>
            {isFilterActive && (
              <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100/90 px-1.5 py-0.2 rounded border border-amber-300">
                현재 {filteredMembers.length}명 표시 중
              </span>
            )}
          </div>

          {/* 필터 및 정렬 컨트롤러 */}
          <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
            {/* 미배정 인원 보기 체크박스 (다음 예정 게임이 없는 사람: 0/0, 1/1, 2/2 등) */}
            <label
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black cursor-pointer transition-all border shadow-2xs select-none ${
                filterUnassignedOnly
                  ? 'bg-amber-600 text-white border-amber-700 ring-2 ring-amber-300'
                  : 'bg-white text-slate-800 border-slate-300 hover:border-amber-400 hover:bg-amber-50/50'
              }`}
              title="진행/배정이 0/0, 1/1, 2/2, n/n 등 다음 예정 게임이 없는 인원만 필터링합니다."
            >
              <input
                type="checkbox"
                checked={filterUnassignedOnly}
                onChange={(e) => setFilterUnassignedOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600"
              />
              <span>미배정 인원 보기</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  filterUnassignedOnly
                    ? 'bg-amber-100 text-amber-950'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {unassignedCount}명
              </span>
            </label>

            <div className="flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400 shrink-0" />
              {/* 상태 필터 */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-slate-300 rounded px-1.5 py-1 text-xs text-slate-800 focus:outline-emerald-500 font-medium"
                title="상태 필터"
              >
                <option value="all">전체 상태 ({members.length})</option>
                <option value="waiting">대기 ({waitingCount})</option>
                <option value="playing">게임중 ({playingCount})</option>
                <option value="resting">휴식 ({restingCount})</option>
                <option value="lesson">레슨 ({lessonCount})</option>
                <option value="left">퇴장 ({leftCount})</option>
              </select>
            </div>

            {/* 성별 필터 */}
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value as 'all' | 'M' | 'F')}
              className="bg-white border border-slate-300 rounded px-1.5 py-1 text-xs text-slate-800 focus:outline-emerald-500 font-medium"
              title="성별 필터"
            >
              <option value="all">전체 성별</option>
              <option value="M">남성 ♂ ({members.filter(m => m.gender === 'M').length})</option>
              <option value="F">여성 ♀ ({members.filter(m => m.gender === 'F').length})</option>
            </select>

            {/* 게임 수 오름차순/내림차순 정렬 */}
            <select
              value={filterUnassignedOnly ? 'unassigned' : sortGames}
              onChange={(e) => setSortGames(e.target.value as 'none' | 'asc' | 'desc')}
              disabled={filterUnassignedOnly}
              className={`rounded px-1.5 py-1 text-xs focus:outline-emerald-500 font-medium border ${
                filterUnassignedOnly
                  ? 'bg-amber-100 text-amber-950 border-amber-300 font-bold cursor-not-allowed'
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
              title={
                filterUnassignedOnly
                  ? '미배정 필터 3단계 우선순위 정렬 (대기수 많은 순 ➔ 배정 적은 순 ➔ 순번 순)'
                  : '게임 수 정렬'
              }
            >
              {filterUnassignedOnly ? (
                <option value="unassigned">미배정 우선 정렬 (대기수↓ 배정수↑ 순번↑)</option>
              ) : (
                <>
                  <option value="none">기본 순서 (드래그)</option>
                  <option value="asc">게임수 적은순 ↑ (오름차순)</option>
                  <option value="desc">게임수 많은순 ↓ (내림차순)</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* 5번 요구사항: 1~4명 선택 시 나타나는 상단 빠른 매칭 액션 바 */}
      {selectedMemberIds.length > 0 && (
        <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-2 animate-in fade-in duration-100">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-md text-[11px] font-black">
              {selectedMemberIds.length}/4명 선택됨
            </span>
            <span className="text-[11px] text-emerald-900 font-semibold truncate max-w-[170px] sm:max-w-none">
              {selectedMemberIds
                .map((id, idx) => {
                  const m = members.find((item) => item.id === id);
                  return `${idx + 1}.${m?.name || ''}`;
                })
                .join(', ')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleCreateSelectedMatch('manual')}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-extrabold rounded-lg border border-slate-300 shadow-2xs transition-colors"
              title="선택 순서대로 1,2번 vs 3,4번으로 경기를 수동 편성합니다 (4명 미만 시 우선순위 인원 자동 충원)"
            >
              수동 생성 {selectedMemberIds.length === 4 ? '(12 vs 34)' : `(+${4 - selectedMemberIds.length}명 충원)`}
            </button>
            <button
              type="button"
              onClick={() => handleCreateSelectedMatch('auto')}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold rounded-lg shadow-2xs transition-colors"
              title="선택된 인원을 포함하여 우선순위 인원 충원 및 최적의 실력 밸런스로 자동 매칭합니다"
            >
              자동 밸런스 매칭
            </button>
            <button
              type="button"
              onClick={handleClearSelected}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              title="선택 취소"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 회원 테이블 / 리스트 (드래그 앤 드롭 지원) */}
      <div className="mt-2 flex-1 overflow-y-auto max-h-[600px] divide-y divide-slate-100 pr-1">
        {filteredMembers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            {isFilterActive ? (
              <div className="space-y-2.5 max-w-xs mx-auto">
                <div className="text-2xl">🔍</div>
                <p className="text-slate-700 font-bold text-xs whitespace-pre-line">
                  {filterUnassignedOnly
                    ? '현재 다음 예정 게임이 없는(미배정) 회원이 없습니다.\n(모든 회원이 다음 경기에 배정되어 있습니다)'
                    : '조건에 일치하는 회원이 없습니다.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFilterUnassignedOnly(false);
                    setFilterStatus('all');
                    setFilterGender('all');
                  }}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  필터 해제하고 전체 회원 보기
                </button>
              </div>
            ) : (
              '등록된 회원이 없습니다. 상단의 [회원 추가] 또는 [일괄 등록] 버튼을 눌러주세요.'
            )}
          </div>
        ) : (
          filteredMembers.map((member) => {
            const statusInfo = getStatusInfo(member.status, member.lessonStartTime, member.breakStartTime);
            const isAttending = member.status === 'attending';
            const selectIndex = selectedMemberIds.indexOf(member.id);
            const isSelected = selectIndex !== -1;

            return (
              <div
                key={member.id}
                draggable
                onDragStart={(e) => handleDragStart(e, member.id)}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, member.id)}
                className={`py-2 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 hover:bg-slate-50/80 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-300 shadow-2xs'
                    : 'border-slate-100 hover:border-slate-200'
                } ${draggedMemberId === member.id ? 'ring-2 ring-emerald-400 bg-white shadow-xs' : ''} ${
                  member.status === 'left' ? 'opacity-50' : ''
                }`}
              >
                {/* 상단/좌측: 선택 체크박스 + 순번 + 이름(색상적용) + 급수(조) + 성별 + 꼬깔번호(모바일도 항상 노출) */}
                <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap sm:flex-nowrap">
                  {/* 선택 체크박스 */}
                  <div className="shrink-0 flex items-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelectMember(member.id);
                      }}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center text-[10px] font-black transition-all ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                          : selectedMemberIds.length >= 4
                          ? 'border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed'
                          : 'border-slate-300 bg-white hover:border-emerald-500 text-transparent'
                      }`}
                      title={
                        isSelected
                          ? `선택 ${selectIndex + 1}번 (클릭 시 해제)`
                          : selectedMemberIds.length >= 4
                          ? '최대 4명까지만 선택 가능합니다'
                          : '클릭하여 매칭 팀으로 선택'
                      }
                    >
                      {isSelected ? selectIndex + 1 : '✓'}
                    </button>
                  </div>

                  {/* 드래그 핸들 + 순번 (남성: 파란색 박스, 여성: 분홍색 박스) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <GripVertical className="w-3.5 h-3.5 text-slate-300 hover:text-slate-500 cursor-grab" />
                    <span
                      className={`min-w-[22px] px-1 py-0.5 rounded-md text-xs font-black text-center border shadow-2xs ${
                        member.gender === 'M'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-pink-50 text-pink-700 border-pink-200'
                      }`}
                      title={`${member.order}번 (${member.gender === 'M' ? '남성' : '여성'})`}
                    >
                      {member.order}
                    </span>
                  </div>

                  {/* 2번 요구사항: 레슨은 초록색, 휴식은 노랑색으로 이름 색상 변경 */}
                  <span
                    className={`text-sm truncate shrink-0 max-w-[100px] sm:max-w-none transition-colors ${statusInfo.nameClass}`}
                    title={member.name}
                  >
                    {member.name}
                  </span>

                  {/* 3. 급수 (조) - 기존 명부에 급수 없는 신규 회원은 반짝이는 효과 */}
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded border shrink-0 transition-all flex items-center gap-0.5 ${
                      member.needsRankCheck
                        ? 'bg-amber-300 text-amber-950 border-amber-500 ring-2 ring-amber-400 shadow-md animate-pulse'
                        : getRankBadgeStyle(member.rank)
                    }`}
                    title={
                      member.needsRankCheck
                        ? `✨ [급수 미확인] 기존 회원 명부에 급수 정보가 없습니다. 운영진 확인이 필요합니다 (현재: ${member.rank}조)`
                        : `급수: ${member.rank}조`
                    }
                  >
                    {member.needsRankCheck && <Sparkles className="w-2.5 h-2.5 text-amber-800 animate-spin" />}
                    <span>{member.rank}조</span>
                    {member.needsRankCheck && (
                      <span className="text-[9px] bg-amber-600 text-white px-1 py-0.2 rounded-xs font-black">
                        확인
                      </span>
                    )}
                  </span>

                  {/* 파트너 모드: 설정된 경우 파트너 이름을 작게 표시 */}
                  {(() => {
                    if (!partnerPairs || partnerPairs.length === 0) return null;
                    const pair = partnerPairs.find(
                      (p) => p.memberId1 === member.id || p.memberId2 === member.id
                    );
                    if (!pair) return null;
                    const partnerId = pair.memberId1 === member.id ? pair.memberId2 : pair.memberId1;
                    const partner = members.find((m) => m.id === partnerId);
                    if (!partner) return null;
                    return (
                      <span
                        className="inline-flex items-center gap-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50/90 border border-indigo-200 px-1.5 py-0.2 rounded shrink-0 shadow-2xs"
                        title={`대회 준비 파트너: ${partner.name}님과 같은 팀으로 매칭됩니다`}
                      >
                        <HeartHandshake className="w-2.5 h-2.5 text-indigo-500" />
                        <span>파트너: {partner.name}</span>
                      </span>
                    );
                  })()}

                  {/* 2번 요구사항: 꼬깔 번호 - 모바일처럼 좁은 화면에서도 항상 보이도록 표시 & 클릭 시 수정 팝업 오픈 */}
                  {member.coneNumber && (
                    <button
                      type="button"
                      onClick={() => handleOpenConeModal(member)}
                      className="inline-flex items-center text-[10px] text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded font-bold shrink-0 shadow-2xs transition-colors cursor-pointer"
                      title={`꼬깔번호: #${member.coneNumber} (클릭하여 수정)`}
                    >
                      #{member.coneNumber}
                    </button>
                  )}
                </div>

                {/* 하단/우측: 현재상태(모바일도 항상 노출) + 콕 미제출 경고(미제출만 노출) + 게임수 + 수정/삭제 */}
                <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 shrink-0 border-t sm:border-t-0 pt-1 sm:pt-0 border-slate-100/80">
                  {/* 2번 요구사항: 모바일에서도 현재 상태 항상 노출 & 레슨 초록/휴식 노랑 색상 적용 */}
                  <div className="flex items-center gap-1 shrink-0">
                    <select
                      value={member.status === 'attending' ? 'waiting' : member.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as MemberStatus;
                        if (newStatus === 'lesson') {
                          handleOpenLessonModal(member);
                        } else {
                          onStatusChange(member.id, newStatus);
                        }
                      }}
                      className={`text-[11px] font-extrabold rounded-lg px-2 py-0.5 border cursor-pointer focus:outline-none transition-colors ${statusInfo.badgeClass}`}
                      title="회원 상태 변경"
                    >
                      <option value="waiting">대기</option>
                      <option value="playing">게임중</option>
                      <option value="resting">
                        휴식 {member.breakStartTime ? `(${member.breakStartTime}~)` : ''}
                      </option>
                      <option value="lesson">
                        레슨 {member.lessonStartTime ? `(${member.lessonStartTime})` : ''}
                      </option>
                      <option value="left">퇴장</option>
                    </select>

                    {/* 1번 요구사항: 레슨 시간이 설정되어 있는 경우 시간 배지 클릭 시 팝업 오픈 */}
                    {member.lessonStartTime && (
                      <button
                        type="button"
                        onClick={() => handleOpenLessonModal(member)}
                        className="inline-flex items-center gap-0.5 text-[10px] text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-300 px-1.5 py-0.5 rounded-md font-extrabold shrink-0 shadow-2xs transition-colors cursor-pointer"
                        title={`레슨 시간: ${member.lessonStartTime} (클릭하여 레슨 시간 변경)`}
                      >
                        <Clock className="w-2.5 h-2.5 text-purple-600" />
                        <span>{member.lessonStartTime}</span>
                      </button>
                    )}
                  </div>

                  {/* 2번 요구사항: 콕 제출 여부 - 미제출 버튼 클릭 시 꼬깔 번호 입력 및 대기 자동 전환 팝업 오픈 */}
                  {!member.submittedShuttlecock && (
                    <div className="flex items-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenConeModal(member)}
                        className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 flex items-center gap-0.5 transition-colors shrink-0 shadow-2xs animate-pulse cursor-pointer"
                        title="셔틀콕 미제출 상태입니다. 클릭 시 꼬깔 번호를 입력하고 참석(대기)으로 자동 전환합니다."
                      >
                        ⚠️ 콕 미제출
                      </button>
                    </div>
                  )}

                  {/* 2. 진행/배정 게임수 및 대기 게임수 */}
                  <div className="text-right shrink-0 px-1 flex flex-col items-end">
                    <div className="text-xs font-bold text-slate-800">
                      <span className="text-emerald-600 font-extrabold">{member.completedGames}</span>
                      <span className="text-slate-300 mx-0.5">/</span>
                      <span className="text-slate-900">{member.totalGames}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 block -mt-0.5 font-medium">
                      진행/배정
                    </span>
                    {games && games.length > 0 && (member.status === 'waiting' || member.status === 'playing' || member.status === 'attending') && (
                      <span
                        className={`text-[9px] font-bold px-1 py-0.2 rounded border mt-0.5 ${
                          member.status === 'playing'
                            ? 'text-blue-700 bg-blue-50 border-blue-200'
                            : 'text-amber-700 bg-amber-50 border-amber-200'
                        }`}
                        title="게임 진행 현황 및 대기 게임 수"
                      >
                        {calculateMemberWaitingGames(member, games, courts).formatted}
                      </span>
                    )}
                  </div>

                  {/* 수정 / 삭제 액션 */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onEditMember(member)}
                      className={`p-1.5 rounded-lg transition-all relative ${
                        member.needsRankCheck
                          ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-400/80 shadow-md animate-bounce hover:bg-amber-500 font-bold'
                          : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md'
                      }`}
                      title={
                        member.needsRankCheck
                          ? '✨ 급수 확인 필요 (클릭 시 상세 수정창이 열리며 반짝임이 해제됩니다)'
                          : '회원 상세 정보 확인 및 수정 (레슨/휴식 시간, 콕, 꼬깔번호 등)'
                      }
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      {member.needsRankCheck && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteMember(member.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="회원 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 하단 리셋 안내 바 */}
      {members.length > 0 && (
        <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <span>새 모임 일자 시작 시 명단 및 게임수를 초기화할 수 있습니다.</span>
          <div className="flex items-center gap-3">
            {members.some((m) => m.totalGames > 0) && (
              <button
                onClick={onResetAllGames}
                className="text-[11px] text-amber-700 hover:underline font-semibold"
              >
                게임수 전체 초기화
              </button>
            )}
            <button
              onClick={onClearAllMembers}
              className="text-[11px] text-rose-600 hover:underline font-semibold"
            >
              참여 명단 초기화
            </button>
          </div>
        </div>
      )}

      {/* 꼬깔 번호 입력 & 참석(대기) 전환 팝업 모달 */}
      {coneModalTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={handleCloseConeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xs w-full overflow-hidden p-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleConfirmConeModal} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto text-lg shadow-2xs">
                  🪅
                </div>
                <h3 className="text-base font-black text-slate-900 tracking-tight pt-1">
                  꼬깔 번호를 입력하세요
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  <strong className="text-slate-800 font-bold">{coneModalTarget.name}</strong> 회원 ({coneModalTarget.rank}조, {coneModalTarget.gender === 'M' ? '남' : '여'})
                </p>
                <div className="pt-0.5">
                  <span className="inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ 콕 제출 완료 및 대기 상태로 자동 전환
                  </span>
                </div>
              </div>

              {/* 하단 숫자 입력 칸 (1~3자리) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 text-center">
                  제출 꼬깔 번호 (1~3자리 숫자)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg select-none">
                    #
                  </span>
                  <input
                    ref={coneInputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={3}
                    value={coneInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
                      setConeInput(val);
                    }}
                    placeholder="예: 7"
                    className="w-full pl-8 pr-3 py-2.5 text-center text-2xl font-black tracking-widest text-slate-900 border-2 border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all placeholder:text-slate-300 placeholder:text-base placeholder:tracking-normal placeholder:font-normal"
                    autoFocus
                  />
                </div>
                <p className="text-[10px] text-slate-400 text-center mt-1">
                  (꼬깔 번호가 없으면 공란으로 확인 가능)
                </p>
              </div>

              {/* 확인 및 취소 버튼 */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCloseConeModal}
                  className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  확인
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1번 요구사항: 레슨 시작 시간 입력 팝업 모달 */}
      {lessonModalTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={handleCloseLessonModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden p-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleLessonConfirm} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center mx-auto text-lg shadow-2xs">
                  🏸
                </div>
                <h3 className="text-base font-black text-slate-900 tracking-tight pt-1">
                  레슨 시작 시간 입력
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  <strong className="text-slate-900 font-extrabold">{lessonModalTarget.name}</strong> 회원 ({lessonModalTarget.rank}조, {lessonModalTarget.gender === 'M' ? '남' : '여'})
                </p>
                <div className="pt-0.5">
                  <span className="inline-block text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                    💡 레슨 시간 20분 전후로 게임 배정이 자동 조율됩니다
                  </span>
                </div>
              </div>

              {/* 예정 시간 입력칸 (hh / mm 10분 단위 드롭다운 형식) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <label className="block text-[11px] font-extrabold text-slate-700 text-center">
                  레슨 예정 시간 (시 / 분 10분 단위)
                </label>
                <div className="flex items-center justify-center gap-2">
                  <div className="flex items-center gap-1">
                    <select
                      value={lessonHour}
                      onChange={(e) => setLessonHour(e.target.value)}
                      className="px-3 py-2 bg-white text-base font-black text-slate-900 border-2 border-slate-300 rounded-xl focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 shadow-2xs cursor-pointer"
                    >
                      {HOUR_OPTIONS.map((h) => (
                        <option key={h} value={h}>
                          {h}시
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="text-slate-400 font-black text-xl">:</span>
                  <div className="flex items-center gap-1">
                    <select
                      value={lessonMinute}
                      onChange={(e) => setLessonMinute(e.target.value)}
                      className="px-3 py-2 bg-white text-base font-black text-slate-900 border-2 border-slate-300 rounded-xl focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 shadow-2xs cursor-pointer"
                    >
                      {MINUTE_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {m}분
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="text-center text-xs font-bold text-purple-800 bg-purple-100/60 py-1 rounded-lg border border-purple-200/80">
                  선택 시간: {lessonHour}:{lessonMinute}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 space-y-1 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 text-left leading-relaxed">
                <div>• <strong>지금</strong>: 현재 시간으로 레슨을 즉시 시작합니다.</div>
                <div>• <strong>확인</strong>: 예정 시간 입력 시 해당 시간에 자동으로 레슨 전환되며 20분 후 대기로 복귀합니다.</div>
              </div>

              {/* 하단 버튼 3종: 취소 / 지금 / 확인 */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCloseLessonModal}
                  className="py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleLessonNow}
                  className="py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                  title="지금 즉시 레슨을 시작합니다"
                >
                  지금
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                  title="선택한 예정 시간으로 레슨 일정을 설정합니다"
                >
                  확인
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
