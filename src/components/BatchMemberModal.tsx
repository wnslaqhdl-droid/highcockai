import React, { useState, useRef, useEffect } from 'react';
import { Member, MemberRank, MemberDiffItem } from '../types';
import { X, Camera, Sparkles, AlertCircle, ArrowRight, Check, Upload, Trash2 } from 'lucide-react';

interface BatchMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (members: Member[], replaceExisting: boolean) => void;
  existingMembers: Member[];
}

export const BatchMemberModal: React.FC<BatchMemberModalProps> = ({
  isOpen,
  onClose,
  onApply,
  existingMembers,
}) => {
  const [text, setText] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [screenshots, setScreenshots] = useState<{ id: string; data: string; mimeType: string }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isScreenshotSectionOpen, setIsScreenshotSectionOpen] = useState(false);

  // 달라진 부분 확인 모달 상태
  const [diffModal, setDiffModal] = useState<{
    isOpen: boolean;
    modified: MemberDiffItem[];
    added: Member[];
    missing: Member[];
    candidateMembers: Member[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 클립보드 이미지 붙여넣기(Ctrl+V) 감지
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
              setIsScreenshotSectionOpen(true);
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

  // 기존 등록값과 분석값 비교
  const computeDiff = (candidateMembers: Member[]) => {
    const norm = (s: string) => (s || '').trim().toLowerCase();
    const existingMap = new Map<string, Member>();
    existingMembers.forEach((m) => existingMap.set(norm(m.name), m));

    const modified: MemberDiffItem[] = [];
    const added: Member[] = [];
    const candidateNameSet = new Set<string>();

    candidateMembers.forEach((newM) => {
      const normName = norm(newM.name);
      candidateNameSet.add(normName);
      const existing = existingMap.get(normName);

      if (existing) {
        const rankChanged = existing.rank !== newM.rank;
        const genderChanged = existing.gender !== newM.gender;
        if (rankChanged || genderChanged) {
          modified.push({
            id: existing.id,
            name: existing.name,
            existingRank: existing.rank,
            newRank: newM.rank,
            existingGender: existing.gender,
            newGender: newM.gender,
            rankChanged,
            genderChanged,
            selected: true,
            rawNewMember: newM,
          });
        }
      } else {
        added.push(newM);
      }
    });

    const missing = existingMembers.filter((m) => !candidateNameSet.has(norm(m.name)));

    return { modified, added, missing };
  };

  // AI 캡처 분석 실행
  const handleAnalyzeScreenshots = async () => {
    if (screenshots.length === 0) {
      setErrorMsg('분석할 캡처 이미지를 먼저 선택해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg('');
    setSuccessMsg('');

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

      const parsedMembers: Member[] = data.members || [];
      if (parsedMembers.length === 0) {
        throw new Error('캡처 화면에서 인식된 회원이 없습니다.');
      }

      // 텍스트 영역에도 자동 채우기
      const menList = parsedMembers.filter((m) => m.gender === 'M').map((m) => `${m.name}${m.rank}`).join(' ');
      const womenList = parsedMembers.filter((m) => m.gender === 'F').map((m) => `${m.name}${m.rank}`).join(' ');
      let generatedText = '';
      if (menList) generatedText += `남\n${menList}\n\n`;
      if (womenList) generatedText += `여\n${womenList}`;
      setText(generatedText.trim());

      setSuccessMsg(`AI 캡처 분석 완료! 총 ${parsedMembers.length}명 추출.`);

      // 기존 등록값과 달라진 부분이 있다면 확인창 띄우기
      if (existingMembers && existingMembers.length > 0) {
        const diff = computeDiff(parsedMembers);
        if (diff.modified.length > 0 || diff.added.length > 0 || diff.missing.length > 0) {
          setDiffModal({
            isOpen: true,
            modified: diff.modified,
            added: diff.added,
            missing: diff.missing,
            candidateMembers: parsedMembers,
          });
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || '캡처 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 텍스트 파싱
  const parseTextInput = (): Member[] => {
    const lines = text.split('\n');
    let currentGender: 'M' | 'F' = 'M';
    const parsed: Member[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (trimmed === '남' || trimmed.startsWith('남(') || trimmed.startsWith('남:')) {
        currentGender = 'M';
        return;
      }
      if (trimmed === '여' || trimmed.startsWith('여(') || trimmed.startsWith('여:')) {
        currentGender = 'F';
        return;
      }

      const tokens = trimmed.split(/[\s,]+/);
      tokens.forEach((token) => {
        if (!token) return;
        // e.g., 홍길동A, 이영희C, 김철수
        let name = token;
        let rank: MemberRank = 'D';

        const lastChar = token.slice(-1).toUpperCase();
        if (['S', 'A', 'B', 'C', 'D', 'E', 'F'].includes(lastChar)) {
          rank = lastChar as MemberRank;
          name = token.slice(0, -1);
        }

        const isGuest = name.endsWith('G');

        parsed.push({
          id: `member-${Date.now()}-${parsed.length}-${Math.random().toString(36).substr(2, 5)}`,
          name,
          rank,
          gender: currentGender,
          isGuest,
          status: 'left',
          order: parsed.length + 1,
          consecutiveGames: 0,
          todayGamesCount: 0,
          playedGamesCount: 0,
          shuttlecockSubmitted: false,
        });
      });
    });

    return parsed;
  };

  const handleApply = () => {
    const list = parseTextInput();
    if (list.length === 0) {
      setErrorMsg('등록할 회원 정보가 없습니다.');
      return;
    }

    if (existingMembers && existingMembers.length > 0) {
      const diff = computeDiff(list);
      if (diff.modified.length > 0 || diff.added.length > 0 || diff.missing.length > 0) {
        setDiffModal({
          isOpen: true,
          modified: diff.modified,
          added: diff.added,
          missing: diff.missing,
          candidateMembers: list,
        });
        return;
      }
    }

    onApply(list, replaceExisting);
    onClose();
  };

  const handleConfirmDiff = () => {
    if (!diffModal) return;
    const { modified, added, candidateMembers } = diffModal;

    // 적용 로직
    const selectedMods = new Map(modified.filter((m) => m.selected).map((m) => [m.id, m]));
    const updated = existingMembers.map((m) => {
      const mod = selectedMods.get(m.id);
      if (mod) {
        return {
          ...m,
          rank: mod.newRank,
          gender: mod.newGender,
        };
      }
      return m;
    });

    const maxOrder = updated.reduce((max, m) => Math.max(max, m.order || 0), 0);
    added.forEach((newM, idx) => {
      updated.push({
        ...newM,
        order: maxOrder + idx + 1,
      });
    });

    onApply(updated, true);
    setDiffModal(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* 헤더 */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="font-black text-base sm:text-lg text-slate-900">회원 일괄 등록</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* [핵심 기능] 캡처로 추가/수정 배너 */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-600 text-white rounded-xl">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-emerald-950 text-xs sm:text-sm">화면 캡처로 추가/수정</h4>
                  <p className="text-[11px] text-emerald-800">
                    투표나 댓글 캡처를 올리면 명단과 급수를 자동 추출합니다.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsScreenshotSectionOpen(!isScreenshotSectionOpen);
                  if (!isScreenshotSectionOpen && screenshots.length === 0) {
                    fileInputRef.current?.click();
                  }
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isScreenshotSectionOpen ? '캡처 닫기' : '캡처로 추가/수정'}</span>
              </button>
            </div>

            {/* 캡처 패널 */}
            {(isScreenshotSectionOpen || screenshots.length > 0) && (
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
                  <span className="font-bold text-emerald-900 block">클릭하여 이미지 파일 선택 (또는 Ctrl+V 붙여넣기)</span>
                </div>

                {screenshots.length > 0 && (
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
                    <button
                      type="button"
                      onClick={handleAnalyzeScreenshots}
                      disabled={isAnalyzing}
                      className="px-3 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1.5 shadow-xs ml-auto"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isAnalyzing ? '분석 중...' : `AI 분석 실행 (${screenshots.length}장)`}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">
              {successMsg}
            </div>
          )}

          {/* 텍스트 입력창 */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              회원 명단 텍스트 (직접 입력 또는 캡처 분석 결과)
            </label>
            <textarea
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="예시:&#10;남&#10;홍길동A 김철수B 박민수C&#10;&#10;여&#10;이영희B 정다은D 한지민C"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="accent-emerald-600 rounded"
            />
            <span>기존 회원 명단을 모두 지우고 새로 등록하기</span>
          </label>
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 text-xs"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-black hover:bg-slate-800 text-xs shadow-xs"
          >
            등록 완료
          </button>
        </div>
      </div>

      {/* 
        [핵심 요구사항] 기존 등록값이랑 달라진 부분이 있다면 수정 확인창 띄우기
      */}
      {diffModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-slate-900 text-sm sm:text-base">기존 등록값 변경 확인</h3>
              </div>
              <button type="button" onClick={() => setDiffModal(null)} className="p-1 rounded text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs flex-1">
              <p className="text-slate-600 font-medium">
                기존 등록 명단과 달라진 정보가 감지되었습니다. 수정 반영하시겠습니까?
              </p>

              {diffModal.modified.length > 0 && (
                <div className="space-y-1.5 border border-amber-200 rounded-xl p-2.5 bg-amber-50/40">
                  <div className="font-extrabold text-amber-900">정보 변경 회원 ({diffModal.modified.length}명)</div>
                  {diffModal.modified.map((item, idx) => (
                    <label key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setDiffModal((prev) => prev ? {
                              ...prev,
                              modified: prev.modified.map((m, i) => i === idx ? { ...m, selected: checked } : m),
                            } : null);
                          }}
                          className="accent-emerald-600"
                        />
                        <span className="font-black text-slate-900">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1 font-bold">
                        <span className="text-slate-400 line-through">{item.existingRank}조</span>
                        <ArrowRight className="w-3 h-3 text-amber-600" />
                        <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-black">
                          {item.newRank}조
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {diffModal.added.length > 0 && (
                <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/40">
                  <span className="font-black text-emerald-900 block mb-1">신규 추가 회원 ({diffModal.added.length}명)</span>
                  <div className="text-slate-600 font-medium flex flex-wrap gap-1">
                    {diffModal.added.map((m) => (
                      <span key={m.id} className="bg-white px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                        {m.name} ({m.rank}조)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
              <button
                type="button"
                onClick={() => setDiffModal(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 text-xs"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleConfirmDiff}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs"
              >
                선택 항목 수정 및 반영
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
