import React from 'react';
import { Court, Game } from '../types';
import { X, RotateCw, CheckCircle2, Play, Users } from 'lucide-react';

interface CourtAdvanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  court: Court | null;
  currentGame: Game | null;
  nextGame: Game | null;
  onAdvance: (courtId: string, endCurrentGameId?: string, startNextGameId?: string) => void;
}

export const CourtAdvanceModal: React.FC<CourtAdvanceModalProps> = ({
  isOpen,
  onClose,
  court,
  currentGame,
  nextGame,
  onAdvance,
}) => {
  if (!isOpen || !court) return null;

  const handleConfirm = () => {
    onAdvance(court.id, currentGame?.id, nextGame?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-600 text-white">
              <RotateCw className="w-4 h-4" />
            </span>
            <h3 className="font-black text-slate-900 text-base">{court.name || `${court.number}번 코트`} 게임 회전</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-xs">
          {currentGame && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-rose-700 block flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                종료될 경기: #{currentGame.gameNumber}
              </span>
              <div className="font-extrabold text-slate-800">
                {currentGame.team1[0].name}·{currentGame.team1[1].name} vs {currentGame.team2[0].name}·{currentGame.team2[1].name}
              </div>
            </div>
          )}

          {nextGame ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 block flex items-center gap-1">
                <Play className="w-3 h-3 fill-current" />
                새로 입장할 경기: #{nextGame.gameNumber}
              </span>
              <div className="font-extrabold text-emerald-950">
                {nextGame.team1[0].name}·{nextGame.team1[1].name} vs {nextGame.team2[0].name}·{nextGame.team2[1].name}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-center">
              다음 대기 중인 경기가 없습니다.
            </div>
          )}

          <p className="text-[11px] text-slate-500 pt-1">
            원클릭 회전 시 기존 경기는 '종료' 처리되어 선수들이 대기로 복귀하며, 다음 대기팀이 자동으로 코트에 입장합니다.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs"
          >
            코트 회전 실행
          </button>
        </div>
      </div>
    </div>
  );
};
