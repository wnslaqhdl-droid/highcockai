import React from 'react';
import { Game, Member, Court } from '../types';
import { X, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, TrendingUp } from 'lucide-react';
import { getRankScore } from '../utils/badmintonLogic';

interface AIDiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  members: Member[];
  courts: Court[];
}

export const AIDiagnosisModal: React.FC<AIDiagnosisModalProps> = ({
  isOpen,
  onClose,
  games,
  members,
}) => {
  if (!isOpen) return null;

  // 진단 통계 계산
  const totalGames = games.length;
  let totalScoreDiff = 0;
  let maxScoreDiff = 0;

  games.forEach((g) => {
    const t1 = getRankScore(g.team1[0].rank) + getRankScore(g.team1[1].rank);
    const t2 = getRankScore(g.team2[0].rank) + getRankScore(g.team2[1].rank);
    const diff = Math.abs(t1 - t2);
    totalScoreDiff += diff;
    if (diff > maxScoreDiff) maxScoreDiff = diff;
  });

  const avgDiff = totalGames > 0 ? (totalScoreDiff / totalGames).toFixed(1) : '0';
  // 100점 만점 밸런스 점수 (diff가 0이면 100점, 평균 차이 1점당 -10점)
  const balanceScore = totalGames > 0 ? Math.max(60, Math.min(100, Math.round(100 - parseFloat(avgDiff) * 12))) : 100;

  // 회원별 경기 수 편차
  const activeMembers = members.filter((m) => m.status !== 'left');
  const gameCounts = activeMembers.map((m) => m.todayGamesCount || 0);
  const minGames = gameCounts.length > 0 ? Math.min(...gameCounts) : 0;
  const maxGames = gameCounts.length > 0 ? Math.max(...gameCounts) : 0;
  const gameSpread = maxGames - minGames;

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg">AI 대진표 밸런스 정밀 진단</h3>
              <p className="text-xs text-slate-500">실시간 급수 밸런스 및 출전 기회 공정성 분석</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs overflow-y-auto flex-1">
          {/* 점수 요약 배너 */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-emerald-800 font-bold text-xs block">AI 황금 밸런스 지수</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-950">{balanceScore}점</span>
              <span className="text-[11px] text-emerald-700 block mt-0.5 font-medium">
                {balanceScore >= 90 ? '🌟 완벽한 황금 밸런스 매칭입니다!' : balanceScore >= 80 ? '👍 매우 균형 잡힌 대진입니다.' : '⚖️ 팀간 점수 차이를 조정하면 더 흥미진진해집니다.'}
              </span>
            </div>
            <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md border-4 border-emerald-200">
              {balanceScore}
            </div>
          </div>

          {/* 주요 통계 카드 */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] block font-bold">생성된 총 경기</span>
              <span className="text-base font-black text-slate-900 mt-0.5 block">{totalGames}경기</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] block font-bold">팀간 평균 실력차</span>
              <span className="text-base font-black text-slate-900 mt-0.5 block">{avgDiff}점</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] block font-bold">출전 수 최대 편차</span>
              <span className="text-base font-black text-slate-900 mt-0.5 block">{gameSpread}회</span>
            </div>
          </div>

          {/* AI 추천 의견 */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              AI 운영진 추천 의견
            </span>
            <ul className="list-disc list-inside text-slate-600 space-y-1 text-[11px] leading-relaxed">
              <li>
                {gameSpread <= 1
                  ? '모든 회원의 게임 수가 매우 균일하게 배정되어 있습니다.'
                  : `최대 게임 수(${maxGames}회)와 최소 게임 수(${minGames}회) 간에 ${gameSpread}회 차이가 납니다. 대기 중인 회원을 다음 경기에 우선 배정하세요.`}
              </li>
              <li>
                {maxScoreDiff <= 1
                  ? '모든 게임의 양 팀 급수 합이 1점 이하로 대등합니다.'
                  : `일부 경기에서 팀 간 실력 차이가 발생했습니다. [선수 맞바꿈] 기능으로 밸런스를 조율해보세요.`}
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-black text-xs shadow-xs"
          >
            확인 완료
          </button>
        </div>
      </div>
    </div>
  );
};
