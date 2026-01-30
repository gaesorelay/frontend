import { Background } from '@/components/common/background';
import { Timer } from 'lucide-react';
import ChatArea from '@/components/game/ChatArea';
import { useGameStore } from '@/store/useGameStore'; // 스토어 import
import { useState, useMemo } from 'react';

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
  const leftColumnStyle: React.CSSProperties = { flex: 0.8, display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' };
  const imageCardFrameStyle: React.CSSProperties = { width: '90%', maxWidth: '220px', alignSelf: 'center', aspectRatio: '1/1', backgroundColor: '#fff', border: '4px solid #333', borderRadius: '16px', boxShadow: '6px 6px 0px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', padding: '12px', position: 'relative' };
  const imagePlaceholderStyle: React.CSSProperties = { flex: 1, width: '100%', backgroundColor: '#eee', border: '2px dashed #999', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#888' };
  const centerColumnStyle: React.CSSProperties = { flex: 1.5, display: 'flex', flexDirection: 'column', gap: '20px' };
  const teamSectionStyle: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', ...paperBoxStyle, borderRadius: '20px', alignItems: 'stretch', padding: '15px', justifyContent: 'flex-start', minHeight: 0, overflow: 'hidden' };
  const teamHeaderStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '5px' };
  const teamIndicatorStyle = (color: string): React.CSSProperties => ({ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color, border: '2px solid #333' });
  const storytellersStyle: React.CSSProperties = { display: 'flex', gap: '8px', marginBottom: '10px' };
  const storyContentStyle: React.CSSProperties = { flex: 1, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '10px', border: '2px dashed #ccc', padding: '10px', overflowY: 'auto', fontSize: '1rem', lineHeight: 1.5, minHeight: 0 };
  const rightColumnStyle: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' };
  const judgeSectionStyle: React.CSSProperties = { ...paperBoxStyle, borderRadius: '30px', padding: '15px', gap: '15px', justifyContent: 'center', height: 'auto' };
  const judgeAvatarStyle: React.CSSProperties = { width: '50px', height: '50px', borderRadius: '50%', border: '3px solid #333', backgroundColor: '#fff', objectFit: 'cover' };

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
            <span style={{ fontFamily: 'monospace' }}>01:00</span>
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
          <div style={leftColumnStyle}>
            <div style={imageCardFrameStyle}>
              <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', width: '60px', height: '15px', backgroundColor: 'rgba(255, 217, 61, 0.9)', border: '1px solid #333' }} />
              <div style={imagePlaceholderStyle}>
                <span style={{ fontSize: '2rem' }}>🖼️</span>
                <p>Card {turnNumber}</p>
              </div>
              <div style={{ textAlign: 'center', marginTop: '5px', fontWeight: 'bold', fontSize: '0.9rem', color: '#555' }}>
                KEYWORD
              </div>
            </div>
            <div style={judgeSectionStyle}>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>심사위원</span>
              <img src={dog1} style={judgeAvatarStyle} alt="j1" />
              <img src={dog2} style={judgeAvatarStyle} alt="j2" />
              <img src={dog3} style={judgeAvatarStyle} alt="j3" />
            </div>
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
              <div style={storyContentStyle}>(작성 대기 중)</div>
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
              <div style={storyContentStyle}>(작성 대기 중)</div>
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