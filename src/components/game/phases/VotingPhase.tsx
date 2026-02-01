import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Background } from '@/components/common/background';
import voteLogoImg from '@/assets/logo/logo_vote.png';
import voteFinishImg from '@/assets/logo/vote_finish.png';
import ChatArea from '../ChatArea';

const VotingPhase = () => {
  const [votesA, setVotesA] = useState(15);
  const [votesB, setVotesB] = useState(12);
  const totalTime = 30;
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsTimeUp(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const onVote = (team: 'A' | 'B') => {
    if (isTimeUp) return;
    team === 'A' ? setVotesA((prev) => prev + 1) : setVotesB((prev) => prev + 1);
  };

  const timeRatio = (timeLeft / totalTime) * 100;
  const getTimerColor = () => {
    if (timeRatio > 50) return '#4ade80';
    if (timeRatio > 30) return '#facc15';
    return '#f87171';
  };

  // 1. 단계별 흔들림 강도 결정 로직
  const getShakeClass = () => {
    if (timeRatio <= 30) return 'shake-hard'; // 빨간색: 격렬하게
    if (timeRatio <= 50) return 'shake-soft'; // 노란색: 미세하게
    return ''; // 초록색: 평온
  };

  return (
    <Background>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gungsuh&display=swap');
        .gungsuh-font { font-family: 'Gungsuh', '궁서', serif !important; }

        /* 🫨 미세한 흔들림 (노란색 단계) */
        @keyframes shake-soft {
          0% { transform: translate(0, 0); }
          25% { transform: translate(1px, 1px); }
          50% { transform: translate(-1px, -1px); }
          75% { transform: translate(1px, -1px); }
          100% { transform: translate(0, 0); }
        }

        /* 🤯 격렬한 흔들림 (빨간색 단계) */
        @keyframes shake-hard {
          0% { transform: translate(0, 0) rotate(0deg); }
          20% { transform: translate(-3px, 2px) rotate(-1deg); }
          40% { transform: translate(-3px, -2px) rotate(1deg); }
          60% { transform: translate(3px, 2px) rotate(0deg); }
          80% { transform: translate(3px, -2px) rotate(-1deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }

        .shake-soft { animation: shake-soft 0.3s infinite; }
        .shake-hard { animation: shake-hard 0.1s infinite; }
        
        @keyframes v-pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(248, 113, 113, 0.7); }
          70% { box-shadow: 10px 0 20px 15px rgba(248, 113, 113, 0); }
          100% { box-shadow: 0 0 0 0 rgba(248, 113, 113, 0); }
        }
        .urgent-v { animation: v-pulse-red 1s infinite; }
      `}</style>

      <div style={{ ...styles.container, filter: isTimeUp ? 'blur(6px)' : 'none' }}>
        {/* 📏 세로형 사이드 타이머 바 (흔들림 클래스 추가) */}
        <div style={styles.sideTimerContainer} className={getShakeClass()}>
          <div style={styles.vTimerTrack}>
            <motion.div
              initial={{ height: '100%' }}
              animate={{ height: `${timeRatio}%`, backgroundColor: getTimerColor() }}
              transition={{ duration: 1, ease: 'linear' }}
              className={timeRatio <= 20 ? 'urgent-v' : ''}
              style={styles.vTimerFill}
            />
          </div>
          <div style={{ ...styles.vTimerText, color: getTimerColor() }}>{timeLeft}</div>
        </div>

        <div style={styles.leftSection}>
          {/* 로고 상단 중앙 배치 */}
          <div style={styles.topLogoArea}>
            <img src={voteLogoImg} alt="로고" style={styles.mainLogo} />
          </div>

          <div style={styles.voteTimeContainer}>
            <h1 className="gungsuh-font" style={styles.voteTitle}>
              투 표 시 간
            </h1>
            <p className="gungsuh-font" style={styles.voteSubTitle}>
              누가 더 미친 소리를 하였는가?
            </p>

            {/* 실시간 득표 게이지 */}
            <div style={styles.gaugeContainer}>
              <motion.div
                animate={{ width: `${(votesA / (votesA + votesB || 1)) * 100}%` }}
                style={{ ...styles.gaugeBar, backgroundColor: '#FF6B6B' }}
              >
                <span style={styles.gaugeLabel}>A팀: {votesA}</span>
              </motion.div>
              <motion.div
                animate={{ width: `${(votesB / (votesA + votesB || 1)) * 100}%` }}
                style={{ ...styles.gaugeBar, backgroundColor: '#4D96FF' }}
              >
                <span style={styles.gaugeLabel}>B팀: {votesB}</span>
              </motion.div>
              {/* <div style={styles.vsBadge}>VS</div> */}
            </div>

            <div style={styles.voteButtons}>
              <button
                disabled={isTimeUp}
                style={{ ...styles.voteBtn, backgroundColor: '#FF6B6B' }}
                onClick={() => onVote('A')}
              >
                A팀 투표!
              </button>
              <button
                disabled={isTimeUp}
                style={{ ...styles.voteBtn, backgroundColor: '#4D96FF' }}
                onClick={() => onVote('B')}
              >
                B팀 투표!
              </button>
            </div>
          </div>
        </div>

        <aside style={styles.chatSection}>
          <ChatArea />
        </aside>
      </div>

      <AnimatePresence>
        {isTimeUp && (
          <motion.div
            initial={{ scale: 4, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            style={styles.finishOverlay}
          >
            <img src={voteFinishImg} alt="종료" style={styles.finishImg} />

            {!aiResult && (
              <div className="gungsuh-font waiting-text">
                심사위원의 점수를 집계 중입니다... 잠시만 기다려주세요! 🐶
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Background>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    position: 'relative',
    transition: 'all 0.5s',
  },

  // 📏 세로형 타이머 스타일
  sideTimerContainer: {
    position: 'absolute',
    left: '40px',
    top: '10vh',
    bottom: '10vh',
    width: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    zIndex: 100,
  },
  vTimerTrack: {
    flex: 1,
    width: '20px',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: '10px',
    border: '4px solid #333',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end', // 아래에서 위로 차오르게 설정 (반대는 flex-start)
    overflow: 'hidden',
    boxShadow: '4px 4px 0 rgba(0,0,0,0.1)',
  },
  vTimerFill: {
    width: '100%',
    borderRadius: '2px',
  },
  vTimerText: {
    fontSize: '2rem',
    fontWeight: 900,
    fontFamily: 'monospace',
    textShadow: '2px 2px 0px #fff',
  },

  leftSection: {
    flex: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: '80px',
  },
  mainLogo: { width: '400px' },
  voteTimeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  voteTitle: { fontSize: '4.5rem', fontWeight: 900, marginBottom: '10px' },
  voteSubTitle: { fontSize: '1.6rem', color: '#555', marginBottom: '40px', textAlign: 'center' },

  gaugeContainer: {
    width: '85%',
    height: '85px',
    backgroundColor: '#333',
    borderRadius: '15px',
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '60px',
    border: '6px solid #333',
  },
  gaugeBar: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'width 0.3s',
  },
  gaugeLabel: { color: '#fff', fontSize: '2.2rem', fontWeight: 900 },
  // vsBadge: { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#fff', border: '4px solid #333', padding: '8px 20px', fontSize: '1.5rem', fontWeight: 900, borderRadius: '50%' },

  voteButtons: { display: 'flex', gap: '30px' },
  voteBtn: {
    padding: '25px 80px',
    border: '5px solid #333',
    color: '#fff',
    fontSize: '2.2rem',
    fontWeight: 900,
    borderRadius: '20px',
    cursor: 'pointer',
    boxShadow: '10px 10px 0 #333',
  },
  chatSection: { flex: 1, padding: '10px' },
  finishOverlay: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3000,
    backgroundColor: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(10px)',
  },
  finishImg: { width: '600px' },
};

export default VotingPhase;
