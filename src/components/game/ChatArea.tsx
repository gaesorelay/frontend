import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { useUserStore } from '@/store/useUserStore';
import { socket } from '@/lib/socket';
import type { ChatMessage } from '@/types/game';

const ChatArea = () => {
  const { messages, addMessage } = useGameStore();
  const { nickname } = useUserStore();
  const [chatInput, setChatInput] = useState("");
  const chatListRef = useRef<HTMLDivElement>(null);

  // 1. 소켓 이벤트 리스너 설정
  useEffect(() => {
    const handleChatMessage = (data: any) => {
      // 서버에서 오는 데이터 형태에 맞춰 매핑
      // 가정: { senderId, nickname, message, ... }

      const newMessage: ChatMessage = {
        id: Date.now().toString() + Math.random(), // 임시 ID
        userToken: data.senderId || 'unknown', // 서버가 senderId를 준다고 가정
        nickname: data.nickname, // 서버가 nickname을 준다고 가정
        text: data.message,
        createdAt: new Date().toISOString(),
      };
      addMessage(newMessage); // 스토어에 추가
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

    // 서버로 전송
    socket.emit('send_chat', { message: chatInput });

    // 입력창 비우기 (메시지는 소켓 이벤트로 받아서 추가됨)
    setChatInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // --- 스타일 ---
  // (Paper 스타일 재사용)
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
    gap: '8px',
  };

  const msgBubbleStyle = (isMe: boolean): React.CSSProperties => ({
    alignSelf: isMe ? 'flex-end' : 'flex-start',
    backgroundColor: isMe ? '#e0f2fe' : '#ffffff', // 나: 파랑 연한색, 남: 흰색
    border: isMe ? '2px solid #3b82f6' : '2px solid #ccc',
    borderRadius: '8px',
    padding: '6px 10px',
    maxWidth: '80%',
    fontSize: '0.9rem',
    wordBreak: 'break-word',
  });

  const senderNameStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    marginBottom: '2px',
    fontWeight: 'bold',
    color: '#555',
  };

  // 입력창 스타일
  const inputAreaStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    height: '40px',
    marginTop: 'auto',
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
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
    backgroundColor: '#FFD93D', // 노랑 포인트
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
          // 내 닉네임과 같으면 '나'로 처리
          const isMe = msg.nickname === nickname;

          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
              {!isMe && <span style={senderNameStyle}>{msg.nickname}</span>}
              <div style={msgBubbleStyle(isMe)}>
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      <div style={inputAreaStyle}>
        <input
          style={inputStyle}
          placeholder="메시지 입력..."
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
