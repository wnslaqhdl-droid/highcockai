import React from 'react';
import { Shield, Smartphone, Calendar, BookOpen, Settings, Users, PlusCircle } from 'lucide-react';

interface HeaderProps {
  mode: 'admin' | 'participant';
  onToggleMode: () => void;
  sessionDate: string;
  sessionStartTime?: string;
  onOpenSessionManage: () => void;
  onOpenManual: () => void;
  onOpenCreateSession?: () => void;
  courtCount: number;
  memberCount: number;
  gameCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onToggleMode,
  sessionDate,
  sessionStartTime,
  onOpenSessionManage,
  onOpenManual,
  onOpenCreateSession,
  courtCount,
  memberCount,
  gameCount,
}) => {
  const isAdmin = mode === 'admin';

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3">
        {/* 로고 & 세션 정보 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-white text-base shadow-sm">
              🏸
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base tracking-tight text-white">
                  하이콕 HighCock
                </span>
                <span className="hidden sm:inline-block text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-md font-semibold border border-emerald-500/30">
                  클럽 운영 시스템
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-400" />
                  {sessionDate} {sessionStartTime && `· ${sessionStartTime}`}
                </span>
                <span className="text-slate-600">|</span>
                <span>코트 {courtCount} · 회원 {memberCount}명 · 경기 {gameCount}개</span>
              </div>
            </div>
          </div>
        </div>

        {/* 우측 조작 버튼 그룹 */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onOpenManual}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="이용 매뉴얼 보기"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">매뉴얼</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={onOpenSessionManage}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="운동 일자 및 세션 관리"
            >
              <Settings className="w-3.5 h-3.5 text-teal-400" />
              <span>운동 관리</span>
            </button>
          )}

          {/* 모드 전환 버튼 */}
          <button
            type="button"
            onClick={onToggleMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-sm cursor-pointer ${
              isAdmin
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
            title={isAdmin ? '참가자 모드로 전환' : '운영진 모드로 전환'}
          >
            {isAdmin ? (
              <>
                <Shield className="w-3.5 h-3.5" />
                <span>운영진 모드</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>참가자 모드</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
