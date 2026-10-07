import React, { useState } from 'react';
import { Member, Court, Game, GameType } from '../types';
import { X, PlusCircle, Check } from 'lucide-react';

interface ManualMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  courts: Court[];
  existingGames: Game[];
  onCreateMatch: (newGame: Game) => void;
}

export const ManualMatchModal: React.FC<ManualMatchModalProps> = ({
  isOpen,
  onClose,
  members,
  courts,
  existingGames,
  onCreateMatch,
}) => {
  const [courtId, setCourtId] = useState(courts[0]?.id || '');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleToggleMember = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const handleCreate = () => {
    if (selectedIds.length !== 4) return;
    const m = selectedIds.map((id) => members.find((x) => x.id === id)!);
    const mCount = m.filter((x) => x.gender === 'M').length;
    const fCount = m.filter((x) => x.gender === 'F').length;
    let type: GameType = 'mixed';
    if (mCount === 4) type = 'men';
    else if (fCount === 4) type = 'women';

    const maxGameNumber = existingGames.reduce((max, g) => Math.max(max, g.gameNumber), 0) + 1;

    onCreateMatch({
      id: `game-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      gameNumber: maxGameNumber,
      courtId: courtId || courts[0]?.id,
      status: 'before',
      team1: [m[0], m[1]],
      team2: [m[2], m[3]],
      type,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-slate-900 text-white">
              <PlusCircle className="w-4 h-4" />
            </span>
            <h3 className="font-black text-slate-900 text-base">수동 매칭 생성 (선수 4명 선택)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 overflow-y-auto space-y-4 text-xs flex-1">
          <div>
            <label className="font-bold text-slate-700 block mb-1">배정 코트 선택</label>
            <select
              value={courtId}
              onChange={(e) => setCourtId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            >
              {courts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || `${c.number}번 코트`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-700">참여 선수 선택 ({selectedIds.length}/4명)</span>
              {selectedIds.length === 4 && (
                <span className="text-emerald-600 font-extrabold text-[11px]">4명 선택 완료!</span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
              {members.map((member) => {
                const isSelected = selectedIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleToggleMember(member.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-black text-xs">{member.name}</div>
                      <div className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {member.rank}조 ({member.gender === 'M' ? '남' : '여'})
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold"
          >
            취소
          </button>
          <button
            type="button"
            disabled={selectedIds.length !== 4}
            onClick={handleCreate}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-black disabled:opacity-40 shadow-xs"
          >
            매칭 생성
          </button>
        </div>
      </div>
    </div>
  );
};
