import React, { useState } from 'react';
import { X, Lock, KeyRound } from 'lucide-react';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  correctCode: string;
  onSuccess: () => void;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  isOpen,
  onClose,
  correctCode,
  onSuccess,
}) => {
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim() === correctCode.trim()) {
      onSuccess();
      onClose();
      setCode('');
      setErrorMsg('');
    } else {
      setErrorMsg('운영 코드가 일치하지 않습니다. 다시 확인해주세요.');
    }
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl max-w-xs w-full p-5 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-slate-900 text-white">
              <Lock className="w-4 h-4" />
            </span>
            <h3 className="font-black text-slate-900 text-sm sm:text-base">운영진 인증</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          {errorMsg && (
            <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-bold text-[11px]">
              {errorMsg}
            </div>
          )}
          <div>
            <label className="font-bold text-slate-700 block mb-1">운영 코드 (PIN)</label>
            <input
              type="password"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setErrorMsg('');
              }}
              placeholder="운영 코드를 입력하세요"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center tracking-widest text-sm focus:outline-none focus:border-emerald-500"
              autoFocus
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
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
              확인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
