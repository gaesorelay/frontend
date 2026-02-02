import { useEffect, useState, useRef } from 'react';
import { socket } from '@/lib/socket';
import { useUserStore } from '@/store/useUserStore';
import { useGameStore } from '@/store/useGameStore';

interface StoryBoardProps {
  team: 'A' | 'B';
  activeUser: any;
  roomId: string;
  turnNumber?: number; // WritingPhase에서 넘겨주는 현재 턴 번호 (1~8)
  isUrgent?: boolean;  // 10초 미만 긴급 상태 여부
}

const StoryBoardArea = ({ team, activeUser, roomId, turnNumber, isUrgent }: StoryBoardProps) => {
  const { userToken } = useUserStore();
  const { teamAStory, teamBStory, addStoryLine, setDraftText } = useGameStore();

  // 1. [데이터 선택] 현재 팀(A/B)에 해당하는 스토리 로그를 스토어에서 가져옴
  const storyLog = team === 'A' ? teamAStory : teamBStory;

  // ✍️ [입력 상태] 현재 유저가 타이핑 중인 임시 텍스트 상태
  const [currentTypingText, setCurrentTypingText] = useState('');
  const textRef = useRef('');

  // 2. [스토어 동기화] 작성 중인 텍스트를 게임 스토어에 보관 (턴 종료 시 자동 제출용 참조 데이터)
  useEffect(() => {
    textRef.current = currentTypingText;
    if (activeUser && activeUser.userToken === userToken) {
      setDraftText(currentTypingText);
    }
  }, [currentTypingText, activeUser, userToken, setDraftText]);

  // 3. [턴 변경 감지] 턴 번호가 바뀌면 (예: 1턴 -> 2턴) 입력창을 비워줌
  useEffect(() => {
    setCurrentTypingText('');
  }, [turnNumber]);

  // [권한 체크] 현재 활성화된 유저와 내 토큰이 일치하는지 확인
  const isMyTurn = activeUser && activeUser.userToken === userToken;
  const scrollRef = useRef<HTMLDivElement>(null);

  // 4. [소켓 통신] 실시간 타이핑 업데이트 및 최종 제출 이벤트 리스너
  useEffect(() => {
    // 상대방이 글을 쓸 때 실시간으로 보여주기 위한 핸들러
    const handleUpdate = (data: any) => {
      if (data.team === team && data.writerToken !== userToken) {
        setCurrentTypingText(data.text);
      }
    };

    // 서버에서 최종 문장 제출이 확정되었을 때 실행
    const handleSubmit = (data: any) => {
      if (data.team === team) {
        setCurrentTypingText('');            // 입력창 초기화
      }
    };

    socket.on('story_update', handleUpdate);
    socket.on('story_submitted', handleSubmit);

    return () => {
      socket.off('story_update', handleUpdate);
      socket.off('story_submitted', handleSubmit);
    };
  }, [team, userToken, addStoryLine]);

  // 5. [자동 스크롤] 새로운 문장이 추가되거나 타이핑 시 하단으로 스크롤 고정
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [storyLog, currentTypingText]);

  // 6. [타이핑 핸들러] 글자를 칠 때마다 서버로 실시간 전송 (Broadcasting)
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCurrentTypingText(text);
    socket.emit('story_typing', { roomId, text, team, userToken });
  };

  return (
    <div style={styles.container}>
      {/* ⭐️ 병맛/키치 스타일 애니메이션 정의 */}
      <style>
        {`
          @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
          .custom-scroll::-webkit-scrollbar { width: 8px; }
          .custom-scroll::-webkit-scrollbar-thumb { background: #FFD93D; border: 2px solid #000; border-radius: 4px; }
          @keyframes border-panic { 
            0%, 100% { border-color: #000; box-shadow: 4px 4px 0px #000; border-radius: 12px; } 
            50% { border-color: #ff4757; box-shadow: 0px 0px 15px #ff4757; border-radius: 12px; } 
          }
          .border-flash { animation: border-panic 0.3s infinite !important; border-width: 4px !important; }
        `}
      </style>

      {/* 📜 1. 스토리 히스토리 영역: 지금까지 쌓인 문장들을 보여줌 */}
      <div style={styles.logSection} ref={scrollRef} className="custom-scroll">
        <div style={styles.storyParagraph}>
          {/* 확정된 문장들 (검정색) */}
          <span style={styles.historyText}>
            {storyLog.length > 0 ? storyLog.join(' ') : ''}
          </span>

          {/* 현재 입력 중인 문장 (빨간색/물결 언더라인 강조) */}
          {currentTypingText && (
            <span style={styles.liveLine}>
              {storyLog.length > 0 ? ' ' : ''}
              {currentTypingText}
              {!isMyTurn && <span style={styles.cursorSmall} />}
            </span>
          )}

          {/* 데이터가 아예 없을 때의 가이드 문구 */}
          {storyLog.length === 0 && !currentTypingText && (
            <span style={styles.placeholder}>어서 개소리의 서막을 열어주개... 🐾</span>
          )}
        </div>
      </div>

      {/* ⌨️ 2. 입력 영역: 내 턴이면 textarea, 아니면 대기 메시지 노출 */}
      <div style={{ ...styles.inputWrapper, ...(isMyTurn ? styles.myTurn : {}) }}>
        {isMyTurn ? (
          <textarea
            style={styles.textarea}
            value={currentTypingText}
            onChange={handleChange}
            placeholder="아무 말이나 짖어보세요! 턴이 끝나면 자동으로 박제됩니다."
            autoFocus
            spellCheck={false}
            className={isUrgent ? 'border-flash' : ''} // 10초 미만 시 번쩍임 효과
          />
        ) : (
          <div style={styles.waitMessage}>
            <span style={styles.waitText}>
              {activeUser ? `🐶 ${activeUser.nickname}님이 열정적으로 짖는 중...` : "차례를 기다리는 중"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// --- 스타일 정의 ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    gap: '12px',
    overflow: 'hidden', // 전체가 커지는 것 방지
    minHeight: 0,
  },
  logSection: {
    flex: 1, // 남은 공간 모두 차지
    overflowY: 'auto',
    padding: '20px',
    backgroundColor: '#fff',
    border: '3px solid #000',
    borderRadius: '15px',
    // 개소릴레이 원고지/노트 느낌 배경
    backgroundImage: 'linear-gradient(#f1f1f1 1px, transparent 1px)',
    backgroundSize: '100% 1.8rem',
    lineHeight: '1.8rem',
    boxShadow: 'inset 4px 4px 0px rgba(0,0,0,0.05)',
  },
  storyParagraph: {
    fontSize: '1.1rem',
    color: '#333',
    wordBreak: 'break-word',
  },
  historyText: {
    color: '#000',
    fontWeight: 600,
  },
  liveLine: {
    color: '#ff4757', // 타이핑 중인 글자는 강렬하게
    fontWeight: 800,
    textDecoration: 'underline wavy #FFD93D', // 병맛 물결 강조
  },
  cursorSmall: {
    display: 'inline-block',
    width: '10px',
    height: '1.1rem',
    backgroundColor: '#ff4757',
    marginLeft: '4px',
    verticalAlign: 'middle',
    animation: 'blink 0.8s infinite',
  },
  placeholder: {
    color: '#bbb',
    fontSize: '0.9rem',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'stretch',
    transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  myTurn: {
    // transform: 'translateY(-2px) scale(1.01)',
  },
  textarea: {
    width: '100%',
    padding: '7px 15px',
    border: '3px solid #000',
    borderRadius: '12px',
    fontFamily: 'inherit',
    fontSize: '1rem',
    resize: 'none',
    backgroundColor: '#FFD93D', // 내 차례일 땐 노란색으로 강조
    outline: 'none',
    fontWeight: 'bold',
  },
  waitMessage: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    border: '3px dashed #333',
    borderRadius: '12px',
    color: '#666',
  },
  waitText: {
    fontSize: '0.95rem',
    fontWeight: 'bold',
  },
};

export default StoryBoardArea;
