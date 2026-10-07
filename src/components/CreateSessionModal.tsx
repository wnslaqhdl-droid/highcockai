import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, Calendar, Clock, KeyRound, Shield, X, Camera, Sparkles, Upload, Users, AlertCircle, Check } from 'lucide-react';
import { Member } from '../types';

interface CreateSessionModalProps {
  isOpen: boolean;
  todayDate: string;
  availableDates: string[];
  onClose: () => void;
  onCreate: (config: {
    date: string;
    startTime?: string;
    adminCode: string;
    copyPrevious: boolean;
    initialMembers?: Member[];
  }) => Promise<void>;
}

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  isOpen,
  todayDate,
  availableDates,
  onClose,
  onCreate,
}) => {
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [selectedTime, setSelectedTime] = useState(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(Math.floor(now.getMinutes() / 10) * 10).padStart(2, '0');
    return `${hours}:${minutes}`;
  });
  const [adminCode, setAdminCode] = useState('');
  const [confirmAdminCode, setConfirmAdminCode] = useState('');
  const [copyPrevious, setCopyPrevious] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 캡쳐 이미지 분석 상태
  const [screenshots, setScreenshots] = useState<{ id: string; data: string; mimeType: string }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedMembers, setExtractedMembers] = useState<Member[]>([]);
  const [analysisSuccessMsg, setAnalysisSuccessMsg] = useState('');
  const [isCapturePanelOpen, setIsCapturePanelOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 클립보드 붙여넣기(Ctrl+V) 감지
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = reader.result as string;
              setScreenshots((prev) => [
                ...prev,
                { id: `paste-${Date.now()}`, data: base64, mimeType: file.type || 'image/png' },
              ]);
              setIsCapturePanelOpen(true);
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  // AI 캡쳐 분석 실행
  const handleAnalyzeScreenshots = async () => {
    if (screenshots.length === 0) {
      setErrorMsg('분석할 캡처 이미지를 먼저 등록해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg('');
    setAnalysisSuccessMsg('');

    try {
      const res = await fetch('/api/sessions/parse-screenshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: screenshots.map((img) => ({
            mimeType: img.mimeType,
            data: img.data,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.status !== 'ok') {
        throw new Error(data.error || '캡처 이미지 분석에 실패했습니다.');
      }

      const members: Member[] = data.members || [];
      setExtractedMembers(members);
      setAnalysisSuccessMsg(
        `AI 분석 성공! 정회원 ${data.regularCount || 0}명, 게스트 ${data.guestCount || 0}명 (총 ${members.length}명) 추출 완료.`
      );
    } catch (err: any) {
      setErrorMsg(err.message || '캡처 이미지 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      setErrorMsg('운동 일자를 선택해주세요.');
      return;
    }

    if (adminCode.trim().length < 4) {
      setErrorMsg('운영 코드는 4자리 이상 입력해주세요.');
      return;
    }

    if (adminCode !== confirmAdminCode) {
      setErrorMsg('운영 코드 확인이 일치하지 않습니다.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onCreate({
        date: selectedDate,
        startTime: selectedTime || undefined,
        adminCode: adminCode.trim(),
        copyPrevious,
        initialMembers: extractedMembers.length > 0 ? extractedMembers : undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '운동 세션 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-3 sm:p-4 flex items-center justify-center">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* 헤더 */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <PlusCircle className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">새로운 운동 생성</h3>
              <p className="text-xs text-slate-500">캡쳐 AI 자동 분석 및 운영 설정</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 
            [핵심 복구 기능] 캡쳐로 추가 (AI 참석자 & 게스트 추출)
          */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-2xl space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-600 text-white">
                  <Camera className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-black text-emerald-950 text-xs sm:text-sm">화면 캡쳐로 참석자 추가</h4>
                  <p className="text-[11px] text-emerald-800">
                    카카오톡 투표나 게스트 댓글 캡처를 올리면 참석자 명단이 자동 추출됩니다.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCapturePanelOpen(!isCapturePanelOpen);
                  if (!isCapturePanelOpen && screenshots.length === 0) {
                    fileInputRef.current?.click();
                  }
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isCapturePanelOpen ? '캡처 패널 닫기' : '캡처 이미지 등록'}</span>
              </button>
            </div>

            {/* 캡처 등록 & 분석 패널 */}
            {(isCapturePanelOpen || screenshots.length > 0) && (
              <div className="pt-2 border-t border-emerald-200/80 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach((file) => {
                      const reader = new FileReader();
                      reader.onload = () => {
                        setScreenshots((prev) => [
                          ...prev,
                          { id: `file-${Date.now()}-${Math.random()}`, data: reader.result as string, mimeType: file.type },
                        ]);
                      };
                      reader.readAsDataURL(file);
                    });
                  }}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-300 rounded-xl p-3 text-center cursor-pointer hover:bg-emerald-100/50 transition-colors"
                >
                  <Upload className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                  <span className="font-bold text-emerald-900 block">
                    클릭하여 캡처 파일 선택 (또는 Ctrl+V로 붙여넣기)
                  </span>
                </div>

                {screenshots.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {screenshots.map((img) => (
                        <div key={img.id} className="relative w-14 h-14 rounded-lg overflow-hidden border border-emerald-300">
                          <img src={img.data} alt="capture" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setScreenshots((prev) => prev.filter((x) => x.id !== img.id))}
                            className="absolute top-0 right-0 p-0.5 bg-black/60 text-white rounded-bl"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAnalyzeScreenshots}
                      disabled={isAnalyzing}
                      className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>{isAnalyzing ? 'AI 이미지 분석 중...' : `AI 참석자 명단 분석 실행 (${screenshots.length}장)`}</span>
                    </button>
                  </div>
                )}

                {analysisSuccessMsg && (
                  <div className="p-2.5 bg-white border border-emerald-300 rounded-xl text-emerald-900 font-bold space-y-1">
                    <div className="flex items-center gap-1 text-emerald-700">
                      <Check className="w-4 h-4" />
                      <span>{analysisSuccessMsg}</span>
                    </div>
                    {extractedMembers.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1 max-h-24 overflow-y-auto">
                        {extractedMembers.map((m) => (
                          <span key={m.id} className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            {m.name} ({m.rank}조)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">운동 일자</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">시작 시간</label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">운영 코드 (PIN 4자리)</label>
              <input
                type="password"
                placeholder="예: 1234"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">운영 코드 재확인</label>
              <input
                type="password"
                placeholder="운영 코드 확인"
                value={confirmAdminCode}
                onChange={(e) => setConfirmAdminCode(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                required
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 pt-1">
            <input
              type="checkbox"
              checked={copyPrevious}
              onChange={(e) => setCopyPrevious(e.target.checked)}
              className="accent-emerald-600 rounded"
            />
            <span>이전 운동의 코트 설정(코트 개수 및 꼬깔 설정) 유지하기</span>
          </label>
        </form>

        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? '생성 중...' : '운동 생성 완료'}
          </button>
        </div>
      </div>
    </div>
  );
};
