import React, { useState, useRef } from 'react';
import { Game, Member, Court } from '../types';
import { CourtSection } from './CourtSection';
import { MobileSectionTabBar, MobileSectionTab } from './MobileSectionTabBar';
import { Calendar, Users, Search, LocateFixed, Play, CheckCircle2, Share2, Check, Clock, Sparkles } from 'lucide-react';

interface ParticipantViewProps {
  courts: Court[];
  games: Game[];
  members: Member[];
  sessionStartTime?: string;
}

export const ParticipantView: React.FC<ParticipantViewProps> = ({
  courts,
  games,
  members,
  sessionStartTime = '19:00',
}) => {
  const [mobileTab, setMobileTab] = useState<MobileSectionTab>('court');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [gameFilter, setGameFilter] = useState<'all' | 'playing' | 'before'>('all');
  const [highlightedGameId, setHighlightedGameId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const gameListContainerRef = useRef<HTMLDivElement>(null);
  const gameCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const attendingMembers = members.filter((m) => m.status !== 'left');
  const selectedMember = members.find((m) => m.id === selectedMemberId);

  // 선택된 회원의 다음 출전 예정 경기 찾기
  const myNextGame = selectedMemberId
    ? games.find(
        (g) =>
          (g.status === 'playing' || g.status === 'before') &&
          [g.team1[0].id, g.team1[1].id, g.team2[0].id, g.team2[1].id].includes(selectedMemberId)
      )
    : null;

  // 다음 게임 찾기 핸들러
  const handleFindNextGame = () => {
    let target = games.find((g) => g.status === 'before');
    if (!target) {
      target = games.find((g) => g.status === 'playing');
    }

    if (!target) return;

    if (gameFilter !== 'all' && gameFilter !== target.status) {
      setGameFilter('all');
    }

    setTimeout(() => {
      const el = gameCardRefs.current[target!.id];
      if (el && gameListContainerRef.current) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedGameId(target!.id);
        setTimeout(() => setHighlightedGameId(null), 2500);
      }
    }, 50);
  };

  const getCourtName = (courtId: string) => {
    const c = courts.find((x) => x.id === courtId);
    return c ? (c.name || `${c.number}번 코트`) : '코트';
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredGames = games.filter((g) => {
    if (gameFilter !== 'all' && g.status !== gameFilter) return false;
    if (selectedMemberId) {
      const all4Ids = [g.team1[0].id, g.team1[1].id, g.team2[0].id, g.team2[1].id];
      if (!all4Ids.includes(selectedMemberId)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* 
        [참가자 전용 맞춤형 바: 이름 선택 & 링크 복사]
      */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-blue-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-black text-blue-900 shrink-0">내 이름 선택:</span>
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="w-full sm:w-48 p-2 bg-blue-50/60 border border-blue-300 rounded-xl text-xs font-black text-blue-950 focus:outline-none"
          >
            <option value="">전체 회원 대진 보기</option>
            {attendingMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.rank}조, {m.gender === 'M' ? '남' : '여'})
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleCopyLink}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 text-xs font-bold transition-all"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copiedLink ? '링크 복사 완료!' : '참여자 링크 복사'}</span>
        </button>
      </div>

      {/* 
        [📌 나의 다음 출전 예정 경기 카드 (본인 이름 선택 시 최상단 고정 노출)]
      */}
      {selectedMember && (
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl shadow-md space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black flex items-center gap-1.5 text-blue-100">
              <Sparkles className="w-4 h-4 text-amber-300" />
              📌 {selectedMember.name} 님의 다음 출전 예정 경기
            </span>
            {myNextGame && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                {myNextGame.status === 'playing' ? '지금 경기 중!' : '출전 대기'}
              </span>
            )}
          </div>

          {myNextGame ? (
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-lg font-black text-white">
                  #{myNextGame.gameNumber} 경기 · {getCourtName(myNextGame.courtId)}
                </div>
                <div className="text-xs text-blue-100 mt-0.5">
                  {myNextGame.team1[0].name} & {myNextGame.team1[1].name}
                  <span className="mx-1.5 opacity-60">vs</span>
                  {myNextGame.team2[0].name} & {myNextGame.team2[1].name}
                </div>
              </div>
              <div className="text-xs font-black bg-amber-400 text-amber-950 px-3 py-1.5 rounded-xl self-start sm:self-auto shadow-xs">
                라켓 챙겨서 대기하세요!
              </div>
            </div>
          ) : (
            <div className="bg-white/10 p-3 rounded-xl text-xs text-blue-100">
              현재 배정된 다음 대기 경기가 없습니다.
            </div>
          )}
        </div>
      )}

      {/* 모바일 화면 전용 상단 탭: 코트 현황 / 참여 명단 / 게임 목록 */}
      <MobileSectionTabBar
        activeTab={mobileTab}
        onTabChange={setMobileTab}
        courtCount={courts.length}
        memberCount={attendingMembers.length}
        gameCount={games.length}
      />

      {/* 코트 실시간 현황 (뷰어 전용) */}
      <div className={mobileTab === 'court' ? 'block' : 'hidden lg:block'}>
        <CourtSection
          courts={courts}
          games={games}
          members={members}
          sessionStartTime={sessionStartTime}
          onAddCourt={() => {}}
          onGameStatusChange={() => {}}
          readOnly={true}
        />
      </div>

      {/* 2단 그리드: 게임 목록 & 참여 명단 */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-12 gap-4 items-start ${
          mobileTab === 'court' ? 'hidden lg:grid' : ''
        }`}
      >
        {/* [좌측: 게임 목록] (7컬럼) */}
        <div
          className={`lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs relative ${
            mobileTab === 'games' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-700" />
                <h3 className="font-extrabold text-slate-900 text-base">게임 목록</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                  총 {games.length}경기
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                코트별 진행 상태와 게임 순서를 확인하세요 (실시간 동기화).
              </p>
            </div>

            {/* 필터 탭 */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setGameFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  gameFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                전체 ({games.length})
              </button>
              <button
                type="button"
                onClick={() => setGameFilter('playing')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  gameFilter === 'playing' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                진행 중 ({games.filter((g) => g.status === 'playing').length})
              </button>
              <button
                type="button"
                onClick={() => setGameFilter('before')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  gameFilter === 'before' ? 'bg-white text-amber-800 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                대기 ({games.filter((g) => g.status === 'before').length})
              </button>
            </div>
          </div>

          {/* 게임 목록 리스트 (스크롤 및 플로팅 버튼) */}
          <div className="relative mt-3 min-h-[300px]">
            <div
              ref={gameListContainerRef}
              className="overflow-y-auto max-h-[520px] space-y-2.5 pr-2 pb-3"
            >
              {filteredGames.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-400">
                  진행되거나 예정된 경기가 없습니다.
                </div>
              ) : (
                filteredGames.map((game) => {
                  const isHighlighted = highlightedGameId === game.id;
                  const isMyGame =
                    selectedMemberId &&
                    [game.team1[0].id, game.team1[1].id, game.team2[0].id, game.team2[1].id].includes(
                      selectedMemberId
                    );

                  // 복식 유형별 테두리 및 배경 식별
                  const typeStyles =
                    game.type === 'men'
                      ? 'border-blue-300 bg-blue-50/40'
                      : game.type === 'women'
                      ? 'border-rose-300 bg-rose-50/40'
                      : 'border-slate-200 bg-white';

                  return (
                    <div
                      key={game.id}
                      ref={(el) => {
                        gameCardRefs.current[game.id] = el;
                      }}
                      className={`p-3.5 rounded-2xl border-2 transition-all ${
                        isHighlighted
                          ? 'ring-4 ring-emerald-400 bg-emerald-50/80 shadow-md'
                          : isMyGame
                          ? 'ring-2 ring-blue-500 shadow-sm ' + typeStyles
                          : typeStyles + ' shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200/80">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900">#{game.gameNumber}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-700 text-[10px]">
                            {getCourtName(game.courtId)}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              game.type === 'men'
                                ? 'bg-blue-100 text-blue-800'
                                : game.type === 'women'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {game.type === 'men' ? '남자 복식' : game.type === 'women' ? '여자 복식' : '혼합 복식'}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            game.status === 'playing'
                              ? 'bg-emerald-600 text-white'
                              : game.status === 'before'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {game.status === 'playing' ? '진행 중' : game.status === 'before' ? '입장 대기' : '종료'}
                        </span>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white/80 p-2 rounded-xl border border-slate-200/60">
                          <div className="text-[10px] font-bold text-emerald-800 mb-0.5">TEAM A</div>
                          <div className="font-extrabold text-slate-900 text-xs">
                            {game.team1[0].name} ({game.team1[0].rank}조) · {game.team1[1].name} ({game.team1[1].rank}조)
                          </div>
                        </div>
                        <div className="bg-white/80 p-2 rounded-xl border border-slate-200/60">
                          <div className="text-[10px] font-bold text-rose-800 mb-0.5">TEAM B</div>
                          <div className="font-extrabold text-slate-900 text-xs">
                            {game.team2[0].name} ({game.team2[0].rank}조) · {game.team2[1].name} ({game.team2[1].rank}조)
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* 
              [핵심 요구사항] 다음 게임 찾기 플로팅 버튼:
              참가자 모드 게임 목록에도 동일하게 스크롤 바 영역의 수직 중단(top-1/2 -translate-y-1/2)에 배치
            */}
            {games.some((g) => g.status === 'before' || g.status === 'playing') && (
              <button
                type="button"
                onClick={handleFindNextGame}
                className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-4 z-20 flex items-center gap-1.5 px-3 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-90 text-white font-black text-xs shadow-lg ring-2 ring-white transition-all cursor-pointer"
                title="다음 진행할 대기 게임으로 즉시 스크롤 이동"
              >
                <LocateFixed className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden sm:inline">다음 게임 찾기</span>
              </button>
            )}
          </div>
        </div>

        {/* [우측: 참여 명단] (5컬럼) */}
        <div
          className={`lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs ${
            mobileTab === 'members' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                <h3 className="font-extrabold text-slate-900 text-base">참여 명단</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  {attendingMembers.length}명 활동 중
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              이름을 클릭하여 해당 회원의 경기 일정만 모아볼 수 있습니다.
            </p>

            {/* 검색창 */}
            <div className="mt-2.5 relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                placeholder="회원 검색..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* 명단 리스트 */}
          <div className="mt-3 overflow-y-auto max-h-[500px] space-y-2 pr-1">
            {attendingMembers
              .filter((m) => !memberSearchQuery || m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()))
              .map((member) => {
                const isSelected = selectedMemberId === member.id;
                return (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMemberId(isSelected ? '' : member.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300'
                        : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                        {member.order}
                      </span>
                      <span className="font-extrabold text-xs text-slate-900">{member.name}</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {member.rank}조
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center gap-2">
                      <span>게임: {member.todayGamesCount || 0}회</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          member.status === 'playing'
                            ? 'bg-blue-100 text-blue-800'
                            : member.status === 'waiting'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {member.status === 'playing' ? '게임중' : member.status === 'waiting' ? '대기' : '휴식'}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
