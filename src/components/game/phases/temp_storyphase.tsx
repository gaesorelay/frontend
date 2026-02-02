import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Background } from '@/components/common/background';
import { useGameStore } from '@/store/useGameStore'; // 스토어 임포트
import { getCardImage } from '@/lib/cardMapper'; // 카드 이미지 매퍼
import storyLogoImg from '@/assets/logo/logo_story.png';
import ChatArea from '../ChatArea';

const StoryPhase = () => {
  const { teamAStory, teamBStory, roundData } = useGameStore();
  const [currentTeam, setCurrentTeam] = useState<'A' | 'B'>('A');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // 1. 실제 데이터 결합 (카드 ID + 해당 팀의 문장)
  const stories = useMemo(() => {
    // A팀 혹은 B팀의 현재 보여줄 리스트 선정
    const currentTeamStory = currentTeam === 'A' ? teamAStory : teamBStory;
    
    // roundData.cardIds [ID1, ID2, ... ID8] 와 매칭
    return (roundData?.cardIds || []).map((cardId, index) => ({
      cardImg: getCardImage(cardId),
      content: currentTeamStory[index] || "이야기가 작성되지 않았습니다. 😢",
    }));
  }, [currentTeam, teamAStory, teamBStory, roundData]);

  // 2. 페이지 자동 넘김 로직
  useEffect(() => {
    if (isFinished) return;

    const timer = setInterval(() => {
      if (currentIndex < stories.length - 1) {
        // 다음 라운드(페이지)로 이동
        setCurrentIndex(prev => prev + 1);
      } else {
        // 해당 팀의 마지막 페이지인 경우
        if (currentTeam === 'A') {
          // A팀 끝났으면 B팀으로 전환 준비
          setTimeout(() => {
            setCurrentTeam('B');
            setCurrentIndex(0);
          }, 1500); // 팀 전환 전 잠깐 대기
          clearInterval(timer);
        } else {
          // B팀까지 다 끝났으면 종료
          setTimeout(() => setIsFinished(true), 1500);
          clearInterval(timer);
        }
      }
    }, 4500); // 감상 시간 (이미지+텍스트 고려하여 약간 넉넉히)

    return () => clearInterval(timer);
  }, [currentIndex, currentTeam, stories.length, isFinished]);

  return (
    <Background>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gungsuh&display=swap');
        .gungsuh-font { font-family: 'Gungsuh', '궁서', serif !important; }
        .book-wrapper { perspective: 2000px; }
        @keyframes pulse-soft {
          0% { transform: scale(1.2); filter: drop-shadow(3px 3px 0px rgba(0,0,0,0.1)); }
          50% { transform: scale(1.25); filter: drop-shadow(5px 8px 15px rgba(255,215,0,0.3)); }
          100% { transform: scale(1.2); filter: drop-shadow(3px 3px 0px rgba(0,0,0,0.1)); }
        }
        .pulse-logo { animation: pulse-soft 0.5s infinite ease-in-out; }
      `}</style>

      <div style={styles.container}>
        <div style={styles.leftSection}>
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
                {currentTeam === 'A' ? 'A팀 기상천외한 이야기' : 'B팀 상상초월 스토리'} 감상 중... ({currentIndex + 1}/{stories.length})
              </motion.div>
            </header>
          )}

          <AnimatePresence mode="wait">
            {!isFinished && stories.length > 0 && (
              <motion.div
                key={`${currentTeam}-${currentIndex}`} // 팀/인덱스 바뀔 때마다 애니메이션 실행
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.6 }}
                className="book-wrapper"
                style={styles.stepContainer}
              >
                <div className="sketch-box-container" style={styles.realBookFrame}>
                  {/* 왼쪽 페이지: 해당 라운드의 카드 이미지 */}
                  <div style={styles.leftPage}>
                    <img 
                      src={stories[currentIndex].cardImg} 
                      style={styles.bookIllustration} 
                      alt={`Round ${currentIndex + 1} Card`}
                    />
                  </div>

                  {/* 오른쪽 페이지: 해당 라운드에 작성한 텍스트 */}
                  <div style={styles.rightPageWrapper}>
                    <div style={styles.rightPage}>
                      <div style={styles.textPaper}>
                        <p className="gungsuh-font" style={styles.bookText}>
                          {stories[currentIndex].content}
                        </p>
                      </div>

                      {currentIndex === stories.length - 1 ? (
                        <div style={styles.endText} className="gungsuh-font">
                           {currentTeam === 'A' ? "B팀 이야기로 계속..." : "- THE END -"}
                        </div>
                      ) : (
                        <div style={styles.pageNumber}>NEXT ROUND...</div>
                      )}
                    </div>
                  </div>

                  <div style={styles.bookSpineLine} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isFinished && (
            <div className="gungsuh-font" style={{ fontSize: '3rem', color: '#333' }}>
              감상이 완료되었습니다! 투표를 준비하세요! 🗳️
            </div>
          )}
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