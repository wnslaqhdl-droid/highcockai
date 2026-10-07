import React from 'react';
import { X, Sparkles, ShieldCheck, Scale, Flame, Clock, Award, Info, Download } from 'lucide-react';
import algorithmPosterImage from '../assets/images/match_algorithm_table_1790832290288.jpg';

interface MatchAlgorithmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MatchAlgorithmModal: React.FC<MatchAlgorithmModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-3 sm:p-5 flex min-h-full items-center justify-center animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 my-auto flex flex-col max-h-[calc(100dvh-2rem)] overflow-hidden">
        {/* 모달 헤더 */}
        <div className="shrink-0 px-4 sm:px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                자동 대진 생성 알고리즘 & 가중치 기준표
              </h3>
              <p className="text-xs text-slate-500">
                공정성, 경기력 밸런스, 연속 출전 방지를 위한 하이콕 매칭 시스템 기준
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모달 본문 (스크롤) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
          {/* 1. 생성된 인포그래픽 표 이미지 */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-950 flex flex-col items-center">
            <div className="w-full bg-slate-900 px-3 py-2 flex items-center justify-between text-slate-300 text-xs font-semibold border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-400" />
                한눈에 보는 알고리즘 요약 포스터
              </span>
              <a
                href={algorithmPosterImage}
                download="hicock-match-algorithm.jpg"
                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700"
              >
                <Download className="w-3 h-3" />
                이미지 저장
              </a>
            </div>
            <img
              src={algorithmPosterImage}
              alt="하이콕 자동 대진 생성 알고리즘 가중치 기준표"
              className="w-full max-h-[480px] object-contain bg-slate-900"
            />
          </div>

          {/* 2. 사전 필수 원칙 (하드 필터링) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>1단계: 사전 필수 원칙 (하드 필터링)</span>
            </div>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-1">
              <li>
                <strong>동시 출전 방지:</strong> 물리적으로 동일 시간대에 여러 코트에 동시 투입될 수 없습니다.
              </li>
              <li>
                <strong>미배정 인원 100% 필수 포함:</strong> 다음 경기 배정이 없는 인원(0/0, 1/1 등)을 우선 선발하며, 4의 배수가 아니더라도 미배정 인원을 필수 포함하고 가장 오래 휴식한 기배정 회원을 충원합니다.
              </li>
              <li>
                <strong>정규 성별 원칙:</strong> 남복(4남), 여복(4여), 혼복(2남2녀)을 최우선 구성하며 3남1여/1남3여는 인원이 극단적으로 부족할 때만 허용됩니다.
              </li>
            </ul>
          </div>

          {/* 3. 가중치 점수표 상세 */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>2단계: 조합 평가 가중치 점수표 (기본 1,000점 기준)</span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="p-2.5">구분</th>
                    <th className="p-2.5">고려 항목 및 조건</th>
                    <th className="p-2.5 text-center">가중치</th>
                    <th className="p-2.5 hidden sm:table-cell">목적 및 효과</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50 bg-emerald-50/30">
                    <td className="p-2.5 font-bold text-emerald-950">성별 종목<br /><span className="text-[10px] text-emerald-700 font-semibold">(동일 성별 우선)</span></td>
                    <td className="p-2.5">
                      • 남복(4남) / 여복(4여) 인원 가능 시: <strong>+1,000점</strong><br />
                      • 혼복(2남2녀) 인원 부족 또는 혼복 희망 시: <strong>+300~+350점</strong><br />
                      • 남복/여복 가능한데 비희망 혼복 매칭 시: <strong>-1,000점 감점</strong>
                    </td>
                    <td className="p-2.5 text-center font-black text-emerald-600">+1,000점<br /><span className="text-[10px] text-rose-600 font-bold">(-1,000점)</span></td>
                    <td className="p-2.5 text-slate-500 hidden sm:table-cell">동일 성별 복식 경기 매칭 원칙 최우선 준수</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 bg-rose-50/30">
                    <td className="p-2.5 font-bold text-rose-900">중복 방지</td>
                    <td className="p-2.5">
                      <strong>참가자 개인 기준 최근 6게임 내</strong> 동일 4인 재출전 (3명 중복 시 -250점)
                    </td>
                    <td className="p-2.5 text-center font-black text-rose-600">-5,000점</td>
                    <td className="p-2.5 text-slate-500 hidden sm:table-cell">
                      전체 순서가 아닌 개인 출전 이력 기준 동일 멤버 연속 매칭 원천 차단
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-900">중복 방지</td>
                    <td className="p-2.5">과거 상대/파트너로 만난 횟수</td>
                    <td className="p-2.5 text-center font-bold text-amber-700">회당 -20점</td>
                    <td className="p-2.5 text-slate-500 hidden sm:table-cell">클럽 내 다양한 회원과 교류</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-indigo-900">팀 밸런스</td>
                    <td className="p-2.5">
                      팀1 가중치 합 vs 팀2 가중치 합 차이(diff)<br />
                      • 0점차 (완벽 균형): <strong>+120점</strong><br />
                      • 1점차: <strong>+90점</strong> | 2점차: <strong>+60점</strong><br />
                      • 3점차 이상: <strong>점수차 × -20점</strong>
                    </td>
                    <td className="p-2.5 text-center font-black text-indigo-600">+60~+120점</td>
                    <td className="p-2.5 text-slate-500 hidden sm:table-cell">
                      치열하고 팽팽한 경기 보장<br />(S:8, A:6, B:5, C:4, D:3, E:2, F:1)
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-900">실력 편차</td>
                    <td className="p-2.5">최고 급수와 최저 급수 격차 2점 이내</td>
                    <td className="p-2.5 text-center font-bold text-emerald-600">+40점</td>
                    <td className="p-2.5 text-slate-500 hidden sm:table-cell">원사이드 경기 방지</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-emerald-900">휴식 보장</td>
                    <td className="p-2.5">
                      1경기 이상 휴식 후 출전: <strong>+100점</strong><br />
                      직전 게임 연속 출전: <strong>-40점 감점</strong>
                    </td>
                    <td className="p-2.5 text-center font-bold text-emerald-600">+100 / -40점</td>
                    <td className="p-2.5 text-slate-500 hidden sm:table-cell">체력 안배 및 부상 방지</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-900">공정성</td>
                    <td className="p-2.5">금일 총 배정 게임 수 합계</td>
                    <td className="p-2.5 text-center font-bold text-blue-700">게임수 × -30점</td>
                    <td className="p-2.5 text-slate-500 hidden sm:table-cell">적게 뛴 회원 우선 선발</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-900">대기 시간</td>
                    <td className="p-2.5">코트 점유율 대비 대기 게임 수</td>
                    <td className="p-2.5 text-center font-bold text-emerald-600">대기수 × +40점</td>
                    <td className="p-2.5 text-slate-500 hidden sm:table-cell">오래 기다린 대기자 우대</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-900">선호도</td>
                    <td className="p-2.5">선호 게임 유형 일치</td>
                    <td className="p-2.5 text-center font-bold text-slate-700">+40~+50점</td>
                    <td className="p-2.5 text-slate-500 hidden sm:table-cell">선호 종목 만족도 제고</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="shrink-0 p-3 sm:px-6 sm:py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            하이콕(Hi-Cock) 실시간 스마트 매칭 엔진
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
