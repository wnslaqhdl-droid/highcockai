import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  Download,
  BookOpen,
  Shield,
  Smartphone,
  Users,
  Calendar,
  Layers,
  RefreshCw,
  Clock,
  Check,
  Sparkles,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'admin' | 'participant';
}

export const ManualModal: React.FC<ManualModalProps> = ({
  isOpen,
  onClose,
  mode = 'admin',
}) => {
  const isAdmin = mode === 'admin';
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // PDF 다운로드 (html2canvas + jsPDF)
  const handleDownloadPDF = async () => {
    if (!documentRef.current || isExporting) return;
    setIsExporting(true);

    try {
      const element = documentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Additional pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const filename = isAdmin ? '하이콕_운영진_매뉴얼.pdf' : '하이콕_참가자_이용안내서.pdf';
      pdf.save(filename);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('PDF generation error:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  // 브라우저 네이티브 인쇄 / PDF 저장
  const handleNativePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="bg-slate-100 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* 모달 상단 툴바 (인쇄 시 숨김) */}
        <div className="bg-white px-4 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl text-white flex items-center justify-center shadow-xs ${
                isAdmin ? 'bg-emerald-600' : 'bg-blue-600'
              }`}
            >
              {isAdmin ? <Shield className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                {isAdmin ? '하이콕 운영진 매뉴얼' : '하이콕 참가자 이용 안내서'}
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isAdmin
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}
                >
                  {isAdmin ? '운영진 모드' : '참가자 모드'}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {isAdmin
                  ? '모임 생성, 캡쳐 명단 자동 추출, 대진표 제어 및 코트 실시간 운영 가이드'
                  : '스마트폰 실시간 경기 조회, 다음 출전 경기 알림 및 출전 수칙 안내'}
              </p>
            </div>
          </div>

          {/* 액션 버튼 그룹 */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* PDF 다운로드 버튼 */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-xs disabled:opacity-50 text-white ${
                isAdmin
                  ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
              title="A4 규격 PDF 파일 다운로드"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>PDF 생성 중...</span>
                </>
              ) : exportSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>다운로드 완료!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{isAdmin ? '운영진 매뉴얼 PDF' : '참가자 안내서 PDF'}</span>
                </>
              )}
            </button>

            {/* 브라우저 인쇄 버튼 */}
            <button
              type="button"
              onClick={handleNativePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors border border-slate-200"
              title="브라우저 인쇄 다이얼로그 (A4 출력)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">인쇄</span>
            </button>

            {/* 닫기 버튼 */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 본문 스크롤 컨테이너 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 print:p-0 print:overflow-visible bg-slate-200/60">
          
          {/* 인쇄/다운로드 타겟 문서 (A4 용지 스타일) */}
          <div
            ref={documentRef}
            className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md border border-slate-200/90 p-6 sm:p-12 text-slate-800 space-y-10 print:shadow-none print:border-none print:p-0 print:rounded-none"
            style={{ fontFamily: 'Pretendard, system-ui, -apple-system, sans-serif' }}
          >
            {/* ========================================================= */}
            {/* [1] 운영진 모드: 운영진 전용 매뉴얼                          */}
            {/* ========================================================= */}
            {isAdmin ? (
              <>
                {/* 운영진 문서 헤더 타이틀 */}
                <div className="border-b-2 border-slate-900 pb-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black tracking-wide border border-emerald-200">
                          TEAM HIGHCOCK
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">
                          운영진 전용 관리 가이드북
                        </span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        🏸 하이콕 운영진 매뉴얼
                      </h1>
                      <p className="text-sm text-slate-500 font-medium">
                        대진표 자동화 · 캡쳐 AI 자동 분석 · 꼬깔 코트 회전 · 급수 밸런스 · 실시간 동기화
                      </p>
                    </div>
                    <div className="hidden sm:block text-right text-xs text-slate-400">
                      <div className="font-semibold text-slate-600">하이콕 클럽 운영 시스템</div>
                      <div>최종 업데이트: 2026. 09.</div>
                    </div>
                  </div>

                  {/* 핵심 요약 배너 */}
                  <div className="mt-4 p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-center gap-2 font-medium">
                    <Shield className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      본 매뉴얼은 <strong>클럽 운영진 전용</strong> 가이드로, 모임 세팅, 캡쳐 명단 추출, 꼬깔 코트 연동 및 대진표 제어의 전 과정을 안내합니다.
                    </span>
                  </div>
                </div>

                {/* 섹션 1. 화면 구성 및 주요 기능 */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-1.5 border-b-2 border-emerald-600">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-black">
                      1
                    </span>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">
                      화면 구성 및 3대 핵심 작업 영역
                    </h2>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    운영진 모드는 <strong>상단 제어 바</strong>와 현장 운영을 직관적으로 수행할 수 있는 <strong>3분할 핵심 영역(좌측·상단 코트·우측 게임)</strong>으로 설계되어 있습니다.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <strong className="text-slate-900 font-bold block flex items-center gap-1.5 text-xs">
                        <Users className="w-4 h-4 text-emerald-600" />
                        ① 좌측: 참여 명단
                      </strong>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        • 도착 순번, 이름, 급수(S~F조), 성별, 콕 제출 여부 확인<br />
                        • 실시간 상태 토글: <strong>대기 / 게임중 / 휴식 / 레슨 / 퇴장</strong><br />
                        • 급수 미확인 신규회원 반짝임 강조 및 즉시 수정<br />
                        • 회원 4명 직접 선택 후 <strong>[선택 인원으로 게임 생성]</strong>
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <strong className="text-slate-900 font-bold block flex items-center gap-1.5 text-xs">
                        <Layers className="w-4 h-4 text-emerald-600" />
                        ② 상단: 코트 현황 & 꼬깔
                      </strong>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        • 코트별 현재 진행 중 경기 및 직후 입장 대기 경기 표시<br />
                        • <strong>체육관 꼬깔 순서 시각화</strong>: 우리 모임 꼬깔/타 모임 차례 표시<br />
                        • 코트 클릭 시 <strong>[경기 종료 및 다음 대기팀 입장]</strong> 원클릭 회전<br />
                        • 점유 코트 수 기반 예상 시각 자동 산출
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <strong className="text-slate-900 font-bold block flex items-center gap-1.5 text-xs">
                        <Zap className="w-4 h-4 text-emerald-600" />
                        ③ 우측: 게임 목록
                      </strong>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        • 오늘 생성된 모든 경기 순번(#1, #2...), 팀 구성, 복식 유형<br />
                        • <strong>자동 게임 생성</strong>(황금 밸런스, 남복/여복 생성)<br />
                        • <strong>수동 매칭</strong> 및 선수 클릭 시 <strong>스왑/대기자 교체</strong><br />
                        • 개별 경기의 [게임 시작] / [게임 종료] 직접 제어
                      </p>
                    </div>
                  </div>
                </section>

                {/* 섹션 2. 모임 시작 초기 세팅 */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-1.5 border-b-2 border-emerald-600">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-black">
                      2
                    </span>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">
                      모임 시작 시 초기 세팅 (4단계)
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                        <Calendar className="w-4 h-4" />
                        <span>1단계: 새 운동 생성 (캡쳐 AI 자동 분석 지원)</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        헤더의 <strong>[운동 관리]</strong> → [새로운 운동 생성]을 엽니다. 참석자 목록 및 게스트 댓글 캡쳐 화면을 업로드하면 <strong>일시, 정회원, 게스트(이름G)가 한 번에 자동 추출</strong>됩니다. 운영 코드를 설정해 모임 보안을 유지합니다.
                      </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                        <Users className="w-4 h-4" />
                        <span>2단계: 출석 접수 및 도착 순번 순차 배정</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        캡쳐 생성 또는 일괄 등록된 회원은 기본 상태가 <strong>‘퇴장’</strong>으로 등록됩니다. 체육관에 회원이 도착하는 순서대로 <strong>‘퇴장’ → ‘대기’</strong>로 변경하면 <strong>도착한 순서대로 1번, 2번, 3번... 순번이 자동 배정</strong>됩니다.
                      </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                        <Layers className="w-4 h-4" />
                        <span>3단계: 코트 등록 및 꼬깔 배정</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        코트 패널에서 <strong>[+ 코트 추가]</strong> 또는 톱니바퀴를 눌러 사용하는 코트 번호와 꼬깔(우리 모임 꼬깔/타 모임 꼬깔)을 설정합니다. 타 모임 꼬깔 차례에는 예상 대기 시간이 정확히 2배로 계산되어 반영됩니다.
                      </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                        <Smartphone className="w-4 h-4" />
                        <span>4단계: 참여자 전용 링크 공유</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        헤더의 <strong>[참여자 링크 복사]</strong> 버튼을 눌러 단체 카톡방에 공지합니다. 회원들은 로그인이나 앱 설치 없이 링크만으로 본인의 대진표를 실시간 확인합니다.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 섹션 3. 게임 생성 및 대진 관리 */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-1.5 border-b-2 border-emerald-600">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-black">
                      3
                    </span>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">
                      게임 생성 및 스마트 대진 제어
                    </h2>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-bold">① 자동 게임 생성 (스마트 황금 밸런스)</strong>
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black text-[10px]">원클릭 추천</span>
                      </div>
                      <ul className="list-disc list-inside text-slate-600 space-y-1 text-[11px]">
                        <li>오늘 배정된 경기 수가 적고 오래 대기한 회원을 1순위로 자동 선별합니다.</li>
                        <li>급수 가중치를 정밀 계산하여 2팀 간 실력 점수차가 최소화되도록 매칭합니다.</li>
                        <li><strong>남복 전용 / 여복 전용 생성 버튼</strong>: 순수 남복 4인 또는 여복 4인으로 빠르게 구성할 때 원클릭으로 생성됩니다.</li>
                      </ul>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-bold">② 수동 게임 생성 (지정 매칭)</strong>
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-black text-[10px]">자유 매칭</span>
                      </div>
                      <ul className="list-disc list-inside text-slate-600 space-y-1 text-[11px]">
                        <li>좌측 회원 목록에서 참여를 원하는 4명을 직접 클릭한 후 <strong>[선택 인원으로 게임 생성]</strong>을 누르면 즉시 수동 매칭됩니다.</li>
                        <li>우측 [수동 매칭] 버튼을 누르면 추천 밸런스 조합 목록에서 원하는 대진을 선택할 수 있습니다.</li>
                      </ul>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-bold">③ 게임 수정 (선수 교체 및 맞바꿈)</strong>
                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-black text-[10px]">원클릭 수정</span>
                      </div>
                      <ul className="list-disc list-inside text-slate-600 space-y-1 text-[11px]">
                        <li>게임 카드에서 <strong>선수 이름</strong>을 클릭하면 선수 교체 팝업이 열립니다.</li>
                        <li><strong>상대팀 선수와 맞바꿈(스왑)</strong>: 혼복인 경우 성별 밸런스를 위해 동성 선수 간에만 스왑이 활성화됩니다.</li>
                        <li><strong>대기자로 교체</strong>: 현재 대기 중인 회원 중 원하는 선수로 즉시 교체 가능합니다.</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 섹션 4. 실시간 상태 연동 & 카테고리 */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-1.5 border-b-2 border-emerald-600">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-black">
                      4
                    </span>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">
                      회원 상태 카테고리 (5단계) 및 실시간 자동 동기화
                    </h2>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px]">
                      <div className="bg-white p-2.5 rounded-xl border border-emerald-300 shadow-2xs">
                        <span className="font-extrabold text-emerald-700 block text-xs">대기</span>
                        <span className="text-slate-500 text-[10px] mt-0.5 block">출전 대기 완료<br />(게임 배정 대상)</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-blue-400 shadow-2xs bg-blue-50/30">
                        <span className="font-extrabold text-blue-700 block text-xs">게임중</span>
                        <span className="text-slate-500 text-[10px] mt-0.5 block">코트 경기 진행 중<br />(자동 전환)</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-amber-300 shadow-2xs">
                        <span className="font-extrabold text-amber-700 block text-xs">휴식</span>
                        <span className="text-slate-500 text-[10px] mt-0.5 block">체력 회복 중<br />(매칭 자동 제외)</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-purple-300 shadow-2xs">
                        <span className="font-extrabold text-purple-700 block text-xs">레슨</span>
                        <span className="text-slate-500 text-[10px] mt-0.5 block">코치 레슨 중<br />(매칭 자동 제외)</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-300 shadow-2xs">
                        <span className="font-extrabold text-slate-500 block text-xs">퇴장</span>
                        <span className="text-slate-400 text-[10px] mt-0.5 block">미도착 / 귀가<br />(비활성 상태)</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 leading-relaxed text-slate-700 text-[11px]">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>게임 진행 및 종료 시 실시간 자동 전환 시스템</span>
                      </div>
                      <p>
                        • 코트 현황 또는 게임 목록에서 경기가 <strong>‘진행 중(playing)’</strong>으로 시작되면, 출전한 4명의 상태가 회원 명단에서도 실시간으로 <strong>‘게임중’</strong>으로 자동 전환됩니다.<br />
                        • 경기가 <strong>‘종료(ended)’</strong>되면 코트에서 나온 회원은 <strong>자동으로 ‘대기’ 상태로 복귀</strong>합니다.<br />
                        • 진행/배정 게임 수 하단에 <strong>‘게임 중 (6코트)’</strong> 안내와 대기 게임 수가 유지되어 현재 회원의 출전 위치를 한눈에 식별할 수 있습니다.
                      </p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>급수 미확인 신규회원 안내:</strong> 기존 회원 명부에 급수가 없는 신규 회원이 추가되면 명단에 <strong>반짝이는 급수 확인 뱃지</strong>와 <strong>수정(✏️) 버튼 튀는 효과</strong>가 표시됩니다. 수정 버튼을 클릭하여 급수를 확인하면 효과가 즉시 해제됩니다.
                      </span>
                    </div>
                  </div>
                </section>
              </>
            ) : (
              /* ========================================================= */
              /* [2] 참가자 모드: 참가자 전용 이용 안내서                     */
              /* ========================================================= */
              <>
                {/* 참가자 문서 헤더 타이틀 */}
                <div className="border-b-2 border-slate-900 pb-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-black tracking-wide border border-blue-200">
                          TEAM HIGHCOCK
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">
                          참가 회원 전용 모바일 안내서
                        </span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        🏸 하이콕 참가자 이용 안내서
                      </h1>
                      <p className="text-sm text-slate-500 font-medium">
                        스마트폰으로 내 경기 실시간 확인하기 · 복식 유형별 식별 · 출전 대기 수칙
                      </p>
                    </div>
                    <div className="hidden sm:block text-right text-xs text-slate-400">
                      <div className="font-semibold text-slate-600">하이콕 클럽 모바일 뷰어</div>
                      <div>최종 업데이트: 2026. 09.</div>
                    </div>
                  </div>

                  {/* 환영 안내 배너 */}
                  <div className="mt-4 p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-center gap-2 font-medium">
                    <Smartphone className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>
                      하이콕 모바일 뷰어에 오신 것을 환영합니다! 로그인이나 앱 설치 없이 스마트폰 브라우저에서 내 경기와 대기 순번을 바로 확인하실 수 있습니다.
                    </span>
                  </div>
                </div>

                {/* 섹션 1. 개인 맞춤형 조회 방법 */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-1.5 border-b-2 border-blue-600">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-black">
                      1
                    </span>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">
                      내 이름 선택 및 개인 맞춤형 경기 확인 방법
                    </h2>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 text-xs">
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center shrink-0">
                          1
                        </span>
                        <div>
                          <strong className="text-slate-900 text-xs block mb-0.5">상단 [내 이름을 선택하세요] 클릭</strong>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            화면 상단의 드롭다운을 누른 뒤 본인 이름을 선택합니다. (이름 입력 검색을 통해 빠르게 찾을 수 있습니다.)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-blue-200 bg-blue-50/20">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          2
                        </span>
                        <div>
                          <strong className="text-blue-900 text-xs block mb-0.5">최상단 [📌 나의 다음 출전 예정 경기] 카드 고정</strong>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            이름을 선택하면 최상단에 본인이 출전할 <strong>직후 경기 정보</strong>가 큰 글씨로 고정됩니다. 내가 뛸 <strong>코트 번호, 파트너, 상대팀, 예상 시각</strong>을 한눈에 볼 수 있습니다.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center shrink-0">
                          3
                        </span>
                        <div>
                          <strong className="text-slate-900 text-xs block mb-0.5">전체 게임 목록 자동 하이라이트</strong>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            전체 대진표에서도 내가 속한 경기들이 <strong>빛나는 테두리</strong>로 강조되어 오늘 총 몇 경기를 어떤 순서로 뛰게 되는지 손쉽게 파악할 수 있습니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 섹션 2. 복식 유형 색상 식별 */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-1.5 border-b-2 border-blue-600">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-black">
                      2
                    </span>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">
                      복식 유형별 직관적인 색상 구분
                    </h2>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    회원용 화면의 게임 카드는 복잡한 점수차나 운영 정보 대신, 복식 유형을 직관적인 색상 테두리와 배경으로 구분하여 제공합니다.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-blue-50/80 border-2 border-blue-300 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
                      <div className="font-extrabold text-blue-900 flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                        <span>남자 복식 (남복)</span>
                      </div>
                      <p className="text-blue-800 text-[11px] leading-relaxed">
                        대진 카드가 시원한 <strong>파란색</strong> 테두리와 은은한 블루 배경으로 일괄 표시되어 남복 경기임을 즉시 식별할 수 있습니다.
                      </p>
                    </div>

                    <div className="bg-rose-50/80 border-2 border-rose-300 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
                      <div className="font-extrabold text-rose-900 flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                        <span>여자 복식 (여복)</span>
                      </div>
                      <p className="text-rose-800 text-[11px] leading-relaxed">
                        대진 카드가 화사한 <strong>로즈/빨간색</strong> 테두리와 은은한 핑크 배경으로 일괄 표시되어 여복 경기임을 쉽게 알아볼 수 있습니다.
                      </p>
                    </div>

                    <div className="bg-slate-50 border-2 border-slate-300 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
                      <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-slate-500"></span>
                        <span>혼합 복식 (혼복)</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        중립적인 슬레이트 배경에 각 선수의 성별 뱃지(남성 파랑, 여성 핑크)가 조화롭게 표기됩니다.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 섹션 3. 참가자 필독 수칙 및 변동 안내 */}
                <section className="space-y-4">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 border-2 border-amber-300 rounded-2xl p-5 sm:p-6 space-y-3.5 text-xs text-amber-950 shadow-xs">
                    <div className="flex items-center gap-2 font-black text-sm text-amber-900 border-b border-amber-200/80 pb-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>📢 [참가자 필독 공지] 예정 코트 및 입장시간 변동 안내</span>
                    </div>

                    <div className="space-y-3 text-[11px] leading-relaxed text-amber-950/90 pl-1">
                      <div className="space-y-1">
                        <strong className="text-amber-900 text-xs block">1. 예상 시각은 고정 확정 시각이 아닙니다.</strong>
                        <p>
                          화면에 표시되는 예정 시간(예: 19:45) 및 코트는 1게임당 약 15분 진행을 기준으로 자동 계산된 <strong>실시간 추정치</strong>입니다.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <strong className="text-amber-900 text-xs block">2. 경기 진행 속도 및 타 모임 꼬깔 회전에 따른 변동</strong>
                        <p>
                          앞선 경기가 일찍 끝나거나 듀스 접전으로 길어질 경우, 또는 체육관 꼬깔 회전(타 모임 차례) 상황에 따라 <strong>실제 입장 시각 및 코트가 5~10분 앞당겨지거나 지연</strong>될 수 있습니다.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <strong className="text-amber-900 text-xs block">3. 다음 순번 출전 대기 수칙 (체육관 이탈 금지)</strong>
                        <p>
                          본인의 대기 순번이 <strong>1~2순위(다음 경기)</strong>로 다가왔을 때는 관중석이나 코트 주변을 벗어나지 마시고, 신속한 경기 진행을 위해 <strong>라켓을 들고 입장을 미리 준비</strong>해 주시기 바랍니다.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <strong className="text-amber-900 text-xs block">4. 희망 경기 및 건의 사항</strong>
                        <p>
                          특정 회원과의 맞대결이나 희망하는 파트너가 있는 경우, 운영진에게 편하게 말씀해 주시면 수동 배정을 검토해 드립니다.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <strong className="text-amber-900 text-xs block">5. 셔틀콕 제출 및 휴식/레슨 알림</strong>
                        <p>
                          체육관 도착 즉시 셔틀콕을 제출해 주시고, 코치 레슨을 받거나 쉬어야 할 때는 운영진에게 알려주시면 대진에서 자동으로 안전하게 제외 및 복귀 처리됩니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* 문서 푸터 공통 */}
            <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-400 space-y-1 print:pt-4">
              <p className="font-semibold text-slate-600">
                {isAdmin ? '🏸 하이콕 운영진 매뉴얼' : '🏸 하이콕 참가자 이용 안내서'}
              </p>
              <p className="text-[11px]">
                TEAM HIGHCOCK · 대진표 자동화 및 코트 점유 관리 시스템
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
