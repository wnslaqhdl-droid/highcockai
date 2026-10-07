import React, { useState } from 'react';
import { Member, MemberRank } from '../types';
import { X, Users, UserPlus, Search, Check, Edit2, Trash2 } from 'lucide-react';

export interface RegistryMember {
  id: string;
  name: string;
  rank: MemberRank;
  gender: 'M' | 'F';
  phone?: string;
  isRegular: boolean;
  notes?: string;
}

interface MemberRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  registryMembers: RegistryMember[];
  onAddRegistryMember: (member: Omit<RegistryMember, 'id'>) => void;
  onUpdateRegistryMember: (id: string, updates: Partial<RegistryMember>) => void;
  onDeleteRegistryMember: (id: string) => void;
  onImportToSession: (selectedMembers: RegistryMember[]) => void;
}

export const MemberRegistryModal: React.FC<MemberRegistryModalProps> = ({
  isOpen,
  onClose,
  registryMembers,
  onAddRegistryMember,
  onUpdateRegistryMember,
  onDeleteRegistryMember,
  onImportToSession,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // 폼 입력 상태
  const [name, setName] = useState('');
  const [rank, setRank] = useState<MemberRank>('D');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [phone, setPhone] = useState('');
  const [isRegular, setIsRegular] = useState(true);

  if (!isOpen) return null;

  const filtered = registryMembers.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((m) => m.id));
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      onUpdateRegistryMember(editingId, {
        name: name.trim(),
        rank,
        gender,
        phone: phone.trim() || undefined,
        isRegular,
      });
    } else {
      onAddRegistryMember({
        name: name.trim(),
        rank,
        gender,
        phone: phone.trim() || undefined,
        isRegular,
      });
    }

    setName('');
    setPhone('');
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleEditClick = (m: RegistryMember) => {
    setEditingId(m.id);
    setName(m.name);
    setRank(m.rank);
    setGender(m.gender);
    setPhone(m.phone || '');
    setIsRegular(m.isRegular);
    setIsFormOpen(true);
  };

  const handleImport = () => {
    const toImport = registryMembers.filter((m) => selectedIds.includes(m.id));
    onImportToSession(toImport);
    setSelectedIds([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
        {/* 헤더 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-600 text-white shadow-xs">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg">클럽 회원 명부 관리</h3>
              <p className="text-xs text-slate-500">상시 등록 회원 DB에서 오늘 참석자로 바로 불러오기</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 회원 등록/수정 폼 */}
        {isFormOpen && (
          <form onSubmit={handleSubmitForm} className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>{editingId ? '회원 정보 수정' : '새 명부 회원 등록'}</span>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingId(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                닫기
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">급수</label>
                <select
                  value={rank}
                  onChange={(e) => setRank(e.target.value as MemberRank)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold"
                >
                  {(['S', 'A', 'B', 'C', 'D', 'E', 'F'] as const).map((r) => (
                    <option key={r} value={r}>{r}조</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">성별</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'M' | 'F')}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold"
                >
                  <option value="M">남성</option>
                  <option value="F">여성</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">구분</label>
                <select
                  value={isRegular ? 'regular' : 'guest'}
                  onChange={(e) => setIsRegular(e.target.value === 'regular')}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold"
                >
                  <option value="regular">정회원</option>
                  <option value="guest">게스트</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingId(null);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-black hover:bg-slate-800"
              >
                저장
              </button>
            </div>
          </form>
        )}

        {/* 상단 액션 바 */}
        <div className="mt-3 flex items-center justify-between gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="회원 이름 검색..."
                className="pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 w-40 sm:w-48"
              />
            </div>
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
            >
              {selectedIds.length === filtered.length ? '선택 해제' : '전체 선택'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setName('');
              setPhone('');
              setIsFormOpen(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            새 명부 등록
          </button>
        </div>

        {/* 목록 테이블 */}
        <div className="mt-3 overflow-y-auto max-h-[420px] space-y-1.5 pr-1 flex-1 text-xs">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400">등록된 명부 회원이 없습니다.</div>
          ) : (
            filtered.map((m) => {
              const isSelected = selectedIds.includes(m.id);
              return (
                <div
                  key={m.id}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-teal-50 border-teal-300 ring-1 ring-teal-300'
                      : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                  }`}
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(m.id)}
                      className="accent-teal-600 rounded"
                    />
                    <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <span>{m.name}</span>
                      <span className="px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 text-[10px] font-bold">
                        {m.rank}조
                      </span>
                      <span className="text-slate-400 text-[10px]">({m.gender === 'M' ? '남' : '여'})</span>
                      {m.isRegular ? (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-semibold">
                          정회원
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-bold">
                          게스트
                        </span>
                      )}
                    </div>
                  </label>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditClick(m)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRegistryMember(m.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 푸터 */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3 text-xs">
          <span className="text-slate-500 font-bold">
            선택된 회원: <span className="text-teal-700 font-black">{selectedIds.length}명</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100"
            >
              닫기
            </button>
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={handleImport}
              className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black disabled:opacity-40 shadow-xs cursor-pointer"
            >
              선택 회원 오늘 모임에 추가 ({selectedIds.length}명)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
