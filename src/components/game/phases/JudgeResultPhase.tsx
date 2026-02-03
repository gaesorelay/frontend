import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import ChatArea from '../ChatArea';
import { useGameStore } from '@/store/useGameStore';
import { useUserStore } from '@/store/useUserStore';
import { socket } from '@/lib/socket';
import { getResultJudgeImage } from '@/lib/judgeMapper'; // 이미지 매퍼

// 배경 및 로고 이미지
import bgImg from '@/assets/background.png';
import resultLogo from '@/assets/logo/resultlogo.png';
import finalLogo from '@/assets/logo/finallogo.png';
import ateamImg from '@/assets/logo/A.png';
import bteamImg from '@/assets/logo/B.png';
import airesultImg from '@/assets/logo/AIresult.png';
import AteamLogo from '@/assets/logo/Ateam.png';
import BteamLogo from '@/assets/logo/Bteam.png';
import teamALogo from '@/assets/logo/Ateamresult.png';
import teamBLogo from '@/assets/logo/Bteamresult.png';

const WIN_MENTS = [
  "${teamName} 승리! 뇌를 거치지 않고 뱉는 주둥이, 짐승 그 자체군요!",
  "${teamName} 승리! 개소리에 감동해서 동네 개들이 절하러 오는 중!",
  "${teamName} 승리! 오늘부로 지능 포기, 개소리 1위 등극 축하!",
  "${teamName} 승리! 똥개도 안 믿을 소리에 심사위원이 감동했멍!",
  "${teamName} 승리! 당신들의 논리는 이미 전봇대에 마킹되어 버려짐!"
];

const JudgeResultPhase = () => {
  // 1. Store에서 투표 결과(voteResult)와 게임 정보(roundData) 둘 다 가져옴
  const { voteResult, roundData } = useGameStore();
  const { isHost } = useUserStore();

  const navigator = useNavigate();
  const [introPhase, setIntroPhase] = useState(1);
  const [finalMent, setFinalMent] = useState("");
  const [animScore, setAnimScore] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; rot: number }[]>([]);

  // 게이지 애니메이션용 상태
  const [stagePublicA, setStagePublicA] = useState(0);
  const [stagePublicB, setStagePublicB] = useState(0);
  const [stageAIA, setStageAIA] = useState(0);
  const [stageAIB, setStageAIB] = useState(0);

  // 2. 서버 데이터 매칭 (⭐️ 인덱스 매핑으로 최적화)
  const realJudges = useMemo(() => {
    // 데이터가 없으면 빈 배열
    if (!voteResult?.aiJudges || !roundData?.judgeIds) return [];

    // ⭐️ 수정됨: 이름을 찾지 않고, 순서(index)대로 바로 매칭합니다.
    return voteResult.aiJudges.map((serverJudge, index) => {
      // roundData.judgeIds는 [{id: 11, ...}, {id: 9, ...}, ...] 순서가 보장됨
      const originJudge = (roundData.judgeIds as any[])[index];
      const judgeId = originJudge ? originJudge.id : 1; // 안전장치
      // console.log('매칭된 심사위원:', roundData.judgeIds, judgeId, serverJudge);
      return {
        id: judgeId,
        name: serverJudge.judgeName,
        // ID로 바로 이미지 가져오기
        image: getResultJudgeImage(judgeId),
        commentA: serverJudge.commentA,
        commentB: serverJudge.commentB,
        scoreA: serverJudge.scoreTeamA || 0,
        scoreB: serverJudge.scoreTeamB || 0,
      };
    });
  }, [voteResult, roundData]);

  // 3. 점수 계산
  const publicA = voteResult?.votesTeamA || 0;
  const publicB = voteResult?.votesTeamB || 0;

  const aiTotalA = realJudges.reduce((acc, cur) => acc + cur.scoreA, 0);
  const aiTotalB = realJudges.reduce((acc, cur) => acc + cur.scoreB, 0);

  const totalA = publicA + aiTotalA;
  const totalB = publicB + aiTotalB;

  const winnerName = (voteResult?.winner === 'A' ? 'A팀' : voteResult?.winner === 'B' ? 'B팀' : (totalA > totalB ? 'A팀' : 'B팀'));

  // 4. 페이즈 타이머
  useEffect(() => {
    if (!voteResult) return;

    const timers = [
      setTimeout(() => setIntroPhase(2), 2000),   // A팀 관객 점수
      setTimeout(() => setIntroPhase(3), 6000),   // B팀 관객 점수
      setTimeout(() => setIntroPhase(4), 10000),  // 1차 합산
      setTimeout(() => setIntroPhase(5), 17000),  // A팀 AI 심사
      setTimeout(() => setIntroPhase(6), 22000),  // B팀 AI 심사
      setTimeout(() => setIntroPhase(7), 27000),  // 최종 합산
      // 8단계(Game Over)로 가지 않음!
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, [voteResult, winnerName]);

  // ⭐️ 100초 후 자동 exit (별도 Effect로 분리)
  useEffect(() => {
    if (introPhase === 7) {
      const timer = setTimeout(() => {
        navigator('/');
      }, 100000);
      return () => clearTimeout(timer);
    }
  }, [introPhase, navigator]);

  // 5. 점수 카운팅 애니메이션
  useEffect(() => {
    if (introPhase !== 2 && introPhase !== 3) return;

    let current = 0;
    const target = introPhase === 2 ? publicA : publicB;

    setAnimScore(0);
    const interval = setInterval(() => {
      if (current < target) {
        const step = Math.ceil(target / 50) || 1;
        current = Math.min(current + step, target);
        setAnimScore(current);

        const newParticle = { id: Math.random(), x: Math.random() * 100, y: Math.random() * 100, rot: Math.random() * 360 };
        setParticles(prev => [...prev.slice(-20), newParticle]);
      } else {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [introPhase, publicA, publicB]);

  // 6. 게이지 애니메이션
  useEffect(() => {
    if (introPhase === 4) {
      let curA = 0, curB = 0;
      const interval = setInterval(() => {
        let done = true;
        if (curA < publicA) { curA += Math.ceil(publicA / 50) || 1; if (curA > publicA) curA = publicA; done = false; }
        if (curB < publicB) { curB += Math.ceil(publicB / 50) || 1; if (curB > publicB) curB = publicB; done = false; }
        setStagePublicA(curA);
        setStagePublicB(curB);
        if (done) clearInterval(interval);
      }, 40);
      return () => clearInterval(interval);
    }
    if (introPhase === 7) {
      let curAiA = 0, curAiB = 0;
      const interval = setInterval(() => {
        let done = true;
        if (curAiA < aiTotalA) { curAiA += Math.ceil(aiTotalA / 50) || 1; if (curAiA > aiTotalA) curAiA = aiTotalA; done = false; }
        if (curAiB < aiTotalB) { curAiB += Math.ceil(aiTotalB / 50) || 1; if (curAiB > aiTotalB) curAiB = aiTotalB; done = false; }
        setStageAIA(curAiA);
        setStageAIB(curAiB);
        if (done) clearInterval(interval);
      }, 40);
      return () => clearInterval(interval);
    }
  }, [introPhase, publicA, publicB, aiTotalA, aiTotalB]);

  if (!voteResult) return null;

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, backgroundImage: `url(${bgImg})`, backgroundSize: 'cover', backgroundPosition: 'center',
      fontFamily: '"Gaegu", cursive', overflow: 'hidden', zIndex: 9999, display: 'flex', flexDirection: 'column'
    }}>
      <style>{`
        @keyframes full-screen-pop { 0% { transform: scale(0); opacity: 0; } 50% { opacity: 1; transform: scale(1.5); } 100% { transform: scale(1) translateY(-50px); opacity: 0; } }
        @keyframes stamp-slam { 0% { transform: translate(-50%, -50%) scale(5); opacity: 0; } 100% { transform: translate(-50%, -50%) scale(1) rotate(-15deg); opacity: 1; } }
        @keyframes elastic-zoomies { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes slide-in-right { 0% { transform: translateX(100%) scale(0.5); opacity: 0; } 100% { transform: translateX(0) scale(1); opacity: 1; } }
        @keyframes slide-in-left { 0% { transform: translateX(-100%) scale(0.5); opacity: 0; } 100% { transform: translateX(0) scale(1); opacity: 1; } }
        @keyframes zoom-in-judge { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes pop-comment { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }

        .particle-full { position: absolute; color: #facc15; font-size: 3rem; font-weight: 900; animation: full-screen-pop 0.4s forwards; text-shadow: 4px 4px 0 #000; z-index: 11000; }
        .intro-overlay { position: fixed; top: 0; left: 0; width: calc(100% - 380px); height: 100%; z-index: 10000; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #000; transition: 0.5s; }
        .hidden { opacity: 0; visibility: hidden; pointer-events: none; }
        .score-huge { font-size: 11rem; color: #fff; text-shadow: 0 0 30px #ff4444; font-weight: 900; }
        .gauge-container { width: 300px; height: 35px; background: #333; border: 3px solid #111; border-radius: 20px; overflow: hidden; position: relative; }
        .gauge-fill { height: 100%; transition: width 0.1s ease-out; }
        .judge-card-mini { width: 110px; text-align: center; background: #fff; padding: 10px; border-radius: 10px; border: 2px solid #111; font-size: 0.8rem; }
      `}</style>

      {[4, 7].includes(introPhase) && <img src={resultLogo} style={{
        position: 'absolute', top: '-100px',
        left: 'calc((100vw - 380px) / 2)', transform: 'translateX(-50%)',
        height: '350px', width: 'auto', zIndex: 20001, filter: 'drop-shadow(4px 4px 0 #000)',
        objectFit: 'contain'
      }} />}

      <div className={`intro-overlay ${[1, 2, 3, 5, 6, 8].includes(introPhase) ? '' : 'hidden'}`}>
        {particles.map(p => (
          <span key={p.id} className="particle-full" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: `rotate(${p.rot}deg)` }}>+1</span>
        ))}

        {introPhase === 1 && <img src={finalLogo} style={{ width: '50%', objectFit: 'contain', animation: 'elastic-zoomies 0.8s' }} />}

        {(introPhase === 2 || introPhase === 3) && (
          <div key={`phase-${introPhase}`} style={{ textAlign: 'center', animation: introPhase === 2 ? 'slide-in-left 0.5s both' : 'slide-in-right 0.5s both' }}>
            <div style={{ marginBottom: '-30px' }}>
              <img src={introPhase === 2 ? AteamLogo : BteamLogo} style={{ width: '650px', objectFit: 'contain', filter: 'drop-shadow(5px 5px 0 #000)' }} />
            </div>
            <div className="score-huge">{animScore}</div>
          </div>
        )}

        {(introPhase === 5 || introPhase === 6) && (
          <div key={`judge-${introPhase}`} style={{ textAlign: 'center', width: '100%', animation: 'zoom-in-judge 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '40px', background: 'rgba(255,255,255,0.1)', padding: '20px 50px', borderRadius: '20px', border: '3px solid #333' }}>
              <img src={introPhase === 5 ? ateamImg : bteamImg} style={{ height: '110px', objectFit: 'contain' }} />
              <img src={airesultImg} style={{ height: '220px', objectFit: 'contain' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '15px', justifyContent: 'center', width: '100%' }}>
              {realJudges.map((j, i) => {
                const pScore = introPhase === 5 ? j.scoreA : j.scoreB;
                const pComment = introPhase === 5 ? j.commentA : j.commentB;
                return (
                  <div key={i} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                    background: '#fff', padding: '20px', borderRadius: '20px', border: '4px solid #111',
                    width: '240px', animation: `slide-in-right 0.4s ${i * 0.15}s both`,
                    boxShadow: '10px 10px 0 rgba(0,0,0,0.2)', position: 'relative'
                  }}>
                    <img src={j.image} style={{ width: '120px', height: '120px', borderRadius: '15px', objectFit: 'cover', border: '3px solid #ddd' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#111', marginBottom: '5px' }}>{j.name}</div>
                      <div style={{ fontSize: '1.1rem', color: '#555', wordBreak: 'keep-all', lineHeight: '1.3', animation: `pop-comment 0.5s ${0.3 + i * 0.2}s both` }}>
                        "{pComment}"
                      </div>
                    </div>
                    <div style={{
                      position: 'absolute', top: '-15px', right: '-15px',
                      background: '#ff0000', color: '#fff', fontSize: '1.5rem', fontWeight: 900,
                      padding: '5px 15px', borderRadius: '20px', border: '3px solid #fff',
                      boxShadow: '4px 4px 0 rgba(0,0,0,0.3)', transform: 'rotate(15deg)',
                      animation: `pop-comment 0.5s ${0.6 + i * 0.2}s both`
                    }}>
                      +{pScore}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: '2.5rem', color: '#facc15', marginTop: '30px', fontWeight: 900, textShadow: '2px 2px 0 #000', animation: 'elastic-zoomies 0.5s 1.5s both' }}>
              AI Score: {introPhase === 5 ? aiTotalA : aiTotalB}점
            </div>
          </div>
        )}

        {introPhase === 8 && (
          <div style={{ textAlign: 'center', animation: 'zoom-in-judge 0.5s both', padding: '0 5vw', position: 'relative', marginTop: '15vh' }}>
            <div style={{ fontSize: '7rem', fontWeight: 900, color: '#facc15', marginBottom: '40px', textShadow: '0 0 30px #ff0000' }}>GAME OVER</div>
            <div style={{ fontSize: '3.5rem', background: '#fff', padding: '40px 80px', border: '8px solid #111', borderRadius: '40px', lineHeight: '1.4', transform: 'rotate(-2deg)', boxShadow: '20px 20px 0 #000' }}>{finalMent}</div>

            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-15deg)',
              border: '10px solid #ff0000', color: '#ff0000', padding: '20px 50px', borderRadius: '20px',
              fontSize: '5rem', fontWeight: 900, background: 'rgba(255,255,255,0.9)',
              animation: 'stamp-slam 0.3s 1s both', zIndex: 12000, whiteSpace: 'nowrap',
              boxShadow: '0 0 50px rgba(255,0,0,0.5)'
            }}>
              인간 포기 완료!
            </div>

            <div style={{ marginTop: '80px', display: 'flex', gap: '30px', justifyContent: 'center', position: 'relative', zIndex: 13000 }}>
              <button
                onClick={() => setIntroPhase(7)}
                style={{
                  fontFamily: '"Gaegu", cursive', fontSize: '2.5rem', fontWeight: 900,
                  padding: '15px 40px', borderRadius: '50px', border: '5px solid #fff',
                  background: '#333', color: '#fff', cursor: 'pointer',
                  boxShadow: '8px 8px 0 rgba(0,0,0,0.5)', transition: '0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                결과 화면 보기
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  fontFamily: '"Gaegu", cursive', fontSize: '2.5rem', fontWeight: 900,
                  padding: '15px 40px', borderRadius: '50px', border: '5px solid #111',
                  background: '#facc15', color: '#111', cursor: 'pointer',
                  boxShadow: '8px 8px 0 rgba(0,0,0,0.5)', transition: '0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                한 판 더 하기
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', padding: '0 0 4vw 4vw', gap: '2vw' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '15vh', justifyContent: 'flex-start', opacity: [4, 7].includes(introPhase) ? 1 : 0, transition: '0.5s' }}>
          <div style={{ display: 'flex', gap: '60px', marginTop: '2vh' }}>

            <div style={{ textAlign: 'center' }}>
              <img src={teamALogo} style={{ width: '420px', objectFit: 'contain' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '300px', fontWeight: 900, fontSize: '1.5rem', marginBottom: '5px', textShadow: '2px 2px 0 #000' }}>
                <span style={{ color: '#ffb3b3' }}>관객 {stagePublicA}</span>
                <span style={{ color: '#ff3333' }}>AI {stageAIA}</span>
              </div>
              <div className="gauge-container">
                <div className="gauge-fill" style={{ width: `${((stagePublicA + stageAIA) / (totalA + totalB || 1)) * 100}%`, background: '#ff4444' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${(stagePublicA / (totalA + totalB || 1)) * 100}%`, background: '#ff7f7f', opacity: 0.8 }} />
              </div>
            </div>

            <div style={{ fontSize: '5rem', fontWeight: 900, alignSelf: 'center' }}>VS</div>

            <div style={{ textAlign: 'center' }}>
              <img src={teamBLogo} style={{ width: '420px', objectFit: 'contain' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '300px', fontWeight: 900, fontSize: '1.5rem', marginBottom: '5px', textShadow: '2px 2px 0 #000' }}>
                <span style={{ color: '#99ccff' }}>관객 {stagePublicB}</span>
                <span style={{ color: '#3385ff' }}>AI {stageAIB}</span>
              </div>
              <div className="gauge-container">
                <div className="gauge-fill" style={{ width: `${((stagePublicB + stageAIB) / (totalA + totalB || 1)) * 100}%`, background: '#3b82f6' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${(stagePublicB / (totalA + totalB || 1)) * 100}%`, background: '#7fb2ff', opacity: 0.8 }} />
              </div>
            </div>
          </div>

          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginTop: '30px', marginBottom: '10px', background: '#333', padding: '5px 30px', borderRadius: '20px', border: '2px solid #fff', boxShadow: '5px 5px 0 #000' }}>
            AI 심사위원단
          </div>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            {realJudges.map((j, i) => (
              <div key={i} className="judge-card-mini" style={{ animation: `elastic-zoomies 0.5s ${i * 0.1}s both` }}>
                <img src={j.image} style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ddd', marginBottom: '5px' }} />
                <div style={{ fontWeight: 900 }}>{j.name}</div>
              </div>
            ))}
          </div>
        </div>

        {introPhase === 7 && (
          <div style={{
            position: 'fixed', bottom: '30px', right: '400px', zIndex: 11000,
            display: 'flex', gap: '20px'
          }}>
            <button
              onClick={() => navigator('/')}
              style={{
                fontFamily: '"Gaegu", cursive', fontSize: '1.5rem', fontWeight: 900,
                padding: '10px 30px', borderRadius: '30px', border: '3px solid #fff',
                background: '#ff4444', color: '#fff', cursor: 'pointer',
                boxShadow: '5px 5px 0 rgba(0,0,0,0.5)', transition: '0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              나가기
            </button>
            {isHost && (
              <button
                onClick={() => socket.emit('restart_game')}
                style={{
                  fontFamily: '"Gaegu", cursive', fontSize: '1.5rem', fontWeight: 900,
                  padding: '10px 30px', borderRadius: '30px', border: '3px solid #fff',
                  background: '#333', color: '#fff', cursor: 'pointer',
                  boxShadow: '5px 5px 0 rgba(0,0,0,0.5)', transition: '0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                한 판 더 하기
              </button>
            )}
          </div>
        )}

        <div style={{ width: '380px', height: '100%', display: 'flex', paddingTop: '50px', paddingRight: '15px' }}>
          <ChatArea />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default JudgeResultPhase;