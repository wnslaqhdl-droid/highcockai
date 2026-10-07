import React, { useState } from 'react';
import { Court } from '../types';
import { X, Settings2, Trash2 } from 'lucide-react';

interface CourtEditModalProps {
  isOpen: boolean;
  court: Court | null;
  onClose: () => void;
  onSave: (courtId: string, updates: Partial<Court>) => void;
  onDelete?: (courtId: string) => void;
}

export const CourtEditModal: React.FC<CourtEditModalProps> = ({
  isOpen,
  court,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState(court?.name || '');
  const [reservationRatio, setReservationRatio] = useState(court?.reservationRatio || 1);

  if (!isOpen || !court) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-slate-900 text-white">
              <Settings2 className="w-4 h-4" />
            </span>
            <h3 className="font-black text-slate-900 text-base">
              {court.number}번 코트 설정
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">코트 이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`${court.number}번 코트`}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              예약 점유 비율 (꼬깔 비율: 1코트 기준)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="1.0"
              value={reservationRatio}
              onChange={(e) => setReservationRatio(parseFloat(e.target.value) || 1)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              다른 모임과 공유 시 (예: 0.5 = 2게임당 1회 입장)
            </span>
          </div>

          <div className="pt-3 flex items-center justify-between gap-2">
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(court.id);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold"
              >
                코트 삭제
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  onSave(court.id, { name: name.trim() || undefined, reservationRatio });
                  onClose();
                }}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-black hover:bg-slate-800"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
