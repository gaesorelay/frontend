import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { useUserStore } from '@/store/useUserStore';
import { socket } from '@/lib/socket';
import type { ChatMessage } from '@/types/game';

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

// 배경 이미지 임포트
import chatBgImg from '@/assets/bg/chat_background.png';

const REACTION_EMOJIS = ['🐶', '🔥', '🤣', '👍', '👎', '🍅'];

const ChatArea = () => {
  const { messages, addMessage } = useGameStore();
  const { nickname, avatarId: myAvatarId } = useUserStore();
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

    // 서버로 전송 (내 아바타 정보도 같이 보내는 게 좋을 수 있음, 서버가 모른다면)
    // 일단은 메시지만 보냄 (서버가 senderId로 찾아서 뿌려준다고 가정)
    socket.emit('send_chat', { message: chatInput });

    setChatInput("");
  };

  // 리액션 발사 로직
  const triggerFloatingReaction = (emoji: string) => {
    const id = Date.now() + Math.random();
    // 랜덤한 x 위치 (20% ~ 80% 사이)
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

  // --- 스타일 ---
  const paperBoxStyle: React.CSSProperties = {
    // backgroundColor: '#fdfcf0',
    // border: '3px solid #333',
    boxShadow: '4px 4px 0px rgba(0,0,0,0.15)',
    borderRadius: '15px',
  };

  const chatBoxStyle: React.CSSProperties = {
    ...paperBoxStyle,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    padding: '15px',

    // 🖼️ 배경 이미지 설정
    backgroundImage: `url(${chatBgImg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '15px',
  };

  const chatTitleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    margin: '50px 8px 0',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333'
  };


  const chatListStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '10px',
    paddingRight: '5px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px', // 메시지 간 간격 증가
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '15px',
  };

  const senderWrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
    marginLeft: '5px',
  };

  // 말풍선 스타일
  const msgBubbleStyle = (isMe: boolean): React.CSSProperties => ({
    backgroundColor: isMe ? '#e0f2fe' : '#ffffff',
    border: isMe ? '2px solid #3b82f6' : '2px solid #ccc',
    borderRadius: '8px',
    padding: '6px 10px',
    maxWidth: '100%',
    fontSize: '0.9rem',
    wordBreak: 'break-word',
    position: 'relative',
  });

  const senderNameStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    marginBottom: '2px',
    fontWeight: 'bold',
    color: '#555',
  };

  const avatarStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '2px solid #333',
    backgroundColor: 'white',
    objectFit: 'cover',
    flexShrink: 0,
  };

  const myAvatarStyle: React.CSSProperties = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '2px solid #333',
    backgroundColor: 'white',
    objectFit: 'cover',
    marginRight: '8px',
  };

  // 입력창 스타일
  const inputAreaStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center', // 세로 중앙 정렬
    gap: '8px',
    height: '50px', // 높이 약간 증가
    marginTop: 'auto',
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    height: '40px',
    border: '2px solid #333',
    borderRadius: '8px',
    padding: '0 10px',
    fontSize: '0.9rem',
    backgroundColor: '#fff',
    outline: 'none',
  };

  // const buttonStyle: React.CSSProperties = {
  //   width: '40px',
  //   height: '40px',
  //   borderRadius: '8px',
  //   border: '2px solid #333',
  //   display: 'flex',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   cursor: 'pointer',
  //   backgroundColor: '#FFD93D', // 노랑 포인트
  //   boxShadow: '2px 2px 0px rgba(0,0,0,0.1)',
  // };

  const emojiTriggerStyle: React.CSSProperties = {
    fontSize: '1.4rem',
    cursor: 'pointer',
    padding: '5px',
  };

  const reactionMenuStyle: React.CSSProperties = {
    position: 'absolute' as const,
    bottom: '100%',
    left: '0',
    backgroundColor: 'white',
    border: '2px solid #333',
    borderRadius: '15px',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    boxShadow: '4px 4px 0px rgba(0,0,0,0.2)',
    zIndex: 100,
  };

  const reactionItemStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
  };

  return (
    <div style={chatBoxStyle}>

      {/* 솟아오르는 리액션 레이어 */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
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

      <div style={chatTitleStyle}>
        <MessageSquare size={18} fill="#333" className="text-white" />
        <span>실시간 개소리</span>
      </div>

      <div ref={chatListRef} style={chatListStyle}>
        {messages.map((msg) => {
          const isMe = msg.nickname === nickname;
          const isSystem = msg.nickname === 'SYSTEM';

          // 1. 시스템 메시지 (중앙 정렬, 심플)
          if (isSystem) {
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: '12px' }}>
                  📢 {msg.text}
                </span>
              </div>
            );
          }

          // 2. 일반 유저 메시지 (무조건 왼쪽 정렬)
          const avatarUrl = getAvatarUrl(msg.avatarId);

          return (
            <div key={msg.id} style={senderWrapperStyle}>
              {!isMe && <span style={senderNameStyle}>{msg.nickname}</span>}
              <div style={msgBubbleStyle(isMe)}>
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* 하단 입력창 영역 */}
      <div style={inputAreaStyle}>
        <img src={getAvatarUrl(myAvatarId)} style={myAvatarStyle} alt="my-face" />

        <input
          style={inputStyle}
          placeholder="멍멍해봐..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* 리액션 버튼 팝업창 (호버 시 등장) */}
        <div
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
          style={{ position: 'relative' }}
        >
          <AnimatePresence>
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -5, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                style={reactionMenuStyle}
              >
                {REACTION_EMOJIS.map(emoji => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSendReaction(emoji)}
                    style={reactionItemStyle}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 리액션 트리거 아이콘 */}
          <div style={emojiTriggerStyle}>
            😊
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
