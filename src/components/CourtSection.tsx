import React, { useState } from 'react';
import { Court, Game, Member, TrafficCone } from '../types';
import { LayoutGrid, Plus, HelpCircle, Play, CheckCircle2, RotateCw, Clock, Settings2 } from 'lucide-react';
import { TrafficConeIcon } from './TrafficConeIcon';
import { calculateOccupancyStats } from '../utils/courtAvailability';

interface CourtSectionProps {
  courts: Court[];
  games: Game[];
  members: Member[];
  sessionStartTime?: string;
  onAddCourt: () => void;
  onEditCourt?: (court: Court) => void;
  onDeleteCourt?: (id: string) => void;
  onGameStatusChange: (gameId: string, newStatus: 'playing' | 'end' | 'before') => void;
  onOpenCourtAdvance?: (court: Court, current: Game | null, next: Game | null) => void;
  onOpenCourtConeModal?: (court: Court) => void;
  readOnly?: boolean;
}

export const CourtSection: React.FC<CourtSectionProps> = ({
  courts,
  games,
  members,
  sessionStartTime = '19:00',
  onAddCourt,
  onEditCourt,
  onGameStatusChange,
  onOpenCourtAdvance,
  onOpenCourtConeModal,
  readOnly = false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const stats = calculateOccupancyStats(courts, games);

  // 코트별 현재 진행 게임 및 대기 게임 매핑
  const getCourtGames = (courtId: string) => {
    const courtGames = games.filter((g) => g.courtId === courtId);
    const playing = courtGames.find((g) => g.status === 'playing');
    const nextBefore = courtGames.find((g) => g.status === 'before');
    return { playing, nextBefore };
  };

  // 예상 시각 계산 (1게임당 15분)
  const calculateEstimatedTime = (courtNumber: number, offsetMinutes: number) => {
    try {
      const [h, m] = sessionStartTime.split(':').map(Number);
      const totalMinutes = h * 60 + m + offsetMinutes;
      const endH = Math.floor(totalMinutes / 60) % 24;
      const endM = totalMinutes % 60;
      return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    } catch {
      return sessionStartTime;
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5">
      {/* 상단 타이틀 & 컨트롤 바 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
            코트 현황
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
            {courts.length} / 최대 14개 코트
          </span>
          <button
            type="button"
            onClick={() => setShowTooltip(!showTooltip)}
            className={`p-1 px-2 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-xs font-bold border ${
              showTooltip
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-slate-200'
            }`}
            title="점유율 및 점유 코트 수 산출 상세 설명 보기"
          >
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px]">도움말</span>
          </button>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAddCourt}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              코트 추가
            </button>
          </div>
        )}
      </div>

      {/* 물음표(?) 버튼을 눌렀을 때만 노출되는 상세 설명 및 점유율 산출 패널 */}
      {showTooltip && (
        <div className="mt-3.5 p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-emerald-950 leading-relaxed shadow-xs space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-200/80">
            <div className="flex items-center gap-2 font-black text-emerald-900 text-sm">
              <HelpCircle className="w-4 h-4 text-emerald-700" />
              <span>코트 현황 및 점유율 산출 안내</span>
            </div>
            <button
              type="button"
              onClick={() => setShowTooltip(false)}
              className="text-emerald-700 hover:text-emerald-950 p-1 rounded-lg hover:bg-emerald-100 transition-colors text-xs font-bold cursor-pointer"
              title="닫기"
            >
              ✕ 닫기
            </button>
          </div>

          <p className="text-slate-700 leading-normal font-medium">
            개별 코트별 예약 꼬깔 비율을 합산하여 우리 모임의 실제 <strong>점유 코트 수</strong>를 산출하고, 동시 진행 게임에 동일 인원이 중복 배정되지 않도록 관리합니다.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
            <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
              <div className="text-[10px] text-slate-500 font-bold">운영 코트</div>
              <div className="text-sm font-black text-emerald-800">{courts.length}개</div>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
              <div className="text-[10px] text-slate-500 font-bold">우리 모임 점유 코트</div>
              <div className="text-sm font-black text-emerald-800">{stats.occupiedCourtsRatio}개 코트</div>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
              <div className="text-[10px] text-slate-500 font-bold">전체 꼬깔 점유율</div>
              <div className="text-sm font-black text-emerald-800">{stats.overallConeOccupancyRate}%</div>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
              <div className="text-[10px] text-slate-500 font-bold">현재 진행 경기</div>
              <div className="text-sm font-black text-emerald-800">
                {games.filter((g) => g.status === 'playing').length}경기
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 코트 카드 그리드 */}
      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {courts.map((court, idx) => {
          const { playing, nextBefore } = getCourtGames(court.id);
          const estTime = calculateEstimatedTime(court.number, idx * 5);
          const cones = court.cones || [];

          return (
            <div
              key={court.id}
              className={`rounded-2xl border transition-all p-3.5 flex flex-col justify-between ${
                playing
                  ? 'bg-emerald-50/70 border-emerald-300 shadow-sm'
                  : nextBefore
                  ? 'bg-amber-50/60 border-amber-200 shadow-2xs'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              {/* 코트 헤더 */}
              <div>
                <div className="flex items-center justify-between border-b pb-2 mb-2 border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      {court.number}
                    </span>
                    <div>
                      <span className="font-extrabold text-sm text-slate-900 block leading-tight">
                        {court.name || `${court.number}번 코트`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        예상 {estTime}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* [꼬깔 거는 화면 호출 버튼] */}
                    {onOpenCourtConeModal && !readOnly && (
                      <button
                        type="button"
                        onClick={() => onOpenCourtConeModal(court)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-black border border-amber-300 transition-colors cursor-pointer"
                        title="체육관 꼬깔 걸기 및 순서 관리"
                      >
                        <TrafficConeIcon className="w-3 h-3 text-amber-600" />
                        <span>꼬깔 관리</span>
                      </button>
                    )}

                    {onEditCourt && !readOnly && (
                      <button
                        type="button"
                        onClick={() => onEditCourt(court)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors"
                        title="코트 설정"
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 
                  [꼬깔 순서 시각화 띠]
                */}
                <div className="mb-2 p-1.5 bg-amber-50 rounded-xl border border-amber-200/80 flex items-center justify-between text-[10px]">
                  <span className="text-amber-900 font-bold flex items-center gap-1">
                    <TrafficConeIcon className="w-3 h-3 text-amber-600" />
                    <span>걸린 꼬깔: {cones.length}개</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {cones.length === 0 ? (
                      <span className="text-slate-400 text-[9px]">대기 꼬깔 없음</span>
                    ) : (
                      cones.slice(0, 3).map((cone, cIdx) => (
                        <span
                          key={cone.id}
                          className={`px-1 py-0.2 rounded font-black text-[9px] ${
                            cone.isOurClub ? 'bg-amber-500 text-white' : 'bg-slate-700 text-white'
                          }`}
                        >
                          {cIdx + 1}순위
                        </span>
                      ))
                    )}
                    {cones.length > 3 && (
                      <span className="text-[9px] text-slate-500 font-bold">+{cones.length - 3}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 경기 현황 */}
              <div className="space-y-2 text-xs flex-1">
                {/* 진행 중 경기 */}
                {playing ? (
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-200 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-1.5 py-0.2 rounded-md bg-emerald-600 text-white font-black text-[10px] flex items-center gap-1">
                        <Play className="w-2.5 h-2.5 fill-current" />
                        진행 중 #{playing.gameNumber}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        {playing.type === 'men' ? '남복' : playing.type === 'women' ? '여복' : '혼복'}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs">
                      {playing.team1[0].name} & {playing.team1[1].name}
                      <span className="text-slate-400 mx-1 font-normal">vs</span>
                      {playing.team2[0].name} & {playing.team2[1].name}
                    </div>

                    {!readOnly && (
                      <div className="flex gap-1.5 pt-1">
                        {onOpenCourtAdvance ? (
                          <button
                            type="button"
                            onClick={() => onOpenCourtAdvance(court, playing, nextBefore || null)}
                            className="w-full py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <RotateCw className="w-3 h-3" />
                            {nextBefore ? '경기 종료 및 다음 입장' : '경기 종료'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onGameStatusChange(playing.id, 'end')}
                            className="w-full py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            경기 종료
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-white/70 border border-slate-200 text-slate-400 text-center text-[11px] py-3">
                    진행 중인 경기 없음 (대기 중)
                  </div>
                )}

                {/* 다음 입장 대기 경기 */}
                {nextBefore && (
                  <div className="p-2 rounded-xl bg-white/90 border border-amber-200/80 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-amber-800">
                      <span>다음 대기 #{nextBefore.gameNumber}</span>
                      <span className="text-slate-400 font-normal">
                        {nextBefore.type === 'men' ? '남복' : nextBefore.type === 'women' ? '여복' : '혼복'}
                      </span>
                    </div>
                    <div className="text-slate-800 truncate font-semibold">
                      {nextBefore.team1[0].name}·{nextBefore.team1[1].name} vs {nextBefore.team2[0].name}·{nextBefore.team2[1].name}
                    </div>
                    {!readOnly && !playing && (
                      <button
                        type="button"
                        onClick={() => onGameStatusChange(nextBefore.id, 'playing')}
                        className="w-full mt-1 py-1 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        지금 시작
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
