import React, { useState } from 'react';
import { Game, Member } from '../types';
import { X, ArrowLeftRight, UserCheck, Users } from 'lucide-react';

interface PlayerSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game | null;
  targetMember: Member | null;
  waitingMembers: Member[];
  onSwapWithOpponent: (gameId: string, memberId1: string, memberId2: string) => void;
  onReplaceWithWaiting: (gameId: string, oldMemberId: string, newMember: Member) => void;
}

export const PlayerSwapModal: React.FC<PlayerSwapModalProps> = ({
  isOpen,
  onClose,
  game,
  targetMember,
  waitingMembers,
  onSwapWithOpponent,
  onReplaceWithWaiting,
}) => {
  const [selectedReplacementId, setSelectedReplacementId] = useState('');

  if (!isOpen || !game || !targetMember) return null;

  // targetMember가 속한 팀 확인
  const isTeam1 = game.team1.some((m) => m.id === targetMember.id);
  const opponentTeam = isTeam1 ? game.team2 : game.team1;

  // 혼복인 경우 성별 밸런스를 고려해 같은 성별 선수와만 스왑 가능
  const validOpponents = game.type === 'mixed'
    ? opponentTeam.filter((m) => m.gender === targetMember.gender)
    : opponentTeam;

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-purple-600 text-white">
              <ArrowLeftRight className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-black text-slate-900 text-base">선수 교체 및 맞바꿈</h3>
              <p className="text-[11px] text-slate-500">#{game.gameNumber} 경기 - {targetMember.name} 선수</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          {/* 1. 상대팀 선수와 맞바꿈 (스왑) */}
          <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-2">
            <span className="font-black text-purple-900 flex items-center gap-1.5">
              <ArrowLeftRight className="w-3.5 h-3.5 text-purple-600" />
              상대팀 선수와 맞바꾸기 (팀 스왑)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {validOpponents.map((opp) => (
                <button
                  key={opp.id}
                  type="button"
                  onClick={() => {
                    onSwapWithOpponent(game.id, targetMember.id, opp.id);
                    onClose();
                  }}
                  className="p-2.5 bg-white border border-purple-200 hover:border-purple-400 rounded-xl text-left shadow-2xs font-bold text-slate-800 hover:bg-purple-100/50 transition-colors cursor-pointer"
                >
                  <div className="font-black text-xs">{opp.name}</div>
                  <div className="text-[10px] text-slate-400">{opp.rank}조 ({opp.gender === 'M' ? '남' : '여'})</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. 대기 중인 회원으로 교체 */}
          <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
            <span className="font-black text-emerald-900 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              대기 중인 회원으로 선수 교체
            </span>
            {waitingMembers.length === 0 ? (
              <div className="text-slate-400 text-center py-2">현재 대기 중인 회원이 없습니다.</div>
            ) : (
              <div className="flex gap-2">
                <select
                  value={selectedReplacementId}
                  onChange={(e) => setSelectedReplacementId(e.target.value)}
                  className="flex-1 p-2 bg-white border border-emerald-200 rounded-xl font-bold"
                >
                  <option value="">대기 회원 선택</option>
                  {waitingMembers
                    .filter((m) => game.type !== 'mixed' || m.gender === targetMember.gender)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.rank}조, {m.gender === 'M' ? '남' : '여'}) - 경기 {m.todayGamesCount}회
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  disabled={!selectedReplacementId}
                  onClick={() => {
                    const repl = waitingMembers.find((m) => m.id === selectedReplacementId);
                    if (repl) {
                      onReplaceWithWaiting(game.id, targetMember.id, repl);
                      onClose();
                    }
                  }}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black rounded-xl shadow-xs"
                >
                  교체
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
