import React, { useState } from 'react';
import { Court, TrafficCone, Game } from '../types';
import { X, Plus, Trash2, ArrowUp, ArrowDown, Check, Play, AlertCircle } from 'lucide-react';
import { TrafficConeIcon } from './TrafficConeIcon';

interface CourtConeModalProps {
  isOpen: boolean;
  onClose: () => void;
  court: Court | null;
  games: Game[];
  onUpdateCourtCones: (courtId: string, updatedCones: TrafficCone[]) => void;
  onAssignGameToCone?: (courtId: string, coneId: string, gameId: string) => void;
}

export const CourtConeModal: React.FC<CourtConeModalProps> = ({
  isOpen,
  onClose,
  court,
  games,
  onUpdateCourtCones,
}) => {
  if (!isOpen || !court) return null;

  const courtCones = court.cones || [];
  const beforeGames = games.filter((g) => g.status === 'before');

  // 우리 모임 꼬깔 걸기
  const handleAddOurCone = () => {
    const nextNum = courtCones.length > 0 ? Math.max(...courtCones.map((c) => c.number)) + 1 : 1;
    const newCone: TrafficCone = {
      id: `cone-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      number: nextNum,
      isOurClub: true,
      label: `우리 모임 꼬깔 (${nextNum}번)`,
    };
    onUpdateCourtCones(court.id, [...courtCones, newCone]);
  };

  // 타 모임 꼬깔 걸기
  const handleAddOtherCone = () => {
    const nextNum = courtCones.length > 0 ? Math.max(...courtCones.map((c) => c.number)) + 1 : 1;
    const newCone: TrafficCone = {
      id: `cone-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      number: nextNum,
      isOurClub: false,
      label: `타 모임 차례 (${nextNum}번)`,
    };
    onUpdateCourtCones(court.id, [...courtCones, newCone]);
  };

  // 꼬깔 제거
  const handleRemoveCone = (coneId: string) => {
    onUpdateCourtCones(court.id, courtCones.filter((c) => c.id !== coneId));
  };

  // 꼬깔 순서 이동
  const handleMoveCone = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= courtCones.length) return;

    const copy = [...courtCones];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    onUpdateCourtCones(court.id, copy);
  };

  // 대기 경기 꼬깔에 연결
  const handleAssignGame = (coneId: string, gameId: string) => {
    const updated = courtCones.map((c) =>
      c.id === coneId ? { ...c, gameId: gameId || undefined } : c
    );
    onUpdateCourtCones(court.id, updated);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 flex flex-col max-h-[88vh]">
        {/* 헤더 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
              <TrafficConeIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg">
                {court.name || `${court.number}번 코트`} 꼬깔 걸기 및 순서 관리
              </h3>
              <p className="text-xs text-slate-500">체육관 꼬깔 걸이대 순서 배정 및 타 모임 차례 설정</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 꼬깔 걸이대 시각화 */}
        <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-2xl border-2 border-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
              <TrafficConeIcon className="w-4 h-4 text-amber-600" />
              현재 걸려 있는 꼬깔 순서 ({courtCones.length}개)
            </span>
            <span className="text-[10px] text-amber-800 font-bold bg-amber-200/60 px-2 py-0.5 rounded-full">
              좌측부터 먼저 입장하는 순서
            </span>
          </div>

          {/* 꼬깔 걸이대 랙 그래픽 */}
          <div className="bg-amber-900/10 p-3 rounded-xl border border-amber-300/60 flex items-center gap-2 overflow-x-auto min-h-[70px]">
            {courtCones.length === 0 ? (
              <div className="text-center w-full text-slate-400 text-xs py-2">
                걸려 있는 꼬깔이 없습니다. 아래 버튼으로 꼬깔을 걸어주세요.
              </div>
            ) : (
              courtCones.map((cone, idx) => {
                const assignedGame = games.find((g) => g.id === cone.gameId);
                return (
                  <div
                    key={cone.id}
                    className={`shrink-0 flex flex-col items-center p-2 rounded-xl border transition-all ${
                      cone.isOurClub
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : 'bg-slate-700 text-white border-slate-800 shadow-sm'
                    }`}
                  >
                    <span className="text-[9px] font-black uppercase mb-0.5">
                      {idx === 0 ? '▶ 1순위' : `${idx + 1}순위`}
                    </span>
                    <TrafficConeIcon className="w-6 h-6 text-white drop-shadow-xs" />
                    <span className="text-[10px] font-black mt-0.5">
                      {cone.isOurClub ? '우리 꼬깔' : '타 모임'}
                    </span>
                    {assignedGame && (
                      <span className="text-[8px] bg-white/20 px-1 rounded mt-0.5 truncate max-w-[64px]">
                        #{assignedGame.gameNumber}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 꼬깔 조작 버튼 그룹 */}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddOurCone}
            className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>우리 모임 꼬깔 걸기</span>
          </button>
          <button
            type="button"
            onClick={handleAddOtherCone}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>타 모임 꼬깔 추가</span>
          </button>
        </div>

        {/* 꼬깔별 상세 목록 및 대기 게임 배정 */}
        <div className="mt-3 overflow-y-auto space-y-2 flex-1 pr-1 text-xs">
          <h4 className="font-bold text-slate-800 text-xs mb-1">꼬깔별 대기 경기 배정 및 순서 조정</h4>
          {courtCones.map((cone, idx) => {
            const assignedGame = games.find((g) => g.id === cone.gameId);
            return (
              <div
                key={cone.id}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
                  cone.isOurClub ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                {/* 꼬깔 정보 */}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-white text-xs ${
                      cone.isOurClub ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                      <span>{cone.isOurClub ? '우리 모임 꼬깔' : '타 모임 차례'}</span>
                      <span className="text-[10px] text-slate-400">({cone.number}번 꼬깔)</span>
                    </div>

                    {/* 우리 모임 꼬깔인 경우 대기 게임 배정 드롭다운 */}
                    {cone.isOurClub ? (
                      <div className="mt-1 flex items-center gap-1">
                        <select
                          value={cone.gameId || ''}
                          onChange={(e) => handleAssignGame(cone.id, e.target.value)}
                          className="p-1 bg-white border border-amber-300 rounded-lg text-[11px] font-bold text-slate-800 focus:outline-none"
                        >
                          <option value="">대기 게임 걸기 (선택)</option>
                          {beforeGames.map((g) => (
                            <option key={g.id} value={g.id}>
                              #{g.gameNumber} {g.team1[0].name}·{g.team1[1].name} vs {g.team2[0].name}·{g.team2[1].name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500">
                        타 모임 경기 진행 (대기 시간 2배 반영)
                      </span>
                    )}
                  </div>
                </div>

                {/* 순서 이동 & 삭제 버튼 */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveCone(idx, 'up')}
                    className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-30"
                    title="앞 순서로 이동"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === courtCones.length - 1}
                    onClick={() => handleMoveCone(idx, 'down')}
                    className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-30"
                    title="뒤 순서로 이동"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveCone(cone.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 ml-1"
                    title="꼬깔 제거"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 푸터 */}
        <div className="pt-3 border-t border-slate-100 flex justify-end mt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-xs shadow-xs"
          >
            설정 완료
          </button>
        </div>
      </div>
    </div>
  );
};
