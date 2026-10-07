import React from 'react';
import { LayoutGrid, Users, CalendarDays } from 'lucide-react';

export type MobileSectionTab = 'court' | 'members' | 'games';

interface MobileSectionTabBarProps {
  activeTab: MobileSectionTab;
  onTabChange: (tab: MobileSectionTab) => void;
  courtCount: number;
  memberCount: number;
  gameCount: number;
}

export const MobileSectionTabBar: React.FC<MobileSectionTabBarProps> = ({
  activeTab,
  onTabChange,
  courtCount,
  memberCount,
  gameCount,
}) => {
  return (
    <div className="sticky top-12 z-30 -mx-3 sm:-mx-5 px-3 sm:px-5 py-2 bg-slate-100/95 backdrop-blur-md border-b border-slate-200/80 mb-3 lg:hidden">
      <div className="grid grid-cols-3 gap-1 bg-slate-200/80 p-1 rounded-2xl shadow-inner">
        {/* 1. 코트 현황 탭 */}
        <button
          type="button"
          onClick={() => onTabChange('court')}
          className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 sm:px-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'court'
              ? 'bg-white text-emerald-800 shadow-sm ring-1 ring-black/5 font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 font-bold'
          }`}
          title="코트 현황 보기"
        >
          <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">코트 현황</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-black shrink-0 ${
              activeTab === 'court'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-300/80 text-slate-700'
            }`}
          >
            {courtCount}
          </span>
        </button>

        {/* 2. 참여 명단 탭 */}
        <button
          type="button"
          onClick={() => onTabChange('members')}
          className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 sm:px-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'members'
              ? 'bg-white text-emerald-800 shadow-sm ring-1 ring-black/5 font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 font-bold'
          }`}
          title="참여 명단 보기"
        >
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">참여 명단</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-black shrink-0 ${
              activeTab === 'members'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-300/80 text-slate-700'
            }`}
          >
            {memberCount}
          </span>
        </button>

        {/* 3. 게임 목록 탭 */}
        <button
          type="button"
          onClick={() => onTabChange('games')}
          className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 sm:px-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'games'
              ? 'bg-white text-emerald-800 shadow-sm ring-1 ring-black/5 font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 font-bold'
          }`}
          title="게임 목록 보기"
        >
          <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">게임 목록</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-black shrink-0 ${
              activeTab === 'games'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-300/80 text-slate-700'
            }`}
          >
            {gameCount}
          </span>
        </button>
      </div>
    </div>
  );
};
