import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Background } from '@/components/common/background';
import storyLogoImg from '@/assets/logo/logo_story.png';
import ChatArea from '../ChatArea';

const DUMMY_LOGS = Array.from({ length: 8 }).map((_, i) => ({
  id: i,
  cardImg: `https://picsum.photos/400/550?random=${i}`,
  teamA: `A팀의 개소리 #${i + 1}\n\n"강아지 꼬리는 사실 안테나입니다. 신호를 받으면 헬리콥터처럼 날아갈 수 있죠."`,
  teamB: `B팀의 개소리 #${i + 1}\n\n"고양이는 사실 닌자 학교 졸업생입니다. 밤에 우는 건 졸업가 부르는 거예요."`,
}));

const StoryPhase = () => {
  const [currentTeam, setCurrentTeam] = useState<'A' | 'B'>('A');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentIndex < DUMMY_LOGS.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        if (currentTeam === 'A') {
          setTimeout(() => {
            setCurrentTeam('B');
            setCurrentIndex(0);
          }, 1000);
        } else {
          setTimeout(() => setIsFinished(true), 1500);
          clearInterval(timer);
        }
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [currentIndex, currentTeam]);

  return (
    <Background>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gungsuh&display=swap');
        .gungsuh-font { font-family: 'Gungsuh', '궁서', serif !important; }
        
        /* 📖 오른쪽 페이지만 넘어가는 느낌을 위한 원근법 설정 */
        .book-wrapper { perspective: 2000px; }

        /* 로고 두근거림 애니메이션 */
        @keyframes pulse-soft {
          0% { transform: scale(1.2); filter: drop-shadow(3px 3px 0px rgba(0,0,0,0.1)); }
          50% { transform: scale(1.25); filter: drop-shadow(5px 8px 15px rgba(255,215,0,0.3)); }
          100% { transform: scale(1.2); filter: drop-shadow(3px 3px 0px rgba(0,0,0,0.1)); }
        }
        .pulse-logo { animation: pulse-soft 0.5s infinite ease-in-out; }
      `}</style>

      <div style={styles.container}>
        <div style={styles.leftSection}>

          {/* 1. 헤더 크기 키우기 & 2. 멘트 글자 줄이기 */}
          {!isFinished && (
            <header style={styles.header} className='pulse-logo'>
              <img src={storyLogoImg} alt="로고" style={styles.logo} />
              <motion.div
                key={currentTeam}
                initial={{ y: -5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{
                  ...styles.statusMent,
                  color: currentTeam === 'A' ? '#FF6B6B' : '#4D96FF'
                }}
                className="gungsuh-font"
              >
                {currentTeam}팀 스토리 감상 중... ({currentIndex + 1}/{DUMMY_LOGS.length})
              </motion.div>
            </header>
          )}

          <AnimatePresence mode="wait">
            {!isFinished && (
              <motion.div
                key={currentTeam}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="book-wrapper"
                style={styles.stepContainer}
              >
                {/* 3. 화면 안에 책이 다 나오도록 프레임 조정 */}
                <div className="sketch-box-container" style={styles.realBookFrame}>
                  {/* 왼쪽 페이지 (고정) */}
                  <div style={styles.leftPage}>
                    <img src={DUMMY_LOGS[currentIndex].cardImg} style={styles.bookIllustration} />
                  </div>

                  {/* 4. 중앙선 기준 오른쪽만 넘어가는 애니메이션 영역 */}
                  <div style={styles.rightPageWrapper}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${currentTeam}-${currentIndex}`}
                        /* 중앙(왼쪽 끝)을 축으로 회전 */
                        initial={{ rotateY: 0, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: -80, opacity: 0 }}
                        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                        style={{
                          ...styles.rightPage,
                          transformOrigin: 'left center', // 중앙선 축 고정
                        }}
                      >
                        <div style={styles.textPaper}>
                          <p className="gungsuh-font" style={styles.bookText}>
                            {currentTeam === 'A' ? DUMMY_LOGS[currentIndex].teamA : DUMMY_LOGS[currentIndex].teamB}
                          </p>
                        </div>

                        {currentIndex === DUMMY_LOGS.length - 1 ? (
                          <div style={styles.endText} className="gungsuh-font">- END -</div>
                        ) : (
                          <div style={styles.pageNumber}>NEXT PAGE...</div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* 책 중앙 세로선 */}
                  <div style={styles.bookSpineLine} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div style={styles.rightSection}>
          <aside style={styles.chatSection}><ChatArea /></aside>
        </div>
      </div>
    </Background>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: { display: 'flex', width: '100vw', height: '100vh', padding: '20px', boxSizing: 'border-box' },
  header: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '1.5rem',
    zIndex: 10,
    transform: 'scale(1.2)', // 1. 헤더 전체 크기 키우기
  },
  logo: {
    width: '450px', // 1. 로고 가로폭 확장
    height: 'auto',
    filter: 'drop-shadow(3px 3px 0px rgba(0,0,0,0.1))',
  },
  statusMent: {
    fontSize: '1.2rem', // 2. 글자 크기 줄임 (비장미 강조)
    fontWeight: 900,
    marginTop: '5px',
    background: 'rgba(255,255,255,0.9)',
    padding: '3px 15px',
    borderRadius: '20px',
    border: '2px solid #333',
  },
  leftSection: {
    flex: 3,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center', // 3. 중앙 정렬로 책이 다 보이게 함
    alignItems: 'center',
    height: '100%',
  },
  stepContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' },

  /* 3. 책의 높이를 조절하여 화면 이탈 방지 */
  realBookFrame: {
    width: '900px',
    height: '520px',
    display: 'flex',
    backgroundColor: '#fffdf0',
    position: 'relative',
    border: '5px solid #333',
    boxShadow: '15px 15px 0 rgba(0,0,0,0.1)',
    overflow: 'visible' // 애니메이션 시 회전 반경 허용
  },

  /* 4. 좌우 분리 구조 */
  leftPage: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px',
    borderRight: '1px solid #ddd',
    zIndex: 1
  },
  rightPageWrapper: {
    flex: 1,
    position: 'relative',
    perspective: '1500px'
  },
  rightPage: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: '50px 40px',
    backgroundColor: '#fffef5',
    backfaceVisibility: 'hidden',
    zIndex: 2
  },

  bookIllustration: { width: '100%', height: '100%', objectFit: 'cover', border: '8px solid #fff', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' },
  textPaper: { flex: 1 },
  bookText: { fontSize: '1.4rem', lineHeight: '1.8', color: '#111', fontWeight: 'bold', whiteSpace: 'pre-wrap', textAlign: 'center' },
  pageNumber: { textAlign: 'center', fontSize: '0.8rem', color: '#aaa', fontWeight: 800 },
  endText: { textAlign: 'center', fontSize: '1.8rem', color: '#FF6B6B', fontWeight: 900 },

  bookSpineLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: '4px',
    background: 'rgba(0,0,0,0.2)',
    zIndex: 10,
    transform: 'translateX(-50%)'
  },
  rightSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  chatSection: { flex: 1, padding: '10px' }
};

export default StoryPhase;