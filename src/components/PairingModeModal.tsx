import React, { useState } from 'react';
import { Member, PartnerPair } from '../types';
import { X, HeartHandshake, HeartCrack, Plus, Trash2 } from 'lucide-react';

interface PairingModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  partnerPairs: PartnerPair[];
  onAddPair: (type: 'partner' | 'breakup', memberId1: string, memberId2: string) => void;
  onDeletePair: (id: string) => void;
}

export const PairingModeModal: React.FC<PairingModeModalProps> = ({
  isOpen,
  onClose,
  members,
  partnerPairs,
  onAddPair,
  onDeletePair,
}) => {
  const [type, setType] = useState<'partner' | 'breakup'>('partner');
  const [memberId1, setMemberId1] = useState('');
  const [memberId2, setMemberId2] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId1 || !memberId2 || memberId1 === memberId2) return;
    onAddPair(type, memberId1, memberId2);
    setMemberId1('');
    setMemberId2('');
  };

  const getMemberName = (id: string) => {
    return members.find((m) => m.id === id)?.name || '회원';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-indigo-600 text-white">
              <HeartHandshake className="w-4 h-4" />
            </span>
            <h3 className="font-black text-slate-900 text-base">파트너 / 결별 모드 설정</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 overflow-y-auto space-y-4 text-xs flex-1">
          {/* 모드 선택 및 등록 폼 */}
          <form onSubmit={handleAdd} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('partner')}
                className={`py-2 rounded-xl font-black flex items-center justify-center gap-1.5 transition-all ${
                  type === 'partner'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                <HeartHandshake className="w-4 h-4" />
                파트너 모드 (한 팀)
              </button>
              <button
                type="button"
                onClick={() => setType('breakup')}
                className={`py-2 rounded-xl font-black flex items-center justify-center gap-1.5 transition-all ${
                  type === 'breakup'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                <HeartCrack className="w-4 h-4" />
                결별 모드 (같은 경기 배제)
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">회원 1</label>
                <select
                  value={memberId1}
                  onChange={(e) => setMemberId1(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold"
                  required
                >
                  <option value="">회원 선택</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.rank}조)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">회원 2</label>
                <select
                  value={memberId2}
                  onChange={(e) => setMemberId2(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold"
                  required
                >
                  <option value="">회원 선택</option>
                  {members.filter((m) => m.id !== memberId1).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.rank}조)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl shadow-xs"
            >
              페어 등록
            </button>
          </form>

          {/* 등록된 목록 */}
          <div>
            <h4 className="font-bold text-slate-700 mb-2">등록된 페어 목록 ({partnerPairs.length}개)</h4>
            {partnerPairs.length === 0 ? (
              <div className="p-6 text-center text-slate-400">등록된 파트너나 결별 페어가 없습니다.</div>
            ) : (
              <div className="space-y-1.5">
                {partnerPairs.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          p.type === 'partner' ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.type === 'partner' ? '파트너' : '결별'}
                      </span>
                      <span className="font-extrabold text-slate-900">
                        {getMemberName(p.memberId1)} & {getMemberName(p.memberId2)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeletePair(p.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-black text-xs"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
