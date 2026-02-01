import { useEffect, useState, useRef } from 'react';
import { socket } from '@/lib/socket';
import { useUserStore } from '@/store/useUserStore';
import { useGameStore } from '@/store/useGameStore';
import styles from './StoryBoardArea.module.css';

interface StoryBoardProps {
  team: 'A' | 'B';
  activeUser: any;
  roomId: string;
}

const StoryBoardArea = ({ team, activeUser, roomId }: StoryBoardProps) => {
  const { userToken } = useUserStore();
  const { teamAStory, teamBStory, addStoryLine } = useGameStore();
  
  // 팀에 맞는 데이터 가져오기
  const storyLog = team === 'A' ? teamAStory : teamBStory;

  // ✍️ 현재 실시간으로 작성 중인 텍스트 (서버 제출 전)
  const [currentTypingText, setCurrentTypingText] = useState('');
  const textRef = useRef('');

  useEffect(() => {
    textRef.current = currentTypingText;
  }, [currentTypingText]);

  const isMyTurn = activeUser && activeUser.userToken === userToken;
  const scrollRef = useRef<HTMLDivElement>(null);

 // StoryBoardArea.tsx 내부
useEffect(() => {
  console.log("📡 스토리 리스너 등록됨!"); // 이게 찍히는지 확인

  const handleUpdate = (data: any) => {
    console.log("📝 실시간 업데이트 수신:", data); // 남이 칠 때 이게 찍혀야 함
    if (data.team === team && data.writerToken !== userToken) {
      setCurrentTypingText(data.text);
    }
  };

  const handleSubmit = (data: any) => {
    console.log("💾 제출 완료 수신:", data); // 제출 시 이게 전원에게 찍혀야 함
    if (data.team === team) {
      addStoryLine(data.team, data.text); 
      setCurrentTypingText('');
    }
  };

  socket.on('story_update', handleUpdate);
  socket.on('story_submitted', handleSubmit);

  return () => {
    socket.off('story_update', handleUpdate);
    socket.off('story_submitted', handleSubmit);
  };
}, [team, userToken]); // addStoryLine은 뺍니다 (안정성 위해)

  // 자동 스크롤: 새 로그가 쌓이거나 누군가 타이핑할 때
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [storyLog, currentTypingText]);

  // 내 턴일 때 타이핑 핸들러
 const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  const text = e.target.value;
  setCurrentTypingText(text);
  console.log("📤 타이핑 전송 시도:", { roomId, text, team }); // 로그 찍기
  socket.emit('story_typing', { roomId, text, team, userToken });
};



  // 💾 턴 종료 시 자동 제출 (Ref 사용으로 클로저 방지)
  const prevActiveUserRef = useRef(activeUser?.userToken);
  useEffect(() => {
    const prevToken = prevActiveUserRef.current;
    const currentToken = activeUser?.userToken;

    // 내 턴이 끝나는 순간 서버로 최종본 제출
    if (prevToken === userToken && currentToken !== userToken) {
      if (textRef.current.trim().length > 0) {
        // 턴 종료 제출 시에도 동일하게
        console.log("📤 제출 시도:", textRef.current);
        socket.emit('submit_story', { 
          roomId, 
          text: textRef.current, 
          team, 
          userToken 
        });
      }
    }
    prevActiveUserRef.current = currentToken;
  }, [activeUser, roomId, team, userToken]);

  return (
    <div className={styles.container}>
    {/* 📜 1. 스토리 히스토리 및 실시간 입력 통합 영역 */}
    <div className={styles.logSection} ref={scrollRef}>
        <div className={styles.storyParagraph}>
            {/* A. 이미 확정된 이전 문장들을 공백과 함께 합침 */}
            <span className={styles.historyText}>
            {storyLog.length > 0 ? storyLog.join(' ') : ''}
            </span>

            {/* B. 현재 누군가 작성 중인 텍스트를 바로 뒤에 이어 붙임 */}
            {currentTypingText && (
            <span className={styles.liveLine}>
                {/* 앞 문장이 있다면 공백을 하나 추가하여 자연스럽게 연결 */}
                {storyLog.length > 0 ? ' ' : ''}
                {currentTypingText}
                {!isMyTurn && <span className={styles.cursorSmall} />}
            </span>
            )}
            
            {/* C. 아무 내용이 없을 때 보여줄 가이드 (선택 사항) */}
            {storyLog.length === 0 && !currentTypingText && (
            <span className={styles.placeholder}>첫 문장을 시작해 보세요...</span>
            )}
        </div>
    </div>

      {/* ⌨️ 3. 입력 창 영역 (내 턴일 때만 활성화) */}
      <div className={`${styles.inputWrapper} ${isMyTurn ? styles.myTurn : ''}`}>
        {isMyTurn ? (
          <textarea
            className={styles.textarea}
            value={currentTypingText}
            onChange={handleChange}
            placeholder="여기에 이야기를 작성하세요 (턴 종료 시 자동 저장)"
            autoFocus
            spellCheck={false}
          />
        ) : (
          <div className={styles.waitMessage}>
            {activeUser ? `${activeUser.nickname}님이 작성 중입니다...` : "차례를 기다리는 중"}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryBoardArea;