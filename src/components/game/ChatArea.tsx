import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
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

const ChatArea = () => {
  const { messages, addMessage } = useGameStore();
  const { nickname, avatarId: myAvatarId } = useUserStore();
  const [chatInput, setChatInput] = useState("");
  const chatListRef = useRef<HTMLDivElement>(null);

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

    socket.on('chat_message', handleChatMessage);

    return () => {
      socket.off('chat_message', handleChatMessage);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // --- 스타일 ---
  const paperBoxStyle: React.CSSProperties = {
    backgroundColor: '#fdfcf0',
    border: '3px solid #333',
    boxShadow: '4px 4px 0px rgba(0,0,0,0.15)',
    borderRadius: '15px',
    fontFamily: 'SchoolSafeLittleOne, sans-serif',
  };

  const chatBoxStyle: React.CSSProperties = {
    ...paperBoxStyle,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    padding: '15px',
  };

  const chatListStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '10px',
    paddingRight: '5px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px', // 메시지 간 간격 증가
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

  const buttonStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    border: '2px solid #333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: '#FFD93D',
    boxShadow: '2px 2px 0px rgba(0,0,0,0.1)',
  };

  return (
    <div style={chatBoxStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', fontSize: '1rem', fontWeight: 'bold', color: '#333' }}>
        <MessageSquare size={18} fill="#333" className="text-white" />
        <span>채팅</span>
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
            <div key={msg.id} style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <img src={avatarUrl} style={avatarStyle} alt="avatar" />

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: '85%' }}>
                <span style={senderNameStyle}>{msg.nickname}</span>
                <div style={msgBubbleStyle(isMe)}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={inputAreaStyle}>
        <img src={getAvatarUrl(myAvatarId)} style={myAvatarStyle} alt="my-face" />

        <input
          style={inputStyle}
          placeholder="멍멍!"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button style={buttonStyle} onClick={handleSend}>
          <Send size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default ChatArea;
