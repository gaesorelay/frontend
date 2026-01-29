import { Background } from '@/components/common/background';
import { Timer } from 'lucide-react';
import ChatArea from '@/components/game/ChatArea';
import { socket } from '@/lib/socket';
import { useState } from 'react';
// Judges
import dog1 from '@/assets/dog/dog1.png';
import dog2 from '@/assets/dog/dog2.png';
import dog3 from '@/assets/dog/dog3.png';
// Team A Assets
import dog4 from '@/assets/dog/dog4.png';
import dog5 from '@/assets/dog/dog5.png';
import dog6 from '@/assets/dog/dog6.png';
import dog7 from '@/assets/dog/dog7.png';
// Team B Assets
import dog8 from '@/assets/dog/dog8.png';
import dog9 from '@/assets/dog/dog9.png';
import dog10 from '@/assets/dog/dog10.png';
import dog11 from '@/assets/dog/dog11.png';

const WritingPhase = () => {
  // [개발용] 채팅 테스트 상태
  const [testRoomId, setTestRoomId] = useState("");
  const [testNickname, setTestNickname] = useState(`유저${Math.floor(Math.random() * 1000)}`);
  const [isJoined, setIsJoined] = useState(false);

  // [개발용] 방 입장 함수
  const handleTestJoin = () => {
    if (!testRoomId) return alert("Room UUID를 입력하세요!");

    // 소켓 연결 확인
    if (!socket.connected) {
      socket.connect();
    }

    console.log(`🚪 테스트 입장 시도: ${testRoomId}, ${testNickname}`);
    socket.emit('join_room', {
      roomId: testRoomId,
      nickname: testNickname,
      avatarId: 1,
    });

    setIsJoined(true);
  };


  // --- Styles ---
  // Common
  const paperBoxStyle: React.CSSProperties = {
    backgroundColor: '#fdfcf0',
    border: '3px solid #333',
    boxShadow: '4px 4px 0px rgba(0,0,0,0.15)',
    borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 20px',
    fontFamily: 'SchoolSafeLittleOne, sans-serif',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 40px',
    height: '70px',
  };

  const timerStyle: React.CSSProperties = {
    ...paperBoxStyle,
    backgroundColor: '#FFD93D',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    gap: '8px',
    padding: '5px 15px',
  };

  const roundContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const roundTitleStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 900,
    color: '#3d405b',
    textShadow: '1px 1px 0px white',
    margin: 0,
  };

  const roundInfoStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    border: '2px dashed #333',
    borderRadius: '15px',
    padding: '4px 12px',
    fontSize: '1rem',
    fontWeight: 'bold',
  };

  // Main Layout
  const mainStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    padding: '0 40px 20px 40px',
    gap: '20px',
    alignItems: 'stretch',
    minHeight: 0,
  };

  // LEFT COLUMN: Image & Judges
  const leftColumnStyle: React.CSSProperties = {
    flex: 0.8,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    justifyContent: 'center',
  };

  const imageCardFrameStyle: React.CSSProperties = {
    width: '90%', // Relative width
    maxWidth: '220px', // Maximum fixed width to prevent huge growth
    alignSelf: 'center', // Center in column
    aspectRatio: '1/1',
    backgroundColor: '#fff',
    border: '4px solid #333',
    borderRadius: '16px',
    boxShadow: '6px 6px 0px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    padding: '12px',
    position: 'relative',
  };

  const imagePlaceholderStyle: React.CSSProperties = {
    flex: 1,
    width: '100%',
    backgroundColor: '#eee',
    border: '2px dashed #999',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    color: '#888',
  };

  // CENTER COLUMN: Stories (A & B)
  const centerColumnStyle: React.CSSProperties = {
    flex: 1.5,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  };

  const teamSectionStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    ...paperBoxStyle,
    borderRadius: '20px',
    alignItems: 'stretch', // Fill width
    padding: '15px',
    justifyContent: 'flex-start',
    minHeight: 0, // Allow flex shrink
    overflow: 'hidden', // Prevent spill
  };

  const teamHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '5px',
  };

  const teamIndicatorStyle = (color: string): React.CSSProperties => ({
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: color,
    border: '2px solid #333',
  });

  const storytellersStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginBottom: '10px',
  };

  const playerAvatarStyle = (active: boolean, color: string): React.CSSProperties => ({
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: active ? `3px solid ${color}` : '2px solid #ccc',
    backgroundColor: '#fff',
    objectFit: 'cover',
    boxShadow: active ? `0 3px 0 ${color}` : 'none',
  });

  const storyContentStyle: React.CSSProperties = {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: '10px',
    border: '2px dashed #ccc',
    padding: '10px',
    overflowY: 'auto',
    fontSize: '1rem',
    lineHeight: 1.5,
    minHeight: 0, // Crucial for nested flex scroll
  };

  // RIGHT COLUMN: Chat
  const rightColumnStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  };

  const chatBoxStyle: React.CSSProperties = {
    ...paperBoxStyle,
    width: '100%',
    height: '100%',
    borderRadius: '20px',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: '15px',
    justifyContent: 'flex-start',
    minHeight: 0, // Allow flex shrink
    overflow: 'hidden', // Prevent spill
  };

  const chatListStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '10px',
    fontSize: '0.95rem',
    paddingRight: '5px',
  };

  const chatItemStyle: React.CSSProperties = {
    marginBottom: '6px',
    display: 'flex',
    gap: '6px',
  };

  const inputAreaStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    height: '45px',
    marginTop: 'auto',
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    border: '2px solid #333',
    borderRadius: '10px',
    padding: '0 15px',
    fontSize: '0.95rem',
    backgroundColor: '#fff',
    outline: 'none',
  };

  const buttonStyle: React.CSSProperties = {
    width: '45px',
    height: '45px',
    borderRadius: '10px',
    border: '2px solid #333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: '#fff',
    boxShadow: '2px 2px 0px rgba(0,0,0,0.1)',
  };

  // Judges Styles (Placed in Left Column for balance)
  const judgeSectionStyle: React.CSSProperties = {
    ...paperBoxStyle,
    borderRadius: '30px',
    padding: '15px',
    gap: '15px',
    justifyContent: 'center',
    height: 'auto',
  };

  const judgeAvatarStyle: React.CSSProperties = {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    border: '3px solid #333',
    backgroundColor: '#fff',
    objectFit: 'cover',
  };

  return (
    <Background>
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <header style={headerStyle}>
          <div style={timerStyle}>
            <Timer size={20} />
            <span style={{ fontFamily: 'monospace' }}>03:00</span>
          </div>
          <div style={roundContainerStyle}>
            <h1 style={roundTitleStyle}>개소릴레이</h1>
            <div style={roundInfoStyle}>
              R <span style={{ color: '#FFD93D' }}>2</span> / 8
            </div>
          </div>
          <div style={{ width: '80px' }}></div>
        </header>

        {/* Main Content */}
        <div style={mainStyle}>

          {/* Left: Image & Judges */}
          <div style={leftColumnStyle}>
            {/* Small Image Card */}
            <div style={imageCardFrameStyle}>
              <div style={{
                position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                width: '60px', height: '15px', backgroundColor: 'rgba(255, 217, 61, 0.9)',
                border: '1px solid #333'
              }} />
              <div style={imagePlaceholderStyle}>
                <span style={{ fontSize: '2rem' }}>🖼️</span>
              </div>
              <div style={{ textAlign: 'center', marginTop: '5px', fontWeight: 'bold', fontSize: '0.9rem', color: '#555' }}>
                FANTASY
              </div>
            </div>

            {/* Judges (Moved here to use space) */}
            <div style={judgeSectionStyle}>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>심사위원</span>
              <img src={dog1} style={judgeAvatarStyle} alt="j1" />
              <img src={dog2} style={judgeAvatarStyle} alt="j2" />
              <img src={dog3} style={judgeAvatarStyle} alt="j3" />
            </div>
          </div>

          {/* Center: Stories (A Top, B Bottom) */}
          <div style={centerColumnStyle}>

            {/* Team A */}
            <div style={teamSectionStyle}>
              <div style={teamHeaderStyle}>
                <div style={teamIndicatorStyle('#ef4444')} />
                <span style={{ color: '#ef4444' }}>A팀</span>
              </div>
              <div style={storytellersStyle}>
                <img src={dog4} style={playerAvatarStyle(true, '#ef4444')} alt="p1" />
                <img src={dog5} style={playerAvatarStyle(false, '#ef4444')} alt="p2" />
                <img src={dog6} style={playerAvatarStyle(false, '#ef4444')} alt="p3" />
                <img src={dog7} style={playerAvatarStyle(false, '#ef4444')} alt="p4" />
              </div>
              <div style={storyContentStyle}>
                옛날 옛적에 선글라스를 낀 멋쟁이 리트리버가 살았어요. 이 리트리버는 사실 비밀 요원이었답니다. 어느 날 그는 본부로부터 긴급한 지령을 받게 되었는데...
              </div>
            </div>

            {/* Team B */}
            <div style={teamSectionStyle}>
              <div style={teamHeaderStyle}>
                <div style={teamIndicatorStyle('#3b82f6')} />
                <span style={{ color: '#3b82f6' }}>B팀</span>
              </div>
              <div style={storytellersStyle}>
                <img src={dog8} style={playerAvatarStyle(true, '#3b82f6')} alt="p5" />
                <img src={dog9} style={playerAvatarStyle(false, '#3b82f6')} alt="p6" />
                <img src={dog10} style={playerAvatarStyle(false, '#3b82f6')} alt="p7" />
                <img src={dog11} style={playerAvatarStyle(false, '#3b82f6')} alt="p8" />
              </div>
              <div style={storyContentStyle}>
                그 개는 사실 지구를 지키는 슈퍼 히어로였다고 해요. 망토 대신 빨간 목도리를 두르고, 도시의 평화를 위해 밤마다 순찰을 돌았죠. 그러던 중 수상한 고양이 무리를...
              </div>
            </div>

          </div>

          {/* Right: Chat [TEST MODE] */}
          <div style={rightColumnStyle}>
            {/* 🛠️ 개발용 방 입장 UI Overlay */}
            {!isJoined && (
              <div style={{
                background: '#333', color: 'white', padding: '10px', borderRadius: '10px',
                marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '5px'
              }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>🕵️♂️ 채팅 테스트 (먼저 방 ID 입력)</span>
                <input
                  placeholder="Room UUID"
                  value={testRoomId}
                  onChange={(e) => setTestRoomId(e.target.value)}
                  style={{ color: 'black', padding: '4px', borderRadius: '4px' }}
                />
                <input
                  placeholder="닉네임"
                  value={testNickname}
                  onChange={(e) => setTestNickname(e.target.value)}
                  style={{ color: 'black', padding: '4px', borderRadius: '4px' }}
                />
                <button
                  onClick={handleTestJoin}
                  style={{ background: '#FFD93D', color: 'black', fontWeight: 'bold', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  입장하기
                </button>
              </div>
            )}

            <ChatArea />
          </div>

        </div>

      </div>
    </Background>
  );
};

export default WritingPhase;
