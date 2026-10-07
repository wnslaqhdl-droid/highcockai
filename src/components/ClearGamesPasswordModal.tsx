import React, { useState } from 'react';
import {
  AlertTriangle,
  KeyRound,
  Lock,
  ShieldAlert,
  ShieldCheck,
  X,
  Eye,
  EyeOff,
  Trash2,
  Settings,
} from 'lucide-react';

interface ClearGamesPasswordModalProps {
  isOpen: boolean;
  date: string;
  gameCount: number;
  hasAdminCode: boolean;
  onClose: () => void;
  onConfirmClear: (adminCode: string) => Promise<void>;
  onSetCodeAndClear: (newAdminCode: string) => Promise<void>;
  onOpenSessionSettings?: () => void;
}

export const ClearGamesPasswordModal: React.FC<ClearGamesPasswordModalProps> = ({
  isOpen,
  date,
  gameCount,
  hasAdminCode,
  onClose,
  onConfirmClear,
  onSetCodeAndClear,
  onOpenSessionSettings,
}) => {
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();

    if (!trimmed) {
      setErrorMsg('당일 운동 코드를 먼저 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      if (hasAdminCode) {
        // 이미 코드가 설정되어 있는 경우 검증 및 삭제
        await onConfirmClear(trimmed);
      } else {
        // 코드가 없는 경우 새 코드로 등록 후 삭제
        await onSetCodeAndClear(trimmed);
      }
      setCode('');
    } catch (err: any) {
      setErrorMsg(err.message || '당일 운동 코드가 일치하지 않습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setErrorMsg('');
    setShowPassword(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-3 sm:p-4 flex min-h-full items-center justify-center animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 my-auto flex flex-col max-h-[calc(100dvh-2rem)] overflow-hidden">
        {/* 모달 헤더 */}
        <div className="shrink-0 p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 bg-rose-50/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-600 text-white shadow-2xs">
              <Trash2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {hasAdminCode ? '게임 전체 삭제 (보안 인증)' : '게임 전체 삭제 (운동 코드 필요)'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {date} 운동 세션 • 총 {gameCount}경기 일괄 삭제
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
            {/* 위험 경고 배너 */}
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-rose-900 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>주의: 생성된 모든 게임({gameCount}경기)이 완전히 삭제됩니다</span>
              </div>
              <p className="text-[11px] text-rose-800 leading-relaxed pl-5">
                삭제 시 모든 참여 회원의 금일 배정 및 진행 게임 수가 0으로 리셋되며, 코트 대기열이 초기화됩니다. 이 작업은 되돌릴 수 없습니다.
              </p>
            </div>

            {/* 당일 운동 코드 상태별 안내 및 입력 안내 */}
            {hasAdminCode ? (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>실수 방지 안전 잠금</span>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  실수로 인한 전체 삭제를 방지하기 위해 <strong>당일 운동 코드</strong>를 입력해야만 삭제를 진행할 수 있습니다.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] space-y-1.5">
                <div className="font-black flex items-center gap-1.5 text-amber-950">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>당일 운동 코드가 설정되어 있지 않습니다</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  실수로 게임이 통째로 삭제되는 사고를 방지하기 위해, <strong>먼저 당일 운동 코드를 입력하여 설정한 후에만</strong> 삭제가 가능하도록 보호하고 있습니다.
                </p>
                <p className="text-[10px] text-amber-700 font-semibold">
                  💡 아래에 앞으로 사용할 코드를 입력하시면 오늘 세션에 코드가 등록되며 전체 삭제가 진행됩니다.
                </p>
              </div>
            )}

            {/* 코드 입력 필드 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                  {hasAdminCode ? '당일 운동 코드 확인' : '새로 설정할 당일 운동 코드'}
                </span>
                {!hasAdminCode && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                    코드 필수 입력
                  </span>
                )}
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder={
                    hasAdminCode
                      ? '당일 운동 코드를 입력하세요'
                      : '등록할 새 당일 운동 코드 입력 (예: 1234)'
                  }
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-center"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  title={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                {hasAdminCode
                  ? '오늘 운동 세션 생성 시 설정한 운영 코드를 입력해주세요.'
                  : '설정된 코드는 향후 운영진 전환 및 대진표 관리 시 사용됩니다.'}
              </p>
            </div>

            {/* 에러 메시지 알림 */}
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-in shake duration-150">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 코드가 없는 경우 별도 설정 안내 링크 */}
            {!hasAdminCode && onOpenSessionSettings && (
              <div className="text-center pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onOpenSessionSettings}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-emerald-700 underline transition-colors cursor-pointer"
                >
                  <Settings className="w-3 h-3" />
                  [당일 운동 관리]에서 먼저 운영 코드 설정하기
                </button>
              </div>
            )}
          </div>

          {/* 모달 푸터 버튼 */}
          <div className="shrink-0 p-4 sm:px-5 py-3 border-t border-slate-100 bg-slate-50/90 flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>
                {isLoading
                  ? '처리 중...'
                  : hasAdminCode
                  ? '코드 확인 및 전체 삭제'
                  : '코드 설정 후 전체 삭제'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
