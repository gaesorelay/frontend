import { useState, useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { useUserStore } from '@/store/useUserStore';
import { socket } from '@/lib/socket';
import type { ChatMessage } from '@/types/game';


// 이미지 로드 로직 유지
const rawImages = import.meta.glob('@/assets/dog/*.{png,jpg,jpeg}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

// 1. 파일 경로(키)를 기반으로 ID와 URL을 매핑합니다.
// 빌드 후에는 URL(값)이 해시처리되어 파일명이 바뀔 수 있으므로(예: dog1-abc.png),
// 변하지 않는 키(예: ./assets/dog/dog1.png)에서 ID를 추출해야 안전합니다.
const avatarMap = new Map<number, string>();

Object.entries(rawImages).forEach(([path, url]) => {
  // 경로에서 숫자 추출 (예: .../dog1.png -> 1)
  const match = path.match(/dog(\d+)/);
  if (match) {
    const id = parseInt(match[1], 10);
    avatarMap.set(id, url);
  }
});

// 기존 fallback 로직 유지를 위한 정렬된 배열 (ID가 없거나 매핑되지 않은 경우 사용)
const sortedImageUrls = Object.entries(rawImages)
  .sort(([pathA], [pathB]) => {
    const numA = parseInt(pathA.match(/dog(\d+)/)?.[1] || '0', 10);
    const numB = parseInt(pathB.match(/dog(\d+)/)?.[1] || '0', 10);
    return numA - numB;
  })
  .map(([_, url]) => url);

// avatarId (1-based) -> Image URL
const getAvatarUrl = (id?: number) => {
  // 1. 맵에서 ID로 직접 찾기 (O(1))
  if (typeof id === 'number' && avatarMap.has(id)) {
    return avatarMap.get(id)!;
  }

  // 2. 없으면 기존대로 첫 번째 사진 보여주기 (Fallback)
  return sortedImageUrls[0];
};

const REACTION_EMOJIS = ['🐶', '🔥', '🤣', '👍', '👎', '🍅'];

const ChatArea = () => {
  const { messages, addMessage, players } = useGameStore();
  const { nickname, avatarId: myAvatarId, userToken: myToken } = useUserStore();
  const [chatInput, setChatInput] = useState("");
  const chatListRef = useRef<HTMLDivElement>(null);

  // 리액션 관련
  const [showReactions, setShowReactions] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<{ id: number; emoji: string; x: number }[]>([]);

  // 1. 소켓 이벤트 리스너 설정
  useEffect(() => {
    const handleChatMessage = (data: any) => {
      const newMessage: ChatMessage = {
        id: Date.now().toString() + Math.random(),
        userToken: data.senderId || 'unknown',
        nickname: data.nickname,
        text: data.message,
        createdAt: new Date().toISOString(),
        avatarId: data.avatarId,
      };
      addMessage(newMessage);
    };

    const handleReaction = (data: { emoji: string }) => {
      triggerFloatingReaction(data.emoji);
    };

    socket.on('chat_message', handleChatMessage);
    socket.on('receive_reaction', handleReaction);

    return () => {
      socket.off('chat_message', handleChatMessage);
      socket.off('receive_reaction', handleReaction);
    };
  }, [addMessage]);

  // 2. 스크롤 자동 내리기
  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [messages]);

  // 3. 메시지 전송 핸들러
  const handleSend = () => {
    if (!chatInput.trim()) return;
    socket.emit('send_chat', { message: chatInput });
    setChatInput("");
  };

  // 리액션 발사 로직
  const triggerFloatingReaction = (emoji: string) => {
    const id = Date.now() + Math.random();
    const x = Math.floor(Math.random() * 60) + 20;
    setFloatingReactions(prev => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== id));
    }, 2000);
  };

  const handleSendReaction = (emoji: string) => {
    socket.emit('send_reaction', { emoji, nickname });
    // triggerFloatingReaction(emoji);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // 1. 루프 밖에서 '나의 팀'이 무엇인지 딱 한 번만 정의 (Zustand players 활용)
  // map 외부이므로 성능에 영향이 거의 없습니다.
  const myInfo = players.find(p => p.currentSocketId === socket.id || p.nickname === nickname);
  const myActualTeam = myInfo?.team || 'NONE'; // 내 팀 (A, B, 또는 NONE)

  return (
    <div className="sketch-box-container" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingLeft: '10px', maxWidth: '25rem' }}>
      <style>{`
        /* 🐶 멍멍이 스타일: 쫀득하고 촐싹거리는 애니메이션 */
        @keyframes elastic-bounce {
            0% { transform: scale(0) translateY(100px) rotate(-10deg); opacity: 0; } 
            40% { transform: scale(1.1) translateY(-20px) rotate(5deg); opacity: 1; } 
            60% { transform: scale(0.9) translateY(10px) rotate(-3deg); } 
            80% { transform: scale(1.05) translateY(-5px) rotate(2deg); } 
            100% { transform: scale(1) translateY(0) rotate(0deg); } 
        }

        @keyframes tail-wag {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(2deg); }
            50% { transform: rotate(0deg); }
            75% { transform: rotate(-2deg); }
            100% { transform: rotate(0deg); }
        }

        @keyframes bubble-pop {
            0% { transform: scale(0); opacity: 0; }
            70% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); }
        }

        .sketch-box-container { 
            border: 5px solid #111 !important; 
            border-radius: 10px 30px 10px 30px / 30px 10px 30px 10px !important; 
            box-shadow: 10px 10px 0 rgba(0,0,0,0.2) !important;
            background: #fffdf0 !important; 
            position: relative;
            transform: rotate(1deg);
            animation: tail-wag 5s infinite ease-in-out;
        }
        .sketch-box-container::before {
            content: ""; position: absolute; left: 10px; top: 0; bottom: 0; width: 20px;
            background-image: radial-gradient(circle at 10px 10px, #333 4px, transparent 5px);
            background-size: 20px 30px; background-repeat: repeat-y;
            pointer-events: none;
        }

        .chat-bubble { 
            padding: 5px; border: 1px solid #111; 
            border-radius: 20px 5px 25px 10px / 10px 25px 5px 20px; 
            box-shadow: 3px 3px 0 rgba(0,0,0,0.2); 
            font-size: 0.8rem; word-break: break-all; 
            transition: all 0.3s;
            animation: bubble-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
            position: relative;
        }
      `}</style>

      {/* 솟아오르는 리액션 레이어 */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100 }}>
        <AnimatePresence>
          {floatingReactions.map(r => (
            <motion.div
              key={r.id}
              initial={{ y: '1000%', x: `${r.x}%`, opacity: 0, scale: 0.5 }}
              animate={{ y: '-20%', opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1, 0.8] }}
              transition={{ duration: 2, ease: "easeOut" }}
              style={{ position: 'absolute', fontSize: '2.5rem' }}
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div style={{ padding: '15px', background: 'transparent', borderBottom: '4px dashed #111', fontWeight: '900', textAlign: 'center', fontSize: '1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <MessageSquare size={24} color="#111" />
        <span>실시간 개소리판</span>
      </div>

      <div ref={chatListRef} style={{ flex: 1, padding: '15px', overflowY: 'auto', background: 'transparent', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.map((msg) => {

          // 1. 메세지 작성자의 실시간 정보 찾기
          const senderInfo = players.find(p => p.currentSocketId === msg.userToken);

          const isMe = msg.nickname === nickname || (myToken && msg.userToken === myToken);
          const isSystem = msg.nickname === 'SYSTEM';

          // 2. 팀 판별 (스토어 데이터가 없으면 'NONE'으로 간주)
          const userTeam = senderInfo?.team || 'NONE';
          const isAudience = userTeam === 'NONE' || senderInfo?.role === 'AUDIENCE';

          // 3. 🎨 요청하신 4가지 색상 규칙 적용
          let currentConfig = { bg: '#ffffff', border: '#9ca3af' }; // 기본값 (관중/하얀색)

          if (isMe) {
            // 내가 친 채팅 (노란색)
            currentConfig = { bg: '#facc15', border: '#111' };
          } else if (isAudience) {
            // 관중 (하얀색)
            currentConfig = { bg: '#ffffff', border: '#9ca3af' };
          } else if (userTeam === 'A') {
            // A팀 (빨간색)
            currentConfig = { bg: '#fee2e2', border: '#ef4444' };
          } else if (userTeam === 'B') {
            // B팀 (파란색)
            currentConfig = { bg: '#dbeafe', border: '#3b82f6' };
          }

          // 4. 라벨 판별 
          let teamLabel = "";
          if (isMe) {
            teamLabel = "(나)";
          } else if (isAudience) {
            teamLabel = "(관전자)";
          } else {
            // 내 팀(myActualTeam)과 메시지 작성자의 팀(userTeam)을 단순 비교!
            const isOurTeam = (myActualTeam !== 'NONE') && (myActualTeam === userTeam);
            teamLabel = isOurTeam ? "(우리팀)" : "(상대팀)";
          }

          // 시스템 메시지 처리
          if (isSystem) {
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                <span style={{ fontSize: '0.8rem', color: '#888', backgroundColor: 'rgba(0,0,0,0.05)', padding: '5px', borderRadius: '15px' }}>
                  📢 {msg.text}
                </span>
              </div>
            );
          }

          // 아바타 URL 가져오기
          const avatarUrl = getAvatarUrl(msg.avatarId);


          // ID 기반 고정 회전값 (-2 ~ 2도)
          // 숫자가 아닐 수도 있으니 안전하게 처리
          let rotation = 0;
          try {
            const numId = typeof msg.id === 'number' ? msg.id : parseInt(String(msg.id).slice(-2)) || 0;
            rotation = (numId % 4) - 2;
          } catch (e) { rotation = 1; }

          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
              <div style={{ flexShrink: 0 }}>
                <img
                  src={getAvatarUrl(senderInfo?.avatarId || msg.avatarId)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    border: `2px solid ${currentConfig.border}`
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '0.8rem', marginBottom: '2px', color: currentConfig.border, fontWeight: 'bold' }}>
                  {senderInfo?.nickname || msg.nickname} {teamLabel}
                </div>

                <div className="chat-bubble" style={{
                  background: currentConfig.bg,
                  borderColor: currentConfig.border,
                  transform: `rotate(${(parseInt(String(msg.id).slice(-1)) || 0) % 4 - 2}deg)`,
                  padding: '3px',
                }}>
                  <div style={{ color: '#111', fontWeight: 600, fontSize: '1rem' }}>
                    {msg.text}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 입력 영역 */}
      <div style={{ width: '100%', boxSizing: 'border-box', display: 'flex', padding: '10px', background: 'transparent', borderTop: '4px dashed #111', alignItems: 'center' }}>

        {/* 리액션 버튼 팝업창 */}
        <div
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
          style={{ position: 'relative', margin: '0 5px' }}
        >
          <AnimatePresence>
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -45, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '-15px',
                  backgroundColor: '#fff',
                  border: '3px solid #111',
                  borderRadius: '15px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  boxShadow: '4px 4px 0px rgba(0,0,0,0.2)',
                  zIndex: 100,
                  width: '50px',
                  alignItems: 'center'
                }}
              >
                {REACTION_EMOJIS.map(emoji => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSendReaction(emoji)}
                    style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 리액션 트리거 아이콘 */}
          <div style={{ fontSize: '1.8rem', cursor: 'pointer', filter: 'grayscale(0.2)', transition: '0.2s' }}>
            😊
          </div>
        </div>

        {/* 내 현재 아바타 미리보기 */}
        <div style={{ marginRight: '10px', flexShrink: 0 }}>
          <img
            src={getAvatarUrl(myAvatarId)}
            style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #111' }}
            alt="me"
          />
        </div>

        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ minWidth: 0, flex: 1, padding: '12px', border: '3px solid #111', borderRadius: '15px', outline: 'none', marginRight: '10px', fontSize: '1.1rem', background: '#fffdf0' }}
          placeholder="멍멍! 짖어봐!"
        />
        <button onClick={handleSend} style={{ background: '#111', color: '#fff', border: '1px solid #111', borderRadius: '15px', padding: '0 10px', cursor: 'pointer', fontWeight: 600, fontSize: '1.1rem', transform: 'rotate(-2deg)', height: '46px' }}>Go!</button>
      </div>
    </div>
  );
};

export default ChatArea;