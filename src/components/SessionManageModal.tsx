import React, { useState } from 'react';
import { ClubSession, Court } from '../types';
import { X, Calendar, Clock, Plus, Trash2, KeyRound } from 'lucide-react';

interface SessionManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ClubSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onOpenCreateSession: () => void;
  onDeleteSession?: (id: string) => void;
}

export const SessionManageModal: React.FC<SessionManageModalProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onOpenCreateSession,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-3 sm:p-4 flex items-center justify-center">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-600 text-white shadow-xs">
              <Calendar className="w-5 h-5" />
            </span>
            <h3 className="font-black text-base sm:text-lg text-slate-900">운동 세션 관리</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 text-xs flex-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700">생성된 운동 목록 ({sessions.length}개)</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCreateSession();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              새 운동 생성
            </button>
          </div>

          <div className="space-y-2 mt-2">
            {sessions.map((sess) => {
              const isCurrent = sess.id === currentSessionId;
              return (
                <div
                  key={sess.id}
                  onClick={() => {
                    onSelectSession(sess.id);
                    onClose();
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isCurrent
                      ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                      <span>{sess.date}</span>
                      {sess.startTime && <span className="text-slate-500 text-xs">({sess.startTime})</span>}
                      {isCurrent && (
                        <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-black">
                          현재 선택
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      코트 {sess.courts?.length || 0}개 · 회원 {sess.members?.length || 0}명 · 경기 {sess.games?.length || 0}개
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-xl">
                    선택
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 text-xs"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
