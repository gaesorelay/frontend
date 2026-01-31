import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Background } from '@/components/common/background';
import voteLogoImg from '@/assets/logo/logo_vote.png';
import ChatArea from '../ChatArea';

const getVoteMentions = () => [
  "이족 보행의 자격이 없다고 느껴지는 팀에게 낙인을 찍으십시오.",
  "솔직해지세요. 당신도 이 개소리에 설득당하지 않았나요?",
  "인간으로 남을지, 개가 될지 결정하는 것은 오직 당신의 판결뿐입니다.",
  "나는 인간이길 포기했다는 저들이 보이십니까? 꿈을 이뤄주세요.",
  '개풀 뜯어먹는 소리 하고 있는 팀은 누구 인가?',
  '누가 더 미친 소리를 하였는가?'
];

const mentionList = getVoteMentions();
const randomIdx = Math.floor(Math.random() * mentionList.length);
const finalMent = mentionList[randomIdx];

const VotingPhase = () => {
  // 실시간 투표수 상태 (테스트용 초기값)
  const [votesA, setVotesA] = useState(15);
  const [votesB, setVotesB] = useState(12);

  const totalVotes = votesA + votesB || 1; // 0 나누기 방지
  const ratioA = (votesA / totalVotes) * 100;
  const ratioB = (votesB / totalVotes) * 100;

  const onVote = (team: 'A' | 'B') => {
    if (team === 'A') setVotesA(prev => prev + 1);
    else setVotesB(prev => prev + 1);
    // 실제 환경에서는 여기서 socket.emit('vote', team) 등을 호출
  };



  return (
    <Background>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gungsuh&display=swap');
        .gungsuh-font { font-family: 'Gungsuh', '궁서', serif !important; }

        /* 🔥 박진감 넘치는 로고 애니메이션 */
        @keyframes intense-shake {
          0% { transform: scale(1.2) rotate(0deg); }
          25% { transform: scale(1.25) rotate(-2deg); }
          50% { transform: scale(1.2) rotate(2deg); }
          75% { transform: scale(1.25) rotate(-1deg); }
          100% { transform: scale(1.2) rotate(0deg); }
        }
        .shake-logo { animation: intense-shake 0.5s infinite ease-in-out; }

        /* ⚡ 게이지 진동 효과 */
        @keyframes gauge-vibe {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
          100% { filter: brightness(1); }
        }
        .vibe-gauge { animation: gauge-vibe 0.1s infinite; }
      `}</style>

      <div style={styles.container}>
        <div style={styles.leftSection}>
          <AnimatePresence>
            <motion.div
              key="vote-time"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={styles.voteTimeContainer}
            >
              {/* 로고: 흔들리는 효과 적용 */}
              <div className="shake-logo">
                <img src={voteLogoImg} alt="로고" style={styles.logo} />
              </div>

              <h1 className="gungsuh-font" style={styles.voteTitle}>투 표 시 간</h1>
              <p className="gungsuh-font" style={styles.voteSubTitle}>{finalMent}</p>

              {/* 📊 실시간 병맛 게이지 */}
              <div style={styles.gaugeContainer}>
                {/* A팀 게이지 */}
                <motion.div
                  className="vibe-gauge"
                  initial={{ width: '50%' }}
                  animate={{ width: `${ratioA}%` }}
                  style={{ ...styles.gaugeBar, backgroundColor: '#FF6B6B', borderRight: '4px solid #333' }}
                >
                  <span style={styles.gaugeLabel}>A팀: {votesA}표</span>
                </motion.div>

                {/* B팀 게이지 */}
                <motion.div
                  className="vibe-gauge"
                  initial={{ width: '50%' }}
                  animate={{ width: `${ratioB}%` }}
                  style={{ ...styles.gaugeBar, backgroundColor: '#4D96FF' }}
                >
                  <span style={styles.gaugeLabel}>B팀: {votesB}표</span>
                </motion.div>

                {/* 중앙 번개 데코 */}
                <div style={styles.vsBadge}>VS</div>
              </div>

              {/* 투표 버튼 */}
              <div style={styles.voteButtons}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9, rotate: -5 }}
                  style={{ ...styles.voteBtn, backgroundColor: '#FF6B6B' }}
                  onClick={() => onVote('A')}
                >
                  A팀 투표!
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9, rotate: 5 }}
                  style={{ ...styles.voteBtn, backgroundColor: '#4D96FF' }}
                  onClick={() => onVote('B')}
                >
                  B팀 투표!
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <aside style={styles.chatSection}><ChatArea /></aside>
      </div>
    </Background>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: { display: 'flex', width: '100vw', height: '100vh' },
  leftSection: {
    flex: 3,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '450px',
    height: 'auto',
    filter: 'drop-shadow(5px 5px 0px rgba(0,0,0,0.2))',
  },
  voteTimeContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' },
  voteTitle: { fontSize: '5rem', fontWeight: 900, marginBottom: '10px', color: '#333', textShadow: '4px 4px 0 #fff' },
  voteSubTitle: { fontSize: '1.8rem', color: '#555', marginBottom: '40px' },

  /* 📊 게이지 스타일 */
  gaugeContainer: {
    width: '80%',
    height: '80px',
    backgroundColor: '#333',
    borderRadius: '15px',
    border: '6px solid #333',
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '60px',
    boxShadow: '10px 10px 0 rgba(0,0,0,0.2)',
  },
  gaugeBar: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'width 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  gaugeLabel: {
    color: '#fff',
    fontSize: '2rem',
    fontWeight: 900,
    textShadow: '2px 2px 0 #000',
    whiteSpace: 'nowrap'
  },
  vsBadge: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    border: '4px solid #333',
    padding: '5px 15px',
    fontSize: '1.5rem',
    fontWeight: 900,
    borderRadius: '50%',
    zIndex: 10,
  },

  voteButtons: { display: 'flex', gap: '40px' },
  voteBtn: {
    padding: '25px 80px',
    border: '5px solid #333',
    color: '#fff',
    fontSize: '2.2rem',
    fontWeight: 900,
    borderRadius: '20px',
    cursor: 'pointer',
    boxShadow: '10px 10px 0 #333',
    transition: 'all 0.1s'
  },
  chatSection: { flex: 1, padding: '10px' }
};

export default VotingPhase;