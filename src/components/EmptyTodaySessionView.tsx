import React from 'react';
import {
  Calendar,
  CalendarPlus,
  History,
  RefreshCw,
  Users,
  Shield,
  BookOpen,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';

interface EmptyTodaySessionViewProps {
  viewMode: 'admin' | 'participant';
  todayDate: string;
  currentDate?: string;
  previousDate?: string;
  onSelectDate: (date: string) => void;
  onCreateSession: () => void;
  onRefresh: () => void;
  isSyncing: boolean;
  onSwitchMode: (mode: 'admin' | 'participant') => void;
  onOpenManual?: () => void;
  onOpenRegistry?: () => void;
}

export const EmptyTodaySessionView: React.FC<EmptyTodaySessionViewProps> = ({
  viewMode,
  todayDate,
  previousDate,
  onSelectDate,
  onCreateSession,
  onRefresh,
  isSyncing,
  onSwitchMode,
  onOpenManual,
  onOpenRegistry,
}) => {
  const isParticipant = viewMode === 'participant';

  return (
    <div className="w-full max-w-3xl mx-auto py-8 sm:py-16 px-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10 text-center relative">
        {/* 상단 장식용 배경 하이라이트 */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />

        {/* 상단 모드 안내 뱃지 */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-6 border shadow-2xs">
          {isParticipant ? (
            <span className="bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-sky-600" />
              회원 모드 (참가자 뷰어)
            </span>
          ) : (
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              운영진 모드 (경기 관리)
            </span>
          )}
          <span className="text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            오늘 날짜: <strong className="text-slate-800">{todayDate}</strong>
          </span>
        </div>

        {/* 메인 비주얼 아이콘 */}
        <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center mb-6 shadow-inner transition-transform hover:scale-105 duration-200 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
          {isParticipant ? (
            <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 stroke-[1.75]" />
          ) : (
            <CalendarPlus className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600 stroke-[1.75]" />
          )}
        </div>

        {/* 메인 타이틀: 사용자 요청 문구 정확히 적용 */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug mb-3">
          {isParticipant
            ? '아직 운동이 없습니다. 운영진에게 요청하여 새 운동을 생성하세요'
            : '아직 새로운 운동이 없습니다. 새로운 운동을 만들어 주세요'}
        </h2>

        {/* 부가 설명 문구 */}
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mb-8 leading-relaxed">
          {isParticipant ? (
            <>
              오늘(<strong className="text-slate-800">{todayDate}</strong>) 개설된 배드민턴 운동 세션이 없습니다.
              운영진이 운동을 생성하면 대진표와 코트 현황이 자동으로 표시됩니다.
            </>
          ) : (
            <>
              오늘(<strong className="text-slate-800">{todayDate}</strong>) 등록된 운동 세션이 없습니다.
              아래 <strong>[새로운 운동 만들기]</strong> 버튼을 눌러 오늘 운동의 코트와 참여 인원을 설정해 주세요.
            </>
          )}
        </p>

        {/* 주요 액션 버튼 영역 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
          {/* 운영진 모드 전용: 새로운 운동 만들기 버튼 */}
          {!isParticipant && (
            <button
              type="button"
              onClick={onCreateSession}
              className="w-full sm:w-auto flex-1 min-w-[200px] px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-sm sm:text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
            >
              <CalendarPlus className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>새로운 운동 만들기</span>
            </button>
          )}

          {/* 직전(yyyy-mm-dd) 운동 기록 보기 버튼 */}
          {previousDate ? (
            <button
              type="button"
              onClick={() => onSelectDate(previousDate)}
              className={`w-full sm:w-auto flex-1 min-w-[200px] px-6 py-3.5 rounded-2xl font-black text-sm sm:text-base transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                isParticipant
                  ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 border border-slate-300'
              }`}
            >
              <History className="w-5 h-5 text-current shrink-0" />
              <span>직전({previousDate}) 운동 기록 보기</span>
              <ArrowRight className="w-4 h-4 text-current shrink-0" />
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full sm:w-auto flex-1 px-6 py-3.5 rounded-2xl bg-slate-100 text-slate-400 font-bold text-sm cursor-not-allowed border border-slate-200"
            >
              이전 운동 기록 없음
            </button>
          )}
        </div>

        {/* 하단 보조 액션 및 유용한 도구 바로가기 */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500">
          {/* 동기화 새로고침 버튼 */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{isSyncing ? '확인 중...' : '운동 상태 다시 확인'}</span>
          </button>

          {/* 회원 모드인 경우 운영진 모드 전환 바로가기 링크 */}
          {isParticipant ? (
            <button
              type="button"
              onClick={() => onSwitchMode('admin')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>운영진 모드로 전환</span>
            </button>
          ) : (
            <>
              {onOpenRegistry && (
                <button
                  type="button"
                  onClick={onOpenRegistry}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>회원 명부 관리</span>
                </button>
              )}
              {onOpenManual && (
                <button
                  type="button"
                  onClick={onOpenManual}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>이용 매뉴얼</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
