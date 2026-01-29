import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Background } from '@/components/common/background';

import speechBubbleImg from '@/assets/speechbubble2.png';
import voteFinishImg from '@/assets/logo/vote_finish.png';
import voteLogoImg from '@/assets/logo/logo_vote.png';

import ChatArea from '../ChatArea';

const DUMMY_LOGS = Array.from({ length: 8 }).map((_, i) => ({
  id: i,
  cardImg: `https://picsum.photos/200/300?random=${i}`,
  teamA: `A팀의 ${i + 1}번째 개소리입니다! 🐶`,
  teamB: `B팀의 ${i + 1}번째 개소리입니다! 🐱`,
}));

const VotingPhase = ({ timeLeft: _timeLeft, onVote }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // 1. 테스트를 위해 내부 상태로 선언 (나중에 이 줄만 지우면 됨)
  const [timeLeft, setTimeLeft] = useState(10);

  // ⏱️ 카운트다운 로직
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // 카드 더미 자동 슬라이드
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % DUMMY_LOGS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % DUMMY_LOGS.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + DUMMY_LOGS.length) % DUMMY_LOGS.length);

  // 이모지 리액션
  const [reactions, setReactions] = useState<{ id: number; emoji: string }[]>([]);
  const addReaction = (emoji: string) => {
    const id = Date.now();
    setReactions(prev => [...prev, { id, emoji }]);
    // 1초 뒤에 목록에서 삭제 (메모리 관리 및 애니메이션 종료)
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 1000);
  };

  // 1. 키프레임 선언 (컴포넌트 바깥이나 상단에 배치)
  const shakeKeyframes = `
  @keyframes shake {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(-2deg) scale(1.1); }
    75% { transform: rotate(2deg) scale(1.1); }
    100% { transform: rotate(0deg); }
  }
`;
  return (
    <Background>
      <style>{shakeKeyframes}</style>
      <div style={styles.container}>

        {/* 왼쪽 영역: 메인 컨텐츠 + 푸터 */}
        <div style={styles.leftSection}>
          <header style={styles.header}>
            <img src={voteLogoImg} alt="로고" style={styles.logo} />
          </header>

          {/* 1. 상단 메인 컨텐츠 섹션 (카드 + 말풍선) */}
          <main style={styles.mainContentArea}>
            {/* 카드 슬라이더 */}
            <section style={styles.cardSection}>
              <div style={styles.cardContainer}>
                <div style={styles.cardFrame}>
                  <div style={styles.cardInner}>
                    <div style={styles.cardFront}>
                      <img alt="front" src={DUMMY_LOGS[currentIndex].cardImg} style={styles.cardImg} />
                    </div>
                    <div style={styles.cardBack}>
                      <img alt="cover" src="/src/assets/dog/dog14.png" style={styles.cardImg} />
                    </div>
                  </div>
                </div>
              </div>
              <div style={styles.arrowGroup}>
                <button onClick={handlePrev} style={styles.arrowBtn}>◀</button>
                <span style={styles.counterText}>{currentIndex + 1} / 8</span>
                <button onClick={handleNext} style={styles.arrowBtn}>▶</button>
              </div>
            </section>

            {/* 말풍선 그룹 */}
            <section style={styles.speechGroup}>
              <div style={styles.speechSection}>
                <h3 style={styles.teamTitle}>A팀 개소리</h3>
                <div style={styles.bubbleContainer}>
                  <img src={speechBubbleImg} alt="bubble" style={styles.bubbleImg} />
                  <div style={styles.bubbleText}>{DUMMY_LOGS[currentIndex].teamA}</div>
                </div>
              </div>
              <div style={styles.speechSection}>
                <h3 style={styles.teamTitle}>B팀 개소리</h3>
                <div style={styles.bubbleContainer}>
                  <img src={speechBubbleImg} alt="bubble" style={styles.bubbleImg} />
                  <div style={styles.bubbleText}>{DUMMY_LOGS[currentIndex].teamB}</div>
                </div>
              </div>
            </section>
          </main>

          {/* 2. 하단 푸터 섹션 (투표 시간 + 버튼) */}
          <footer style={styles.footerSection}>
            <div style={styles.voteArea}>
              {/* 박진감 넘치는 타이머 */}
              <motion.div
                key={timeLeft}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  ...styles.timerBadge,
                  color: timeLeft <= 5 ? '#FF0000' : '#333',
                  // 5초 이하일 때 애니메이션 적용
                  animation: timeLeft <= 5 ? 'shake 0.15s infinite' : 'none'
                }}
              >
                {timeLeft > 0 ? `⌛ ${timeLeft}s` : "⌛ TIME OVER!"}
              </motion.div>
              {/* 0초일 때 나타나는 타임오버 오버레이 */}
              {timeLeft === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={styles.overlay} // 이 스타일이 블러와 전체 덮기를 담당
                >
                  <motion.img
                    src={voteFinishImg} // 도장 이미지 소스
                    alt="투표 종료 도장"
                    initial={{ scale: 4, rotate: -20, opacity: 0 }}
                    animate={{ scale: 1, rotate: -10, opacity: 1 }}
                    transition={{ type: "spring", damping: 12 }} // 쾅 찍히는 탄성 효과
                    style={styles.stampImg}
                  />
                </motion.div>
              )}

              <div style={styles.voteButtons}>
                <motion.button
                  disabled={timeLeft === 0}
                  style={{ ...styles.voteBtn, ...styles.voteBtnA }}
                  onClick={() => onVote('A')}
                  whileHover={{ scale: 1.05, rotate: -2, translateY: -5 }}
                  whileTap={{ scale: 0.95, x: 4, y: 4, boxShadow: '0px 0px 0px rgba(0,0,0,0)' }}
                >
                  A팀 투표!
                </motion.button>
                <motion.button
                  disabled={timeLeft === 0}
                  style={{ ...styles.voteBtn, ...styles.voteBtnB }}
                  onClick={() => onVote('B')}
                  whileHover={{ scale: 1.05, rotate: 2, translateY: -5 }}
                  whileTap={{ scale: 0.95, x: 4, y: 4, boxShadow: '0px 0px 0px rgba(0,0,0,0)' }}
                >
                  B팀 투표!
                </motion.button>
              </div>
            </div>
          </footer>
        </div>

        {/* 3. 우측 채팅 섹션 */}
        <aside style={styles.chatSection}>
          <ChatArea />
          {/* <div style={styles.chatTitle}>실시간 채팅</div>

          <div style={styles.chatList}>
            {/* 
            <div style={styles.floatingLayer}>
              {reactions.map(r => (
                <motion.div
                  key={r.id}
                  initial={{ y: 0, opacity: 1, x: Math.random() * 40 - 20 }}
                  animate={{ y: -150, opacity: 0, x: Math.random() * 100 - 50 }}
                  style={styles.floatingEmoji}
                >
                  {r.emoji}
                </motion.div>
              ))}
            </div>
          </div>

          <div style={styles.reactionGroup}>
            {['🐶', '👍', '👎', '🍅', 'ㅋㅋ', '🔥'].map((emoji) => (
              <motion.button
                key={emoji}
                style={styles.reactionBtn}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => addReaction(emoji)}
              >
                {emoji}
              </motion.button>
            ))}
          </div>

          <div style={styles.chatInputWrapper}>
            <input
              type="text"
              placeholder="개소리 투척... "
              style={styles.chatInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
                  // 채팅 전송 로직
                  e.currentTarget.value = '';
                }
              }}
            />
          </div> */}
        </aside>

      </div>
    </Background>
  );
};

// ==========================================
// 🎨 Styles (const)
// ==========================================

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    padding: '25px',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  // 왼쪽 영역을 감싸는 컨테이너
  leftSection: {
    flex: 2.5, // 채팅창보다 넓게 설정
    display: 'flex',
    flexDirection: 'column',
  },
  // 1번 섹션: 메인 컨텐츠
  mainContentArea: {
    flex: 2,
    display: 'flex',
    justifyContent: 'center',
    gap: '50px',
  },
  // 2번 섹션: 푸터
  footerSection: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    borderRadius: '15px',
  },
  header: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '15px',
    marginBottom: '1.5rem',
  },
  logo: {
    width: '500px',
    height: 'auto',
  },
  // 내부 컴포넌트용 상세 스타일
  cardSection: {
    width: '240px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  cardContainer: {
    width: '250px',
    height: '350px',
    position: 'relative',
  },
  cardFrame: {
    width: '100%',
    height: '100%',
    transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  cardInner: {
    width: '100%',
    height: '100%',
    position: 'relative',
    transformStyle: 'preserve-3d',
    boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
    borderRadius: '12px',
  },
  cardFront: {
    position: 'absolute',
    inset: 0,
    backfaceVisibility: 'hidden',
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '5px solid white',
  },
  cardBack: {
    position: 'absolute',
    inset: 0,
    backfaceVisibility: 'hidden',
    transform: 'rotateY(180deg)',
    backgroundColor: 'white',
    borderRadius: '12px',
  },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover' },
  arrowGroup: { display: 'flex', alignItems: 'center', gap: '15px' },
  arrowBtn: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', fontWeight: 900 },
  counterText: { fontWeight: 'bold', fontSize: '1.5rem' },

  // 중앙 메인
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px 0',
  },
  speechGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  speechSection: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  teamTitle: {
    fontSize: '2.3rem',
    fontWeight: 900,
    margin: 0
  },
  // 말풍선 컨테이너 (텍스트 정렬의 기준)
  bubbleContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '600px', // 이미지 크기에 맞춰 조절
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 불러온 이미지 스타일
  bubbleImg: {
    width: '100%',
    height: 'auto',
    filter: 'drop-shadow(5px 5px 0px rgba(0,0,0,0.1))', // 이미지에 그림자 효과
  },
  // 이미지 내부 텍스트 배치
  bubbleText: {
    position: 'absolute',
    // 이미지 모양에 따라 top 값을 미세하게 조정하세요 (보통 40% ~ 50% 사이)
    top: '46%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '75%', // 텍스트가 이미지 밖으로 나가지 않게 제한
    textAlign: 'center',
    fontSize: '1.5rem',
    fontWeight: 900,
    color: '#333',
    lineHeight: '1.3',
    wordBreak: 'keep-all', // 단어 단위 줄바꿈으로 깔끔하게
  },

  // 하단 투표
  voteArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  timerBadge: {
    padding: '15px 40px',
    fontSize: '2.2rem', // 압도적인 크기
    fontWeight: 900,
    // 찌글찌글한 테두리
    borderRadius: '40px 20px 55px 25px / 25px 55px 20px 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '250px',
    transition: 'all 0.1s ease-in-out',
  },
  overlay: {
    position: 'absolute', // leftSection을 기준으로 고정
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // 살짝 밝게 처리
    backdropFilter: 'blur(8px)', // ✨ 핵심: 뒷배경 흐리게
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100, // 다른 요소들보다 위에 오도록
    borderRadius: 'inherit', // 부모의 찌글찌글한 테두리를 그대로 따라감
  },
  stampImg: {
    width: '350px', // 도장 이미지 크기
    filter: 'drop-shadow(5px 5px 15px rgba(0,0,0,0.3))', // 도장 입체감
  },
  voteButtons: { display: 'flex', gap: '50px' },
  // 공통 투표 버튼 스타일
  voteBtn: {
    padding: '15px 100px',
    fontSize: '1.6rem',
    fontWeight: 900,
    fontFamily: 'inherit', // 폰트 상속 필수
    border: '4px solid #333',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    transition: 'all 0.1s cubic-bezier(0.17, 0.67, 0.83, 0.67)',
    boxShadow: '6px 6px 0px rgba(0, 0, 0, 0.2)',
  },

  // A팀 투표 버튼 (빨간색 + 비정형 테두리 1)
  voteBtnA: {
    backgroundColor: '#FF6B6B',
    color: 'white',
    // 로비 startButton의 비정형 테두리 적용
    borderRadius: '50px 15px 45px 20px / 20px 40px 25px 50px',
  },

  // B팀 투표 버튼 (파란색 + 비정형 테두리 2)
  voteBtnB: {
    backgroundColor: '#4D96FF',
    color: 'white',
    // 로비 randomButton의 비정형 테두리 적용
    borderRadius: '15px 50px 20px 45px / 40px 20px 50px 25px',
  },

  // 우측 채팅
  chatSection: {
    position: 'relative',
    flex: 1,
    display: 'flex',
    padding: '20px',
    // 🎨 더 울퉁불퉁하게 깎은 테두리
  },
  chatTitle: {
    fontSize: '1.5rem',
    fontWeight: 900,
    textAlign: 'center',
    marginBottom: '15px',
    fontFamily: 'inherit'
  },
  chatList: {
    position: 'relative', // 리액션 기준점
    flex: 1,
    backgroundColor: 'white',
    border: '3px solid #333',
    marginBottom: '15px',
    borderRadius: '20px 35px 15px 40px / 40px 15px 35px 20px',
    overflow: 'hidden' // 리액션이 박스 밖으로 안 나가게
  },
  // 🎥 유튜브식 리액션 효과용
  floatingLayer: {
    position: 'absolute',
    bottom: '10px',
    right: '50px',
    pointerEvents: 'none',
  },
  floatingEmoji: {
    position: 'absolute',
    fontSize: '2rem',
    fontWeight: 'bold',
  },

  reactionGroup: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '15px',
  },
  reactionBtn: {
    fontSize: '1.5rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.2))',
  },

  // 입력창 영역
  chatInputWrapper: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  chatInput: {
    width: '100%',
    padding: '18px',
    border: '4px solid #333',
    fontSize: '1.1rem',
    fontWeight: 900,
    fontFamily: 'inherit',
    outline: 'none',
    // ✍️ 손맛 가득한 울퉁불퉁 선
    borderRadius: '60px 25px 70px 30px / 30px 70px 25px 60px',
    backgroundColor: '#fff',
    boxShadow: 'inset 5px 5px 0px rgba(0,0,0,0.05)',
  },
  chatSendBtn: {
    padding: '10px 18px',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    fontWeight: 900,
    fontSize: '1rem',
    cursor: 'pointer',
    borderRadius: '8px 15px 5px 12px',
    fontFamily: 'inherit',
  },
};

export default VotingPhase;