import { Background } from '@/components/common/background';
import { Timer } from 'lucide-react';
import ChatArea from '@/components/game/ChatArea';
import StoryBoardArea from '../StoryBoardArea';
import JudgeArea from '@/components/game/JudgeArea';
import CardArea from '@/components/game/CardArea';

import { useGameStore } from '@/store/useGameStore';
import { useUserStore } from '@/store/useUserStore';
import { socket } from '@/lib/socket';
import { useState, useMemo, useEffect } from 'react';
import { getCardImage } from '@/lib/cardMapper';
// import { getJudgeImage } from '@/lib/judgeMapper';

// --- Assets (이미지) ---
import dog1 from '@/assets/dog/dog1.png';
import dog2 from '@/assets/dog/dog2.png';
import dog3 from '@/assets/dog/dog3.png';
// Players (아바타 ID 매핑용)
import dog4 from '@/assets/dog/dog4.png';
import dog5 from '@/assets/dog/dog5.png';
import dog6 from '@/assets/dog/dog6.png';
import dog7 from '@/assets/dog/dog7.png';
import dog8 from '@/assets/dog/dog8.png';



// 아바타 ID를 이미지로 변환하는 헬퍼
const getAvatarImage = (avatarId: number) => {
  const images = [dog1, dog2, dog3, dog4, dog5, dog6, dog7, dog8];
  // avatarId가 1부터 시작한다고 가정하고 배열 인덱스(0부터)에 맞춤
  return images[(avatarId - 1) % images.length] || dog1;
};

interface WritingPhaseProps {
  currentRound: string; // "TURN1" ~ "TURN8"
}



const WritingPhase = ({ currentRound }: WritingPhaseProps) => {
  // 1. ⭐️ [수정] store에서 users가 아니라 'players'를 가져옵니다!
  const { players, roomConfig, roundData } = useGameStore();

  console.log(players)

  // 2. 현재 턴 번호 계산
  const turnNumber = useMemo(() => {
    const num = parseInt(currentRound.replace('TURN', ''));
    return isNaN(num) ? 1 : num;
  }, [currentRound]);

  // 3. 슬롯 설정
  const maxStorytellers = roomConfig?.storytellerCount || 4;


  // 2. ⭐️ [핵심] 현재 턴의 카드 ID 찾기
  const currentCardId = useMemo(() => {
    if (!roundData || !roundData.cardIds) return 0;
    // turnNumber는 1부터 시작하므로 인덱스는 -1
    const index = turnNumber - 1;
    // 배열 범위 안전하게 접근
    return roundData.cardIds[index] || 0;
  }, [roundData, turnNumber]);

  // 3. ⭐️ [핵심] 심사위원 리스트 가져오기
  const judges = useMemo(() => {
    // roundData.judgeIds는 실제로는 Judge 객체 배열 [{id, name, persona}, ...]
    return roundData?.judgeIds || [];
  }, [roundData]);



  // 4. ⭐️ [수정] players 배열을 필터링합니다.
  const teamAPlayers = useMemo(() =>
    players // users -> players
      .filter(p => p.team === 'A' && p.role === 'PLAYER')
      .sort((a, b) => (a.slotIndex || 0) - (b.slotIndex || 0)),
    [players]);

  const teamBPlayers = useMemo(() =>
    players // users -> players
      .filter(p => p.team === 'B' && p.role === 'PLAYER')
      .sort((a, b) => (a.slotIndex || 0) - (b.slotIndex || 0)),
    [players]);

  // 5. 현재 작성자(Active User) 계산
  const activeUserA = useMemo(() => {
    if (teamAPlayers.length === 0) return null;
    return teamAPlayers[(turnNumber - 1) % teamAPlayers.length];
  }, [teamAPlayers, turnNumber]);

  const activeUserB = useMemo(() => {
    if (teamBPlayers.length === 0) return null;
    return teamBPlayers[(turnNumber - 1) % teamBPlayers.length];
  }, [teamBPlayers, turnNumber]);

  // 6. ⭐️ 타이머 로직 (auto-submit 포함)
  const roundTime = roomConfig?.roundTime || 60;
  const [timeLeft, setTimeLeft] = useState(roundTime);

  useEffect(() => {
    // 서버 시작 시간 기준 (없으면 현재 시간)
    const startTime = roundData?.startedAt ? new Date(roundData.startedAt).getTime() : Date.now();
    const endTime = startTime + (roundTime * 1000);

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [roundTime, roundData?.startedAt]);

  // ⭐️ 턴 변경(또는 언마운트) 시 자동 제출 로직
  // 1. turnNumber가 바뀌기 직전(cleanup)에 제출하거나
  // 2. 턴이 바뀌어서 writingPhase가 unmount될 때 제출
  useEffect(() => {
    return () => {
      const { draftText, setDraftText } = useGameStore.getState();
      const { userToken } = useUserStore.getState();

      // 내 턴이었는지 확인
      const isMyTurnA = activeUserA && activeUserA.userToken === userToken;
      const isMyTurnB = activeUserB && activeUserB.userToken === userToken;

      if ((isMyTurnA || isMyTurnB) && draftText && draftText.trim().length > 0) {
        console.log(`💾 [WritingPhase] 턴 종료(또는 스킵)로 인한 자동 제출: ${draftText}, Turn: ${turnNumber}`);
        const myTeam = isMyTurnA ? 'A' : 'B';
        socket.emit('submit_story', {
          roomId: players[0]?.roomUuid || '',
          text: draftText,
          team: myTeam,
          userToken,
          turn: turnNumber // ⭐️ 추가된 요구사항
        });
        // 제출 후 draft 비우기 (중복 제출 방지)
        setDraftText('');
      }
    };
  }, [activeUserA, activeUserB, turnNumber, players]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };


  // --- Styles (기존 스타일 그대로 유지) ---
  const paperBoxStyle: React.CSSProperties = {
    backgroundColor: '#fdfcf0', border: '3px solid #333', boxShadow: '4px 4px 0px rgba(0,0,0,0.15)',
    borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '10px 20px', fontFamily: 'SchoolSafeLittleOne, sans-serif',
  };
  const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 40px', height: '70px' };
  const timerStyle: React.CSSProperties = { ...paperBoxStyle, backgroundColor: '#FFD93D', fontSize: '1.2rem', fontWeight: 'bold', gap: '8px', padding: '5px 15px' };
  const roundContainerStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '10px' };
  const roundTitleStyle: React.CSSProperties = { fontSize: '1.5rem', fontWeight: 900, color: '#3d405b', textShadow: '1px 1px 0px white', margin: 0 };
  const roundInfoStyle: React.CSSProperties = { backgroundColor: '#fff', border: '2px dashed #333', borderRadius: '15px', padding: '4px 12px', fontSize: '1rem', fontWeight: 'bold' };
  const mainStyle: React.CSSProperties = { flex: 1, display: 'flex', padding: '0 40px 20px 40px', gap: '20px', alignItems: 'stretch', minHeight: 0 };
  const leftColumnStyle: React.CSSProperties = { flex: 0.8, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' };
  const centerColumnStyle: React.CSSProperties = { flex: 1.5, display: 'flex', flexDirection: 'column', gap: '20px' };
  const teamSectionStyle: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', ...paperBoxStyle, borderRadius: '20px', alignItems: 'stretch', padding: '15px', justifyContent: 'flex-start', minHeight: 0, overflow: 'hidden' };
  const teamHeaderStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '5px' };
  const teamIndicatorStyle = (color: string): React.CSSProperties => ({ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color, border: '2px solid #333' });
  const storytellersStyle: React.CSSProperties = { display: 'flex', gap: '8px', marginBottom: '10px' };
  const storyContentStyle: React.CSSProperties = { flex: 1, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '10px', border: '2px dashed #ccc', padding: '10px', overflowY: 'auto', fontSize: '1rem', lineHeight: 1.5, minHeight: 0 };
  const rightColumnStyle: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' };

  // 아바타 스타일
  const getAvatarStyle = (isActive: boolean, color: string): React.CSSProperties => ({
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: isActive ? `4px solid ${color}` : '2px solid #ccc',
    backgroundColor: '#fff',
    objectFit: 'cover',
    boxShadow: isActive ? `0 0 10px ${color}` : 'none',
    transform: isActive ? 'scale(1.2)' : 'scale(1)',
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    zIndex: isActive ? 10 : 1,
  });

  // 렌더링 헬퍼
  const renderTeamAvatars = (teamPlayers: any[], activeUser: any, color: string) => {
    return Array.from({ length: maxStorytellers }).map((_, i) => {
      const player = teamPlayers.find(p => p.slotIndex === i);
      const isActive = player && activeUser && player.userToken === activeUser.userToken;

      if (!player) {
        return <div key={`empty-${i}`} style={{ width: 40, height: 40, borderRadius: 10, border: '2px dashed #e5e7eb' }} />;
      }

      return (
        <div key={player.userToken} style={{ position: 'relative' }}>
          {isActive && (
            <div style={{
              position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)',
              backgroundColor: color, color: '#fff', fontSize: '0.7rem', padding: '2px 6px',
              borderRadius: '4px', whiteSpace: 'nowrap', zIndex: 20
            }}>
              Now!
            </div>
          )}
          <img
            src={getAvatarImage(player.avatarId)}
            style={getAvatarStyle(!!isActive, color)}
            alt={player.nickname}
          />
        </div>
      );
    });
  };

  return (
    <Background>
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

        <header style={headerStyle}>
          <div style={timerStyle}>
            <Timer size={20} />
            <span style={{ fontFamily: 'monospace' }}>{formatTime(timeLeft)}</span>
          </div>
          <div style={roundContainerStyle}>
            <h1 style={roundTitleStyle}>스토리 릴레이</h1>
            <div style={roundInfoStyle}>
              TURN <span style={{ color: '#FFD93D' }}>{turnNumber}</span> / 8
            </div>
          </div>
          <div style={{ width: '80px' }}></div>
        </header>

        <div style={mainStyle}>
          {/* Left: Image & Judges */}
          <div style={leftColumnStyle}>
            <CardArea
              cardIds={roundData?.cardIds || []}
              currentTurn={turnNumber}
            />
            <JudgeArea judges={judges} />
          </div>

          <div style={centerColumnStyle}>
            <div style={teamSectionStyle}>
              <div style={teamHeaderStyle}>
                <div style={teamIndicatorStyle('#ef4444')} />
                <span style={{ color: '#ef4444' }}>A팀</span>
                <span style={{ fontSize: '0.9rem', color: '#666', marginLeft: 'auto' }}>
                  {activeUserA ? `✍️ ${activeUserA.nickname} 작성 중...` : ''}
                </span>
              </div>
              <div style={storytellersStyle}>
                {renderTeamAvatars(teamAPlayers, activeUserA, '#ef4444')}
              </div>
              {/* ⭐️ [교체] 스토리 보드 A */}
              {/* roomUuid는 roundData나 store에서 가져오거나 props로 받아야 함 */}
              <div style={{ flex: 1, minHeight: 0 }}>
                <StoryBoardArea
                  team="A"
                  activeUser={activeUserA}
                  roomId={players[0]?.roomUuid || ''} // 유저 정보에 roomUuid가 있으니 그걸 씀
                  turnNumber={turnNumber} // ⭐️ 추가
                />
              </div>
            </div>

            <div style={teamSectionStyle}>
              <div style={teamHeaderStyle}>
                <div style={teamIndicatorStyle('#3b82f6')} />
                <span style={{ color: '#3b82f6' }}>B팀</span>
                <span style={{ fontSize: '0.9rem', color: '#666', marginLeft: 'auto' }}>
                  {activeUserB ? `✍️ ${activeUserB.nickname} 작성 중...` : ''}
                </span>
              </div>
              <div style={storytellersStyle}>
                {renderTeamAvatars(teamBPlayers, activeUserB, '#3b82f6')}
              </div>
              {/* ⭐️ [교체] 스토리 보드 B */}
              <div style={{ flex: 1, minHeight: 0 }}>
                <StoryBoardArea
                  team="B"
                  activeUser={activeUserB}
                  roomId={players[0]?.roomUuid || ''}
                  turnNumber={turnNumber} // ⭐️ 추가
                />
              </div>
            </div>
          </div>

          <div style={rightColumnStyle}>
            <ChatArea />
          </div>
        </div>
      </div>
    </Background>
  );
};

export default WritingPhase;