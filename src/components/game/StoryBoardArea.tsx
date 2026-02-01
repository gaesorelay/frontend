import { useEffect, useState, useRef } from 'react';
import { socket } from '@/lib/socket';
import { useUserStore } from '@/store/useUserStore';
import styles from './StoryBoardArea.module.css';

interface StoryBoardProps {
  team: 'A' | 'B';
  activeUser: any;
  roomId: string;
}

const StoryBoardArea = ({ team, activeUser, roomId }: StoryBoardProps) => {
  const { userToken } = useUserStore();
  
  // 📜 전체 스토리 로그
  const [storyLog, setStoryLog] = useState<string[]>([]);
  // ✍️ 현재 작성 텍스트
  const [currentText, setCurrentText] = useState('');
  
  // 🦁 내 턴인가?
  const isMyTurn = activeUser && activeUser.userToken === userToken;
  
  // 📜 자동 스크롤을 위한 Ref
  const scrollRef = useRef<HTMLDivElement>(null);

  // 📡 소켓 리스너 (기존 로직 유지)
  useEffect(() => {
    const handleUpdate = (data: any) => {
      if (data.team === team && data.writerToken !== userToken) {
        setCurrentText(data.text);
      }
    };

    const handleSubmit = (data: any) => {
      // 내 팀의 제출 신호라면?
      if (data.team === team) {
        // A. 서버가 보내준 "확정된 텍스트"를 역사책(Log)에 기록
        setStoryLog((prev) => [...prev, data.text]); 
        
        // B. 현재 입력창을 깨끗하게 비움 (중요!)
        // 내가 썼든 남이 썼든, 턴이 끝났으므로 입력창은 무조건 비워야 함.
        setCurrentText(''); 
      }
    };

    socket.on('story_update', handleUpdate);
    socket.on('story_submitted', handleSubmit);

    return () => {
      socket.off('story_update', handleUpdate);
      socket.off('story_submitted', handleSubmit);
    };
  }, [team, userToken]); // currentText 의존성 주의 (최적화 필요할 수 있음)

  // 👇 [자동 스크롤] 로그가 추가되거나 타이핑할 때마다 바닥으로
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [storyLog, currentText]);


  // ✍️ 타이핑 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCurrentText(text);
    socket.emit('story_typing', { roomId, text, team, userToken });
  };

  // 💾 턴 종료 자동 제출 로직
  const lastActiveUserTokenRef = useRef(activeUser?.userToken);
  useEffect(() => {
    // 턴이 바뀌는 순간 (내 턴 끝남)
    if (lastActiveUserTokenRef.current === userToken && activeUser?.userToken !== userToken) {
        if (currentText.trim().length > 0) {
            socket.emit('submit_story', { roomId, text: currentText, team, userToken });
        }
    }
    lastActiveUserTokenRef.current = activeUser?.userToken;
  }, [activeUser, currentText, roomId, team, userToken]);


  return (
    // 📄 종이 한 장 (Container)
    <div className={`${styles.paper} ${isMyTurn ? styles.active : ''}`} ref={scrollRef}>
      
      {/* 🏷️ 누가 쓰고 있는지 표시 (우측 상단 뱃지) */}
      {activeUser && (
        <div className={styles.writerBadge}>
           {isMyTurn ? '✏️ 내 차례!' : `✍️ ${activeUser.nickname} 작성 중...`}
        </div>
      )}

      {/* 📜 1. 지난 이야기 (회색, 수정 불가) */}
      <div className={styles.historySection}>
        {storyLog.map((line, idx) => (
          <div key={idx} className={styles.committedText}>
            {line}
          </div>
        ))}
      </div>

      {/* ✍️ 2. 현재 입력 영역 (투명해서 이어지는 것처럼 보임) */}
      <div className={styles.writingSection}>
        {isMyTurn ? (
          <textarea
            className={styles.textarea}
            value={currentText}
            onChange={handleChange}
            placeholder={storyLog.length === 0 ? "첫 문장을 시작해주세요!" : "이야기를 이어주세요..."}
            autoFocus
            spellCheck={false}
          />
        ) : (
          <div className={styles.liveText}>
            {currentText}
            {/* 작성 중일 때만 커서 깜빡임 */}
            {activeUser && <span className={styles.cursor} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryBoardArea;