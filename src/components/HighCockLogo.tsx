import React, { useState, useEffect, useRef } from 'react';
import defaultLogoSrc from '../assets/images/high_cock_raw_drawing_1790042188433.jpg';
import { Upload, RotateCcw, Image as ImageIcon } from 'lucide-react';

interface HighCockLogoProps {
  className?: string;
  height?: number | string;
  showBadge?: boolean;
}

/**
 * 하이콕 로고 컴포넌트:
 * 사용자가 올린 실제 원본 이미지 파일(PNG/JPG)을 브라우저/서버에 1:1 무변형으로 저장 및 즉시 표시합니다.
 * 클릭 시 원본 이미지 직접 파일 등록/변경 팝업을 지원하여,
 * AI 재해석이나 왜곡 없이 사용자의 실제 그림 파일을 100% 그대로 반영합니다.
 */
export const HighCockLogo: React.FC<HighCockLogoProps> = ({
  className = '',
  height = 38,
  showBadge = true,
}) => {
  const [logoSrc, setLogoSrc] = useState<string>(defaultLogoSrc);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 서버 및 로컬스토리지에서 등록된 원본 로고 불러오기
  useEffect(() => {
    const cached = localStorage.getItem('high_cock_custom_logo');
    if (cached) {
      setLogoSrc(cached);
      setIsCustom(true);
    }

    fetch('/api/club-logo')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok' && data.logoDataUrl) {
          setLogoSrc(data.logoDataUrl);
          setIsCustom(true);
          localStorage.setItem('high_cock_custom_logo', data.logoDataUrl);
        }
      })
      .catch((e) => console.warn('Failed to load club logo:', e));
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setLogoSrc(dataUrl);
        setIsCustom(true);
        localStorage.setItem('high_cock_custom_logo', dataUrl);

        // 서버에 영구 저장 (모든 사용자/기기 동기화)
        fetch('/api/club-logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logoDataUrl: dataUrl }),
        }).catch((err) => console.warn('Failed to save club logo to server:', err));

        setShowModal(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    setLogoSrc(defaultLogoSrc);
    setIsCustom(false);
    localStorage.removeItem('high_cock_custom_logo');

    fetch('/api/club-logo', { method: 'DELETE' }).catch((err) =>
      console.warn('Failed to reset logo:', err)
    );
    setShowModal(false);
  };

  const imageElement = (
    <img
      src={logoSrc}
      alt="하이콕 (HIGH COCK) 로고"
      referrerPolicy="no-referrer"
      style={{ height: '100%', width: 'auto' }}
      className="object-contain max-h-full select-none"
    />
  );

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        style={{ height }}
        className={`group relative inline-flex items-center justify-center cursor-pointer transition-transform active:scale-95 ${
          showBadge
            ? 'px-0 py-0.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-300'
            : ''
        } shrink-0 select-none overflow-hidden ${className}`}
        title="클릭하여 원본 로고 파일 확인 및 직접 등록"
      >
        <div className="h-full flex items-center justify-center">
          {imageElement}
        </div>
        {/* 호버 시 힌트 표시 */}
        <span className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] text-slate-800 font-bold backdrop-blur-2xs">
          로고
        </span>
      </div>

      {/* 로고 파일 관리 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                하이콕 로고 원본 파일 관리
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="my-4 flex flex-col items-center">
              <p className="text-xs text-slate-500 text-center mb-3">
                AI 변형 없이 사용자가 가진 원본 그림/이미지 파일(PNG, JPG)을
                그대로 100% 무변형 등록할 수 있습니다.
              </p>
              <div className="w-full h-24 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300 p-2 overflow-hidden">
                <img
                  src={logoSrc}
                  alt="현재 등록된 로고"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                내 컴퓨터/폰의 원본 이미지 파일 선택하기
              </button>

              {isCustom && (
                <button
                  onClick={handleResetLogo}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  기본 이미지로 되돌리기
                </button>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 px-3 rounded-xl text-slate-500 hover:text-slate-700 font-medium text-xs mt-1"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
