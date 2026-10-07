import React, { useState, useEffect } from 'react';
import { Court, Game } from '../types';
import { X, PlayCircle, Check, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

interface GameStartConfirmModalProps {
  isOpen: boolean;
  game: Game | null;
  courts: Court[];
  onClose: () => void;
  onConfirmStart: (gameId: string, courtId: string) => void;
}

export const GameStartConfirmModal: React.FC<GameStartConfirmModalProps> = ({
  isOpen,
  game,
  courts,
  onClose,
  onConfirmStart,
}) => {
  const [selectedCourtId, setSelectedCourtId] = useState<string>('');

  useEffect(() => {
    if (game) {
      // 기본값: 기존 사전 배정된 코트 (없으면 첫 번째 코트)
      setSelectedCourtId(game.courtId && courts.some((c) => c.id === game.courtId) ? game.courtId : courts[0]?.id || '');
    }
  }, [game, courts]);

  if (!isOpen || !game) return null;

  const preAssignedCourt = courts.find((c) => c.id === game.courtId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourtId) return;
    onConfirmStart(game.id, selectedCourtId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-3 sm:p-4 flex min-h-full items-center justify-center animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 my-auto flex flex-col max-h-[calc(100dvh-2rem)] overflow-hidden">
        {/* 헤더 (고정) */}
        <div className="shrink-0 p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <PlayCircle className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                게임 시작 & 입장 코트 확인
              </h3>
              <p className="text-xs text-slate-500">
                {game.gameNumber > 0 ? `#${game.gameNumber}경기 ` : ''}({game.type === 'mixed' ? '혼합복식' : game.type === 'men' ? '남자복식' : '여자복식'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* 경기 요약 정보 */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="flex justify-between items-center py-0.5">
                <span className="font-bold text-slate-800">
                  1팀: {game.team1[0].name}({game.team1[0].rank}) · {game.team1[1].name}({game.team1[1].rank})
                </span>
                <span className="text-slate-400">합 {game.team1ScoreBalance}점</span>
              </div>
              <div className="border-t border-slate-200/60 my-1.5" />
              <div className="flex justify-between items-center py-0.5">
                <span className="font-bold text-slate-800">
                  2팀: {game.team2[0].name}({game.team2[0].rank}) · {game.team2[1].name}({game.team2[1].rank})
                </span>
                <span className="text-slate-400">합 {game.team2ScoreBalance}점</span>
              </div>
            </div>
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              입장할 코트 선택
            </label>
            <div className="space-y-2">
              {courts.map((court) => {
                const isSelected = selectedCourtId === court.id;
                const isPreAssigned = game.courtId === court.id;

                return (
                  <label
                    key={court.id}
                    onClick={() => setSelectedCourtId(court.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm text-slate-900">
                            {court.name}
                          </span>
                          {isPreAssigned && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                              사전 배정 코트
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          꼬깔 {court.reservedCones}/{court.totalCones}개
                        </span>
                      </div>
                    </div>

                    {isPreAssigned && (
                      <span className="text-[11px] font-bold text-emerald-600">
                        기본 배정
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 leading-relaxed">
            ✨ <strong>꼬깔 순서 자동 연동:</strong> 선택한 코트에 게임이 시작되면 해당 코트의 가장 앞(오른쪽) 꼬깔이 우리 모임 꼬깔로 맞춰지며, 진행 중인 상태가 유지됩니다.
          </div>
          </div>

          {/* 하단 버튼 (고정 푸터) */}
          <div className="shrink-0 p-4 sm:px-5 py-3 border-t border-slate-100 bg-slate-50/90 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!selectedCourtId}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
            >
              <PlayCircle className="w-4 h-4" />
              게임 시작 및 코트 입장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
