import { useState, useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { useUserStore } from '@/store/useUserStore';
import { socket } from '@/lib/socket';
import type { ChatMessage } from '@/types/game';

// 이미지 로드 로직 유지
const rawImages = import.meta.glob('@/assets/dog/*.{png,jpg,jpeg}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const sortedImageUrls = Object.entries(rawImages)
  .sort(([pathA], [pathB]) => {
    const numA = parseInt(pathA.match(/dog(\d+)/)?.[1] || '0', 10);
    const numB = parseInt(pathB.match(/dog(\d+)/)?.[1] || '0', 10);
    return numA - numB;
  })
  .map(([_, url]) => url);

// avatarId (1-based) -> Image URL
const getAvatarUrl = (id?: number) => {
  if (!id || id < 1 || id > sortedImageUrls.length) return sortedImageUrls[0]; // 기본값
  return sortedImageUrls[id - 1];
};

const REACTION_EMOJIS = ['🐶', '🔥', '🤣', '👍', '👎', '🍅'];

const ChatArea = () => {
  const { messages, addMessage } = useGameStore();
  const { nickname } = useUserStore();
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
    triggerFloatingReaction(emoji);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="sketch-box-container" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingLeft: '10px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gaegu:wght@300;400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap');

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
            font-family: 'Nanum Pen Script', cursive;
        }
        .sketch-box-container::before {
            content: ""; position: absolute; left: 10px; top: 0; bottom: 0; width: 20px;
            background-image: radial-gradient(circle at 10px 10px, #333 4px, transparent 5px);
            background-size: 20px 30px; background-repeat: repeat-y;
            pointer-events: none;
        }

        .chat-bubble { 
            padding: 10px 15px; border: 3px solid #111; 
            border-radius: 20px 5px 25px 10px / 10px 25px 5px 20px; 
            box-shadow: 3px 3px 0 rgba(0,0,0,0.2); margin-bottom: 10px; 
            font-size: 1.3rem; word-break: break-all; 
            transition: all 0.3s;
            font-family: 'Nanum Pen Script', cursive;
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
              initial={{ y: '100%', x: `${r.x}%`, opacity: 0, scale: 0.5 }}
              animate={{ y: '-10%', opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1, 0.8] }}
              transition={{ duration: 2, ease: "easeOut" }}
              style={{ position: 'absolute', fontSize: '2.5rem' }}
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div style={{ padding: '15px', background: 'transparent', borderBottom: '4px dashed #111', fontWeight: '900', textAlign: 'center', fontSize: '1.8rem', fontFamily: '"Nanum Pen Script", cursive', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <MessageSquare size={24} color="#111" />
        <span>실시간 개소리판</span>
      </div>

      <div ref={chatListRef} style={{ flex: 1, padding: '15px 15px 15px 30px', overflowY: 'auto', background: 'transparent', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.map((msg) => {
          const isMe = msg.nickname === nickname;
          const isSystem = msg.nickname === 'SYSTEM';

          if (isSystem) {
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                <span style={{ fontSize: '1.2rem', color: '#888', fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.05)', padding: '5px 15px', borderRadius: '15px', fontFamily: '"Gaegu", cursive' }}>
                  📢 {msg.text}
                </span>
              </div>
            );
          }

          // ID 기반 고정 회전값 (-2 ~ 2도)
          // 숫자가 아닐 수도 있으니 안전하게 처리
          let rotation = 0;
          try {
            const numId = typeof msg.id === 'number' ? msg.id : parseInt(String(msg.id).slice(-2)) || 0;
            rotation = (numId % 4) - 2;
          } catch (e) { rotation = 1; }

          return (
            <div key={msg.id} className="chat-bubble" style={{
              alignSelf: isMe ? 'flex-end' : 'flex-start',
              background: isMe ? '#fff' : '#fff',
              border: isMe ? '3px solid #facc15' : '3px solid #111',
              textAlign: isMe ? 'right' : 'left',
              transform: `rotate(${rotation}deg)`,
              maxWidth: '85%'
            }}>
              {!isMe && <strong style={{ color: '#555', fontSize: '1rem', display: 'block', marginBottom: '5px' }}>{msg.nickname}</strong>}
              <div style={{ fontWeight: 700, fontSize: '1.4rem' }}>{msg.text}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', padding: '15px', background: 'transparent', borderTop: '4px dashed #111', alignItems: 'center' }}>

        {/* 리액션 버튼 팝업창 */}
        <div
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
          style={{ position: 'relative', marginRight: '10px' }}
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
                  left: '0',
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

        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1, padding: '12px', border: '3px solid #111', borderRadius: '15px', outline: 'none', marginRight: '10px', fontSize: '1.3rem', fontFamily: '"Nanum Pen Script", cursive', background: '#fffdf0' }}
          placeholder="멍멍! 짖어봐!"
        />
        <button onClick={handleSend} style={{ background: '#111', color: '#fff', border: '3px solid #111', borderRadius: '15px', padding: '0 20px', cursor: 'pointer', fontWeight: 900, fontSize: '1.3rem', fontFamily: '"Nanum Pen Script", cursive', transform: 'rotate(-2deg)', height: '46px' }}>Go!</button>
      </div>
    </div>
  );
};

export default ChatArea;