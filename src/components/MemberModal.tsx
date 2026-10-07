import React, { useState, useEffect } from 'react';
import { Member, MemberRank } from '../types';
import { X, UserPlus, Edit2 } from 'lucide-react';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberData: Partial<Member>) => void;
  initialMember?: Member | null;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialMember,
}) => {
  const [name, setName] = useState('');
  const [rank, setRank] = useState<MemberRank>('D');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    if (initialMember) {
      setName(initialMember.name);
      setRank(initialMember.rank);
      setGender(initialMember.gender);
      setIsGuest(Boolean(initialMember.isGuest));
    } else {
      setName('');
      setRank('D');
      setGender('M');
      setIsGuest(false);
    }
  }, [initialMember, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      rank,
      gender,
      isGuest,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-slate-900 text-white">
              {initialMember ? <Edit2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </span>
            <h3 className="font-black text-slate-900 text-base">
              {initialMember ? '회원 정보 수정' : '새 회원 추가'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 홍길동"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">급수</label>
              <select
                value={rank}
                onChange={(e) => setRank(e.target.value as MemberRank)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold focus:outline-none"
              >
                {(['S', 'A', 'B', 'C', 'D', 'E', 'F'] as const).map((r) => (
                  <option key={r} value={r}>
                    {r}조
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">성별</label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setGender('M')}
                  className={`py-1.5 rounded-lg font-bold transition-all ${
                    gender === 'M' ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-500'
                  }`}
                >
                  남성
                </button>
                <button
                  type="button"
                  onClick={() => setGender('F')}
                  className={`py-1.5 rounded-lg font-bold transition-all ${
                    gender === 'F' ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-500'
                  }`}
                >
                  여성
                </button>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 pt-1">
            <input
              type="checkbox"
              checked={isGuest}
              onChange={(e) => setIsGuest(e.target.checked)}
              className="accent-emerald-600 rounded"
            />
            <span>게스트 회원 (이름에 G 표시)</span>
          </label>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-black hover:bg-slate-800 shadow-xs"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
