import React, { useState, useRef } from 'react';
import { Game, Member, Court, GameType } from '../types';
import { Calendar, PlusCircle, Sparkles, Play, CheckCircle2, RotateCw, Trash2, LocateFixed, Users, ArrowLeftRight, Eye } from 'lucide-react';
import { BadmintonCourtView } from './BadmintonCourtView';

interface GameSectionProps {
  games: Game[];
  courts: Court[];
  members: Member[];
  onAutoGenerateClick: (preferredType?: GameType) => void;
  onManualGenerateClick: () => void;
  onGameStatusChange: (gameId: string, newStatus: 'playing' | 'end' | 'before') => void;
  onDeleteGame: (gameId: string) => void;
  onTriggerYangHeeWooMode?: (fromGameId: string) => void;
  onSwapPlayerClick?: (game: Game, member: Member) => void;
  onOpenAIDiagnosis?: () => void;
}

export const GameSection: React.FC<GameSectionProps> = ({
  games,
  courts,
  members,
  onAutoGenerateClick,
  onManualGenerateClick,
  onGameStatusChange,
  onDeleteGame,
  onTriggerYangHeeWooMode,
  onSwapPlayerClick,
  onOpenAIDiagnosis,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [highlightedGameId, setHighlightedGameId] = useState<string | null>(null);
  const [previewCourtGameId, setPreviewCourtGameId] = useState<string | null>(null);

  const listContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const filteredGames = games.filter((g) => {
    if (filterType === 'all') return true;
    return g.status === filterType;
  });

  // 다음 게임 찾기 핸들러
  const handleFindNextGame = () => {
    let target = games.find((g) => g.status === 'before');
    if (!target) {
      target = games.find((g) => g.status === 'playing');
    }

    if (!target) return;

    if (filterType !== 'all' && filterType !== target.status) {
      setFilterType('all');
    }

    setTimeout(() => {
      const el = cardRefs.current[target!.id];
      if (el && listContainerRef.current) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedGameId(target!.id);
        setTimeout(() => setHighlightedGameId(null), 2500);
      }
    }, 50);
  };

  const getCourtName = (courtId: string) => {
    const c = courts.find((x) => x.id === courtId);
    return c ? (c.name || `${c.number}번 코트`) : '코트';
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col h-full relative">
      {/* 상단 헤더 바 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">게임 목록</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              총 {games.length}경기
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            생성 시 '금일 게임 수'가 카운트되며, 선수 이름을 클릭하면 교체 및 스왑이 가능합니다.
          </p>
        </div>

        {/* 생성 및 진단 버튼 세트 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {onOpenAIDiagnosis && games.length > 0 && (
            <button
              type="button"
              onClick={onOpenAIDiagnosis}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-300 hover:from-emerald-100 hover:to-teal-100 transition-all cursor-pointer"
              title="AI 대진표 밸런스 정밀 진단"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI 진단</span>
            </button>
          )}

          <button
            type="button"
            onClick={onManualGenerateClick}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
            title="원하는 선수를 직접 골라 매칭을 생성합니다"
          >
            <PlusCircle className="w-3.5 h-3.5 text-slate-600" />
            수동 매칭
          </button>
          <button
            type="button"
            onClick={() => onAutoGenerateClick('men')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 active:scale-95 transition-all cursor-pointer"
          >
            남복 생성
          </button>
          <button
            type="button"
            onClick={() => onAutoGenerateClick('women')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 active:scale-95 transition-all cursor-pointer"
          >
            여복 생성
          </button>
          <button
            type="button"
            onClick={() => onAutoGenerateClick()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            자동 매칭
          </button>
        </div>
      </div>

      {/* 필터 탭 */}
      <div className="mt-3 flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs w-fit">
        {(['all', 'before', 'playing', 'end'] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilterType(st)}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              filterType === st
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {st === 'all'
              ? `전체 (${games.length})`
              : st === 'before'
              ? `대기 (${games.filter((g) => g.status === 'before').length})`
              : st === 'playing'
              ? `진행 중 (${games.filter((g) => g.status === 'playing').length})`
              : `종료 (${games.filter((g) => g.status === 'end').length})`}
          </button>
        ))}
      </div>

      {/* 게임 목록 카드 리스트 영역 (플로팅 버튼 포함) */}
      <div className="relative mt-3 flex-1 min-h-[300px]">
        <div
          ref={listContainerRef}
          className="overflow-y-auto max-h-[520px] space-y-2.5 pr-2 pb-3"
        >
          {filteredGames.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              {games.length === 0
                ? '생성된 게임이 없습니다. 상단의 [자동 매칭] 또는 [수동 매칭] 버튼을 눌러주세요.'
                : '해당 조건의 게임이 없습니다.'}
            </div>
          ) : (
            filteredGames.map((game) => {
              const isHighlighted = highlightedGameId === game.id;
              const isPreviewCourt = previewCourtGameId === game.id;

              return (
                <div
                  key={game.id}
                  ref={(el) => {
                    cardRefs.current[game.id] = el;
                  }}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isHighlighted
                      ? 'ring-4 ring-emerald-400 bg-emerald-50/80 shadow-md'
                      : game.status === 'playing'
                      ? 'bg-emerald-50/50 border-emerald-300 shadow-xs'
                      : game.status === 'before'
                      ? 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                      : 'bg-slate-50/80 border-slate-200 opacity-70'
                  }`}
                >
                  {/* 카드 헤더 */}
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900">#{game.gameNumber}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-700 text-[10px]">
                        {getCourtName(game.courtId)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {game.type === 'men' ? '남복' : game.type === 'women' ? '여복' : '혼복'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewCourtGameId(isPreviewCourt ? null : game.id)}
                        className={`p-1 rounded text-[10px] font-bold flex items-center gap-1 border transition-colors ${
                          isPreviewCourt ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                        title="배드민턴 코트 그래픽 뷰 토글"
                      >
                        <Eye className="w-3 h-3" />
                        <span className="hidden sm:inline">코트뷰</span>
                      </button>

                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          game.status === 'playing'
                            ? 'bg-emerald-600 text-white'
                            : game.status === 'before'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {game.status === 'playing' ? '진행 중' : game.status === 'before' ? '입장 대기' : '종료'}
                      </span>

                      {onTriggerYangHeeWooMode && game.status === 'before' && (
                        <button
                          type="button"
                          onClick={() => onTriggerYangHeeWooMode(game.id)}
                          className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[10px] font-bold border border-indigo-200 transition-colors cursor-pointer"
                          title="이 게임부터 남은 대기 경기들을 다시 매칭합니다"
                        >
                          양희우 모드(여기부터 재매칭)
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onDeleteGame(game.id)}
                        className="p-1 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50"
                        title="경기 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 코트 뷰 그래픽 (토글 시) */}
                  {isPreviewCourt && (
                    <div className="mt-2.5">
                      <BadmintonCourtView game={game} />
                    </div>
                  )}

                  {/* 팀 매치업 내용 (선수 클릭 시 교체/스왑 지원) */}
                  <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                    {/* 팀 1 */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <div className="text-[10px] font-bold text-emerald-800 mb-1 flex items-center justify-between">
                        <span>TEAM A</span>
                        <span className="text-[9px] text-slate-400 font-normal">선수 클릭 시 교체</span>
                      </div>
                      <div className="space-y-1">
                        {game.team1.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => onSwapPlayerClick && onSwapPlayerClick(game, p)}
                            className="font-extrabold text-slate-900 flex items-center justify-between p-1 rounded hover:bg-white cursor-pointer transition-colors"
                            title="선수 맞바꿈 또는 대기자로 교체"
                          >
                            <span className="hover:text-emerald-700 flex items-center gap-1">
                              {p.name}
                              <ArrowLeftRight className="w-2.5 h-2.5 text-slate-300" />
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">{p.rank}조</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 팀 2 */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <div className="text-[10px] font-bold text-rose-800 mb-1 flex items-center justify-between">
                        <span>TEAM B</span>
                        <span className="text-[9px] text-slate-400 font-normal">선수 클릭 시 교체</span>
                      </div>
                      <div className="space-y-1">
                        {game.team2.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => onSwapPlayerClick && onSwapPlayerClick(game, p)}
                            className="font-extrabold text-slate-900 flex items-center justify-between p-1 rounded hover:bg-white cursor-pointer transition-colors"
                            title="선수 맞바꿈 또는 대기자로 교체"
                          >
                            <span className="hover:text-rose-700 flex items-center gap-1">
                              {p.name}
                              <ArrowLeftRight className="w-2.5 h-2.5 text-slate-300" />
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">{p.rank}조</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 카드 하단 액션 버튼 */}
                  <div className="mt-2.5 flex items-center justify-end gap-1.5">
                    {game.status === 'before' && (
                      <button
                        type="button"
                        onClick={() => onGameStatusChange(game.id, 'playing')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        게임 시작
                      </button>
                    )}
                    {game.status === 'playing' && (
                      <button
                        type="button"
                        onClick={() => onGameStatusChange(game.id, 'end')}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        게임 종료
                      </button>
                    )}
                    {game.status === 'end' && (
                      <button
                        type="button"
                        onClick={() => onGameStatusChange(game.id, 'before')}
                        className="px-2 py-0.5 rounded text-slate-400 hover:text-slate-700 text-[10px]"
                      >
                        대기로 복원
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 
          [핵심 요구사항] 다음 게임 찾기 플로팅 버튼:
          스크롤 바 영역의 수직 중단(top-1/2 -translate-y-1/2)에 항상 위치하여 상시 떠있음
        */}
        {games.some((g) => g.status === 'before' || g.status === 'playing') && (
          <button
            type="button"
            onClick={handleFindNextGame}
            className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-4 z-20 flex items-center gap-1.5 px-3 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-90 text-white font-black text-xs shadow-lg ring-2 ring-white transition-all cursor-pointer"
            title="다음 진행할 대기 게임으로 즉시 스크롤 이동"
          >
            <LocateFixed className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">다음 게임 찾기</span>
          </button>
        )}
      </div>
    </section>
  );
};
