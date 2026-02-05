import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Background } from '@/components/common/background';
import { useGameStore } from '@/store/useGameStore';
import { useAudioStore } from '@/store/useAudioStore';
import { getCardImage } from '@/lib/cardMapper'; // 카드 이미지 매퍼
import { getStoryteller } from '@/lib/gameLogic'; // ⭐️ 작성자 찾기 로직
import storyLogoImg from '@/assets/logo/logo_story.png';
import finishLogoImg from '@/assets/logo/logo_finish.png'; // ⭐️ 인트로 로고 추가
import ChatArea from '../ChatArea';

const StoryPhase = () => {
  const { teamAStory, teamBStory, roundData, setStoryReviewFinished } = useGameStore();
  const { isMuted, toggleMute, playSFX } = useAudioStore(); // ⭐️ 뮤트 상태, SFX 재생 함수 가져오기
  const [currentTeam, setCurrentTeam] = useState<'A' | 'B'>('A');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const hasStartedRef = useRef(false);

  // ⭐️ 인트로 애니메이션 상태 추가
  const [showIntro, setShowIntro] = useState(true);

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

  // ⭐️ 인트로 타이머 (2초 후 해제)
  useEffect(() => {
    setStoryReviewFinished(false); // ⭐️ 진입 시 초기화
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2500); // 2.5초 정도 유지
    return () => clearTimeout(timer);
  }, []);

  // 2. 페이지 자동 넘김 로직 (인트로 끝나면 시작)
  useEffect(() => {
    if (isFinished || showIntro) return; // ⭐️ 인트로 중이면 넘기지 않음

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
          setTimeout(() => {
            setIsFinished(true);
            setStoryReviewFinished(true); // ⭐️ BGM 정지 신호
            playSFX('CYMBALS'); // ⭐️ 심벌즈 효과음 재생
          }, 1500);
          clearInterval(timer);
        }
      }
    }, 4500); // 감상 시간 (이미지+텍스트 고려하여 약간 넉넉히)

    return () => clearInterval(timer);
  }, [currentIndex, currentTeam, stories.length, isFinished, showIntro]);

  // 페이지가 넘어갈 때마다 효과음 재생 (첫 페이지 로딩은 제외)
  useEffect(() => {
    if (showIntro || isFinished) return;
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      return;
    }
    playSFX('NEXT_PAGE');
  }, [currentIndex, currentTeam, showIntro, isFinished, playSFX]);

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

      {/* ⭐️ 인트로 오버레이 */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(255, 255, 255, 0.4)', // 살짝 밝게
              backdropFilter: 'blur(15px)', // ⭐️ 블러 처리
              zIndex: 9999,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <motion.img
              src={finishLogoImg}
              alt="Intro Logo"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.8, ease: "backOut" }}
              style={{
                width: '600px', // 적절한 크기
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>



      {/* 🔇 뮤트 버튼 (좌측 상단 고정) */}
      <button
        onClick={toggleMute}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 9999,
          background: 'rgba(255, 255, 255, 0.8)',
          border: '3px solid #333',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          fontSize: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '3px 3px 0px rgba(0,0,0,0.2)',
        }}
        title={isMuted ? '소리 켜기' : '소리 끄기'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      <div style={styles.container}>
        <div style={styles.leftSection}>
          {!isFinished && !showIntro && (
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
            {!isFinished && !showIntro && stories.length > 0 && (
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
                        {/* ⭐️ 작성자 표시 추가 */}
                        <div style={styles.writerBadge} className="gungsuh-font">
                          ✍️ {getStoryteller(useGameStore.getState().players, currentTeam, currentIndex + 1)?.nickname || '알 수 없는 작가'}
                        </div>
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
              감상이 완료되었습니다!
              <br />
              투표를 준비하세요! 🗳️
            </div>
          )}
        </div>

        <div style={styles.rightSection}>
          <ChatArea />
        </div>
      </div>
    </Background >
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: { display: 'flex', width: '100vw', height: '100vh', boxSizing: 'border-box' },
  header: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '1.5rem 0',
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
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    minWidth: '950px', // 👈 책 프레임(900px)보다 약간 크게 최소 너비를 잡아 밀리지 않게 합니다.
  },

  stepContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    flex: 1, // 👈 추가: 상하 공간을 꽉 채우도록 합니다.
    justifyContent: 'center' // 👈 추가: 헤더 아래에서 수직 중앙 정렬
  },

  /* 3. 책의 높이를 조절하여 화면 이탈 방지 */
  realBookFrame: {
    width: '900px', // 👈 고정 너비 확인
    height: '520px',
    display: 'flex',
    backgroundColor: '#fffdf0',
    position: 'relative',
    border: '5px solid #333',
    boxShadow: '15px 15px 0 rgba(0,0,0,0.1)',
    overflow: 'visible',
    flexShrink: 0, // 👈 추가: 화면이 좁아져도 책이 구겨지지 않게 합니다.
  },

  /* 4. 좌우 분리 구조 */
  leftPage: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px',
    // borderRight 제거 혹은 아주 연하게 변경
    borderRight: '1px solid rgba(0,0,0,0.05)',
    zIndex: 1,
    // 배경색을 투명하게 하거나 아예 설정하지 않습니다.
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

  // 2. 이미지 스타일에서 흰색 박스(border)와 회색 배경을 제거합니다.
  bookIllustration: {
    width: '100%',
    height: '100%',
    objectFit: 'contain', // 비율은 유지
    // backgroundColor: '#f0f0f0', <- 이 줄을 삭제하거나 아래처럼 변경
    backgroundColor: 'transparent',
    // border: '8px solid #fff', <- 흰색 테두리 삭제
    // 그림자도 책장 위에 바로 그려진 느낌을 주려면 제거하거나 아주 약하게 조정
    filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))',
  },

  textPaper: { flex: 1 },
  bookText: { fontSize: '1.4rem', lineHeight: '1.8', color: '#111', fontWeight: 'bold', whiteSpace: 'pre-wrap', textAlign: 'center' },
  // ⭐️ 작성자 배지 스타일
  writerBadge: {
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '10px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '15px',
    padding: '2px 10px',
    display: 'inline-block',
    alignSelf: 'center', // flex item 중앙 정렬
  },
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
    flex: 1, // 👈 왼쪽이 4이므로 채팅창은 전체의 1/5만 차지하게 됩니다.
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '10px',
  },

  chatSection: { flex: 1, padding: '10px' }
};

export default StoryPhase;
