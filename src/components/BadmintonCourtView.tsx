import React from 'react';
import { Court, Game, GameStatus } from '../types';
import { ensureCourtCones } from '../utils/badmintonLogic';
import { TrafficConeIcon } from './TrafficConeIcon';
import { Clock, Users, PlayCircle, RotateCcw } from 'lucide-react';

interface BadmintonCourtViewProps {
  court: Court;
  game?: Game | null;
  nextGame?: Game | null;
  subsequentGame?: Game | null;
  nextAvailableTime?: string;
  onClick?: () => void;
  onStatusChange?: (gameId: string, nextStatus: GameStatus) => void;
  onEndGameAndStartNext?: (courtId: string, endGameId: string, nextGameId: string) => void;
  onEditCourt?: (court: Court) => void;
  onDeleteCourt?: (courtId: string) => void;
  canDelete?: boolean;
  readOnly?: boolean;
}

export const BadmintonCourtView: React.FC<BadmintonCourtViewProps> = ({
  court,
  game,
  nextGame,
  subsequentGame,
  nextAvailableTime,
  onClick,
  onStatusChange,
  onEndGameAndStartNext,
  onEditCourt,
  onDeleteCourt,
  canDelete = false,
  readOnly = false,
}) => {
  const conesList = ensureCourtCones(court);
  const isFrontConeOtherClub = conesList.length > 0 && conesList[conesList.length - 1] === false;
  // 코트에서 우리 게임이 진행 중이지 않고, 맨 앞 꼬깔이 타 모임 꼬깔인 경우 -> 타 모임 순서
  const isOtherClubActive = isFrontConeOtherClub && (!game || game.status !== 'playing');

  // 타 모임 꼬깔이 연속으로 몇 개 앞서 있는지 계산
  let otherConesAhead = 0;
  for (let i = conesList.length - 1; i >= 0; i--) {
    if (conesList[i] === true) break;
    otherConesAhead++;
  }

  const effectiveStatus: GameStatus | 'empty' | 'otherClub' = isOtherClubActive
    ? 'otherClub'
    : game
    ? game.status
    : 'empty';

  // 상태에 따른 코트 색상 테마
  // 입장 전: 노란색(Amber/Yellow)
  // 게임 중: 초록색(Emerald/Green)
  // 종료: 빨간색(Rose/Red)
  // 타 모임 순서: 비활성화 회색/차콜(Slate)
  // 빈 코트: 슬레이트/차분한 그린
  const themeStyles = {
    before: {
      bg: 'bg-amber-950/20 border-amber-500/60',
      courtBg: 'fill-amber-600/25',
      courtBorder: 'stroke-amber-400',
      netLine: 'stroke-amber-300',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      label: '입장 전 (대기)',
      pulse: 'bg-amber-400',
    },
    playing: {
      bg: 'bg-emerald-950/20 border-emerald-500/60',
      courtBg: 'fill-emerald-600/30',
      courtBorder: 'stroke-emerald-400',
      netLine: 'stroke-emerald-300',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      label: '게임 중',
      pulse: 'bg-emerald-400 animate-ping',
    },
    ended: {
      bg: 'bg-rose-950/20 border-rose-500/60',
      courtBg: 'fill-rose-600/25',
      courtBorder: 'stroke-rose-400',
      netLine: 'stroke-rose-300',
      badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
      label: '게임 종료',
      pulse: 'bg-rose-400',
    },
    otherClub: {
      bg: 'bg-slate-900/10 border-slate-400/60 opacity-90',
      courtBg: 'fill-slate-800/40',
      courtBorder: 'stroke-slate-500',
      netLine: 'stroke-slate-400',
      badgeBg: 'bg-slate-200 text-slate-800 border-slate-400 font-bold',
      label: `타 모임 순서 (${otherConesAhead}팀 대기)`,
      pulse: 'bg-slate-500',
    },
    empty: {
      bg: 'bg-slate-900/10 border-slate-300/80',
      courtBg: 'fill-slate-600/15',
      courtBorder: 'stroke-slate-400',
      netLine: 'stroke-slate-300',
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-300',
      label: '대기 코트 (빈 코트)',
      pulse: 'bg-slate-400',
    },
  }[effectiveStatus];

  // 점유율 계산 (우리 모임 예약 꼬깔 수 / 전체 꼬깔 수)
  const occupancyPercent =
    court.totalCones > 0
      ? Math.round((court.reservedCones / court.totalCones) * 100)
      : 0;

  // 배정된 4명 이름 추출
  const p1 = game ? game.team1[0] : null;
  const p2 = game ? game.team1[1] : null;
  const p3 = game ? game.team2[0] : null;
  const p4 = game ? game.team2[1] : null;

  return (
    <div
      id={`court-card-${court.id}`}
      className={`relative rounded-xl border p-3 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md ${themeStyles.bg}`}
    >
      {/* 코트 상단 정보 헤더 */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center font-bold text-sm bg-slate-900 text-white rounded-md px-2 py-0.5 shadow-sm">
            {court.name}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1 ${themeStyles.badgeBg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${themeStyles.pulse}`} />
            {themeStyles.label}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
          {readOnly ? (
            <span
              className="bg-white/80 px-1.5 py-0.5 rounded border border-slate-200"
              title="코트 및 꼬깔 정보"
            >
              꼬깔 {court.reservedCones}/{court.totalCones} ({occupancyPercent}%)
            </span>
          ) : (
            <span
              className="cursor-pointer hover:text-emerald-700 bg-white/80 px-1.5 py-0.5 rounded border border-slate-200"
              title="클릭하여 코트 이름 및 꼬깔 순서 편집"
              onClick={(e) => {
                e.stopPropagation();
                onEditCourt?.(court);
              }}
            >
              꼬깔 {court.reservedCones}/{court.totalCones} ({occupancyPercent}%)
            </span>
          )}
          {!readOnly && canDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCourt?.(court.id);
              }}
              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-md transition-colors"
              title="코트 삭제"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 코트 상단 꼬깔 갯수 이미지 및 우리 모임 꼬깔 이미지 가로 대기열 표시 바 */}
      <div
        onClick={(e) => {
          if (!readOnly && onEditCourt) {
            e.stopPropagation();
            onEditCourt(court);
          }
        }}
        className={`mb-2 px-2 py-1 bg-white/90 border border-slate-200/90 rounded-lg flex items-center justify-between gap-1 shadow-2xs ${
          !readOnly ? 'cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/40 transition-colors' : ''
        }`}
        title={!readOnly ? '클릭하여 꼬깔 순서 및 우리 모임 꼬깔 설정' : '코트 꼬깔 입장 순서 (우측이 1순위)'}
      >
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 shrink-0">
          <span>대기열:</span>
        </div>

        {/* 꼬깔 이미지 가로 리스트: [왼쪽(맨뒤) -> 오른쪽(맨앞 1순위)] */}
        <div className="flex items-center justify-end gap-1 overflow-x-auto py-0.5">
          {conesList.length === 0 ? (
            <span className="text-[10px] text-slate-400 font-medium py-0.5">
              대기열 없음 (0/0)
            </span>
          ) : (
            <>
              <span className="text-[9px] text-slate-400 mr-0.5 hidden xs:inline">
                (뒤)
              </span>
              {conesList.map((isClub, idx) => {
                const isFront = idx === conesList.length - 1;
                return (
                  <div
                    key={`view-cone-${court.id}-${idx}`}
                    className={`relative flex items-center shrink-0 ${
                      isFront ? 'ring-1 ring-emerald-400/80 rounded' : ''
                    }`}
                    title={
                      isClub
                        ? `${conesList.length - idx}순위: 우리 모임 꼬깔 (빨간색/보라링)`
                        : `${conesList.length - idx}순위: 타 모임 꼬깔 (회색)`
                    }
                  >
                    <TrafficConeIcon isClubCone={isClub} size={18} />
                  </div>
                );
              })}
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-1 rounded ml-0.5 shrink-0">
                앞
              </span>
            </>
          )}
        </div>
      </div>

      {/* 배드민턴 복식 코트 항공 뷰 (Top-Down Aerial SVG) */}
      <div
        className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-slate-700/30 bg-slate-950/85 p-1 shadow-inner cursor-pointer group"
        onClick={onClick}
      >
        <svg
          viewBox="0 0 400 240"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* 코트 바닥 */}
          <rect
            x="10"
            y="10"
            width="380"
            height="220"
            rx="4"
            className={themeStyles.courtBg}
          />

          {/* 외곽 복식 사이드라인 (Doubles Sidelines) */}
          <rect
            x="20"
            y="20"
            width="360"
            height="200"
            fill="none"
            className={themeStyles.courtBorder}
            strokeWidth="2.5"
          />

          {/* 단식 사이드라인 (Singles Sidelines - 15px inside top and bottom) */}
          <line
            x1="20"
            y1="38"
            x2="380"
            y2="38"
            className={themeStyles.courtBorder}
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />
          <line
            x1="20"
            y1="202"
            x2="380"
            y2="202"
            className={themeStyles.courtBorder}
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />

          {/* 복식 롱서비스 라인 (Doubles Long Service Lines - 22px inside left & right) */}
          <line
            x1="45"
            y1="20"
            x2="45"
            y2="220"
            className={themeStyles.courtBorder}
            strokeWidth="1.5"
          />
          <line
            x1="355"
            y1="20"
            x2="355"
            y2="220"
            className={themeStyles.courtBorder}
            strokeWidth="1.5"
          />

          {/* 숏서비스 라인 (Short Service Lines - left and right of center net) */}
          <line
            x1="150"
            y1="20"
            x2="150"
            y2="220"
            className={themeStyles.courtBorder}
            strokeWidth="1.5"
          />
          <line
            x1="250"
            y1="20"
            x2="250"
            y2="220"
            className={themeStyles.courtBorder}
            strokeWidth="1.5"
          />

          {/* 중앙 네트 (Center Net) */}
          <line
            x1="200"
            y1="10"
            x2="200"
            y2="230"
            className={themeStyles.netLine}
            strokeWidth="3.5"
          />
          {/* 네트 메쉬 장식선 */}
          <line
            x1="200"
            y1="15"
            x2="200"
            y2="225"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeDasharray="2 3"
          />

          {/* 센터 서비스 라인 (Center Lines: from short service line to back line) */}
          <line
            x1="20"
            y1="120"
            x2="150"
            y2="120"
            className={themeStyles.courtBorder}
            strokeWidth="1.5"
          />
          <line
            x1="250"
            y1="120"
            x2="380"
            y2="120"
            className={themeStyles.courtBorder}
            strokeWidth="1.5"
          />
        </svg>

        {/* 4코너 선수 배치 표시 (Overlay) 또는 타 모임 순서 안내 */}
        {isOtherClubActive ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center pointer-events-none bg-slate-950/70 backdrop-blur-2xs rounded-lg">
            <span className="text-amber-300 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-sm">
              🏸 타 모임 경기 진행 중
            </span>
            <span className="text-[11px] text-slate-200 mt-1 font-medium">
              우리 모임 차례까지 <strong className="text-amber-400 font-bold">앞선 타 모임 {otherConesAhead}팀</strong> 대기
            </span>
            <span className="text-[10px] text-emerald-300 mt-1 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
              클릭하여 다음 순서 넘기기 또는 팀 투입
            </span>
          </div>
        ) : game ? (
          <div className="absolute inset-0 pointer-events-none p-1 sm:p-1.5 flex flex-col justify-between">
            {/* 4분할 코트 격자: 투입된 4명의 이름을 코트 1/4 영역에 꽉 차도록 대형 폰트로 배치 */}
            <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-1.5 sm:gap-2">
              {/* [1/4 좌상단] 팀 1 - 1번 선수 */}
              <div className="relative flex flex-col items-center justify-center rounded-lg bg-slate-950/75 border border-amber-400/40 p-1 sm:p-1.5 shadow-md backdrop-blur-[1px] overflow-hidden">
                <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
                  <span className="text-[10px] sm:text-xs font-black px-1.5 py-0.2 sm:py-0.5 rounded bg-amber-400 text-slate-950 shadow-2xs">
                    {p1?.rank}조
                  </span>
                  <span className="text-[10px] text-amber-300 font-bold hidden xs:inline">1팀</span>
                </div>
                <div className="text-base xs:text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-md text-center truncate max-w-full px-1 leading-tight">
                  {p1?.name || '-'}
                </div>
              </div>

              {/* [1/4 우상단] 팀 2 - 1번 선수 */}
              <div className="relative flex flex-col items-center justify-center rounded-lg bg-slate-950/75 border border-sky-400/40 p-1 sm:p-1.5 shadow-md backdrop-blur-[1px] overflow-hidden">
                <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
                  <span className="text-[10px] text-sky-300 font-bold hidden xs:inline">2팀</span>
                  <span className="text-[10px] sm:text-xs font-black px-1.5 py-0.2 sm:py-0.5 rounded bg-sky-400 text-slate-950 shadow-2xs">
                    {p3?.rank}조
                  </span>
                </div>
                <div className="text-base xs:text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-md text-center truncate max-w-full px-1 leading-tight">
                  {p3?.name || '-'}
                </div>
              </div>

              {/* [1/4 좌하단] 팀 1 - 2번 선수 */}
              <div className="relative flex flex-col items-center justify-center rounded-lg bg-slate-950/75 border border-amber-400/40 p-1 sm:p-1.5 shadow-md backdrop-blur-[1px] overflow-hidden">
                <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
                  <span className="text-[10px] sm:text-xs font-black px-1.5 py-0.2 sm:py-0.5 rounded bg-amber-400 text-slate-950 shadow-2xs">
                    {p2?.rank}조
                  </span>
                  <span className="text-[10px] text-amber-300 font-bold hidden xs:inline">1팀</span>
                </div>
                <div className="text-base xs:text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-md text-center truncate max-w-full px-1 leading-tight">
                  {p2?.name || '-'}
                </div>
              </div>

              {/* [1/4 우하단] 팀 2 - 2번 선수 */}
              <div className="relative flex flex-col items-center justify-center rounded-lg bg-slate-950/75 border border-sky-400/40 p-1 sm:p-1.5 shadow-md backdrop-blur-[1px] overflow-hidden">
                <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
                  <span className="text-[10px] text-sky-300 font-bold hidden xs:inline">2팀</span>
                  <span className="text-[10px] sm:text-xs font-black px-1.5 py-0.2 sm:py-0.5 rounded bg-sky-400 text-slate-950 shadow-2xs">
                    {p4?.rank}조
                  </span>
                </div>
                <div className="text-base xs:text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-md text-center truncate max-w-full px-1 leading-tight">
                  {p4?.name || '-'}
                </div>
              </div>
            </div>

            {/* 네트 정중앙 게임 정보 배지 (수직 네트 중앙에 오버레이) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-slate-950/95 text-emerald-300 text-[10px] sm:text-xs font-black px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-emerald-400/60 shadow-xl whitespace-nowrap">
              {game.gameNumber > 0 ? `#${game.gameNumber} ` : ''}
              {game.type === 'mixed' ? '혼복' : game.type === 'men' ? '남복' : '여복'}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 text-xs font-medium pointer-events-none">
            <span className="text-slate-400">배정된 경기 없음</span>
            <span className="text-[10px] text-slate-500">클릭하여 게임 배정 또는 확인</span>
          </div>
        )}
      </div>

      {/* 코트 하단 & 다음 게임 상단: 코트 입장 시작 버튼 */}
      {!readOnly && onStatusChange && game && game.status === 'before' && !isOtherClubActive && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(game.id, 'playing');
          }}
          className="mt-2 w-full py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-[11px] sm:text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer border border-emerald-500/80"
          title="해당 팀의 코트 입장을 시작하고 게임 중으로 전환합니다"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span>{court.name} 입장 시작 ({game.gameNumber > 0 ? `#${game.gameNumber} ` : ''}게임 시작)</span>
        </button>
      )}

      {!readOnly && onStatusChange && (!game || game.status === 'ended') && nextGame && nextGame.status === 'before' && !isOtherClubActive && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(nextGame.id, 'playing');
          }}
          className="mt-2 w-full py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-[11px] sm:text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer border border-emerald-500/80"
          title="다음 대기 팀의 코트 입장을 시작하고 게임 중으로 전환합니다"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span>{court.name} 입장 시작 ({nextGame.gameNumber > 0 ? `#${nextGame.gameNumber} ` : ''}게임 시작)</span>
        </button>
      )}

      {/* 코트 하단: 다음 게임 예정자와 예상 시간 */}
      <div className="mt-2.5 pt-2 border-t border-slate-200/70">
        {nextGame ? (
          <div className="bg-white/95 rounded-xl p-2 border border-slate-200/90 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  {isOtherClubActive ? '우리 순서 시 입장 예정' : '다음 게임'}
                  {nextGame.gameNumber > 0 ? ` (#${nextGame.gameNumber})` : ''}
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                  {nextGame.type === 'mixed' ? '혼복' : nextGame.type === 'men' ? '남복' : '여복'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                <span className="text-[10px] text-emerald-600 font-semibold">예상</span>
                <span>{nextGame.estimatedStartTime || nextAvailableTime || '시간 미정'}</span>
              </div>
            </div>

            {/* 예정자 4인 (Team 1 vs Team 2) */}
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {/* 1팀 */}
              <div className="bg-slate-50 rounded-lg p-1.5 border border-slate-100 flex items-center gap-1 truncate">
                <div className="truncate font-medium text-slate-800 text-[11px] flex items-center gap-0.5">
                  <span className="text-[10px] text-amber-700 font-bold shrink-0">{nextGame.team1[0].rank}조</span>
                  <span className="truncate font-semibold">{nextGame.team1[0].name}</span>
                  <span className="text-slate-300 shrink-0">·</span>
                  <span className="text-[10px] text-amber-700 font-bold shrink-0">{nextGame.team1[1].rank}조</span>
                  <span className="truncate font-semibold">{nextGame.team1[1].name}</span>
                </div>
              </div>

              {/* 2팀 */}
              <div className="bg-slate-50 rounded-lg p-1.5 border border-slate-100 flex items-center gap-1 truncate">
                <div className="truncate font-medium text-slate-800 text-[11px] flex items-center gap-0.5">
                  <span className="text-[10px] text-sky-700 font-bold shrink-0">{nextGame.team2[0].rank}조</span>
                  <span className="truncate font-semibold">{nextGame.team2[0].name}</span>
                  <span className="text-slate-300 shrink-0">·</span>
                  <span className="text-[10px] text-sky-700 font-bold shrink-0">{nextGame.team2[1].rank}조</span>
                  <span className="truncate font-semibold">{nextGame.team2[1].name}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/60 rounded-xl p-2 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 flex items-center justify-center gap-1.5 flex-wrap">
            <span>{isOtherClubActive ? '우리 순서 시 배정 예정 경기 없음' : '다음 대기 예정 경기 없음'}</span>
            {nextAvailableTime && (
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                우리 순서 예상 {nextAvailableTime}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 하단 원클릭 상태 전환 컨트롤러 */}
      {game && !readOnly && onStatusChange && (
        <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 truncate">
            {game.type === 'mixed' ? '혼합복식' : game.type === 'men' ? '남자복식' : '여자복식'}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onStatusChange(game.id, 'before')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                game.status === 'before'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              대기
            </button>
            <button
              onClick={() => onStatusChange(game.id, 'playing')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                game.status === 'playing'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              진행
            </button>
            <button
              onClick={() => onStatusChange(game.id, 'ended')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                game.status === 'ended'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              종료
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
