import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import ChatArea from '../ChatArea';
import { socket } from '@/lib/socket';

import bgImg from '@/assets/background.png';
import resultLogo from '@/assets/logo/resultlogo.png';
import finalLogo from '@/assets/logo/finallogo.png';
import ateam from '@/assets/logo/A.png';
import bteam from '@/assets/logo/B.png';
import airesult from '@/assets/logo/AIresult.png';
import Ateam from '@/assets/logo/Ateam.png';
import Bteam from '@/assets/logo/Bteam.png';
import teamALogo from '@/assets/logo/Ateamresult.png';
import teamBLogo from '@/assets/logo/Bteamresult.png';

// 심사위원 이미지 import
import judge1 from '@/assets/judge/result/1.png';
import judge2 from '@/assets/judge/result/2.png';
import judge3 from '@/assets/judge/result/3.png';
import judge4 from '@/assets/judge/result/4.png';
import judge5 from '@/assets/judge/result/5.png';
import judge6 from '@/assets/judge/result/6.png';
import judge7 from '@/assets/judge/result/7.png';
import judge8 from '@/assets/judge/result/8.png';
import judge9 from '@/assets/judge/result/9.png';
import judge10 from '@/assets/judge/result/10.png';
import judge11 from '@/assets/judge/result/11.png';
import judge12 from '@/assets/judge/result/12.png';

interface Judge {
  id: number;
  name: string;
  image: string;
  commentA: string;
  commentB: string;
}

export interface AiJudgeScore {
  judgeName: string;
  commentA: string;
  commentB: string;
  scoreTeamA: number;
  scoreTeamB: number;
}

export interface VoteOutcome {
  roomUuid: string;
  votesTeamA: number;
  votesTeamB: number;
  winner: 'A' | 'B' | 'DRAW';
  aiJudges?: AiJudgeScore[];
}

const MASTER_DB: Judge[] = [
  { id: 1, name: 'AI 판독기 V1', image: judge1, commentA: "창의적이야! (멍!)", commentB: "데이터 부족. (왈!)" },
  { id: 2, name: '멍성재 2.0', image: judge2, commentA: "완벽한 개소리!", commentB: "너무 논리적이야. 탈락." },
  { id: 3, name: '팩트사망 로봇', image: judge3, commentA: "팩트 0%? 훌륭해.", commentB: "팩트가 섞였어. 불순해." },
  { id: 4, name: '엄근진 햄스터', image: judge4, commentA: "볼주머니 저장각.", commentB: "해바라기씨 압수." },
  { id: 5, name: '개소리 소믈리에', image: judge5, commentA: "1등급 똥오줌 향기.", commentB: "숙성이 덜 됐어." },
  { id: 6, name: '논리 파괴자', image: judge6, commentA: "뇌가 녹는다... 합격!", commentB: "말이 되잖아? 재미없어." },
  { id: 7, name: '왈왈 박사', image: judge7, commentA: "학계에 보고하겠네.", commentB: "공부 더 해오게." },
  { id: 8, name: '사오정 귀', image: judge8, commentA: "뭐라고? 안들려! 합격!", commentB: "너무 잘 들려. 감점." },
  { id: 9, name: '투머치 토커', image: judge9, commentA: "진짜가 나타났다.", commentB: "말이 짧아. 더 짖어." },
  { id: 10, name: '단호박 판사', image: judge10, commentA: "인정. 땅땅땅!", commentB: "기각한다." },
  { id: 11, name: '꿈꾸는 강아지', image: judge11, commentA: "꿈결 같구나...", commentB: "잠이 확 깨네." },
  { id: 12, name: '알고리즘 신', image: judge12, commentA: "알고리즘의 선택.", commentB: "노출수 떡락 예상." },
];

const MOCK_RESULT = {
  teamA: { name: 'A팀', public: 45, ai: [15, 20, 25] },
  teamB: { name: 'B팀', public: 38, ai: [10, 25, 30] },
};

const WIN_MENTS = [
  "${teamName} 승리! 뇌를 거치지 않고 뱉는 주둥이, 짐승 그 자체군요!",
  "${teamName} 승리! 개소리에 감동해서 동네 개들이 절하러 오는 중!",
  "${teamName} 승리! 오늘부로 지능 포기, 개소리 1위 등극 축하!",
  "${teamName} 승리! 똥개도 안 믿을 소리에 심사위원이 감동했멍!",
  "${teamName} 승리! 당신들의 논리는 이미 전봇대에 마킹되어 버려짐!"
];

const JudgeResultPhase = () => {
	const [resultData, setResultData] = useState<VoteOutcome | null>(null);
  const [selectedJudges] = useState<Judge[]>(() => {
    const savedData = localStorage.getItem('SELECTED_JUDGES_V2');
    if (savedData) return JSON.parse(savedData);
    const picked = [...MASTER_DB].sort(() => 0.5 - Math.random()).slice(0, 3);
    localStorage.setItem('SELECTED_JUDGES_V2', JSON.stringify(picked));
    return picked;
  });

  const [introPhase, setIntroPhase] = useState(1);
  const [finalMent, setFinalMent] = useState("");
  const [animScore, setAnimScore] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; rot: number }[]>([]);

  const [stagePublicA, setStagePublicA] = useState(0);
  const [stagePublicB, setStagePublicB] = useState(0);
  const [stageAIA, setStageAIA] = useState(0);
  const [stageAIB, setStageAIB] = useState(0);

  const aiTotalA = MOCK_RESULT.teamA.ai.reduce((a, b) => a + b, 0);
  const aiTotalB = MOCK_RESULT.teamB.ai.reduce((a, b) => a + b, 0);
  const totalA = MOCK_RESULT.teamA.public + aiTotalA;
  const totalB = MOCK_RESULT.teamB.public + aiTotalB;

  useEffect(() => {
    const timers = [
      setTimeout(() => setIntroPhase(2), 2000),   // Start Phase 2 (A Score)
      setTimeout(() => setIntroPhase(3), 6000),   // Start Phase 3 (B Score) -> 4s (Fast)
      setTimeout(() => setIntroPhase(4), 10000),  // Start Phase 4 (Main Stage Gauge) -> 7s (Slow & Tensor)
      setTimeout(() => setIntroPhase(5), 17000),  // Start Phase 5 (A AI)
      setTimeout(() => setIntroPhase(6), 22000),  // Start Phase 6 (B AI)
      setTimeout(() => setIntroPhase(7), 27000),  // Start Phase 7 (Total Gauge) -> 7s (Slow & Tensor)
      setTimeout(() => {
        setIntroPhase(8); // Start Phase 8 (Game Over)
        const winner = totalA > totalB ? 'A팀' : 'B팀';
        setFinalMent(WIN_MENTS[Math.floor(Math.random() * WIN_MENTS.length)].replace('${teamName}', winner));
      }, 34000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, [totalA, totalB]);

  useEffect(() => {
    if (introPhase !== 2 && introPhase !== 3) return;
    let current = 0;
    const target = introPhase === 2 ? MOCK_RESULT.teamA.public : MOCK_RESULT.teamB.public;
    setAnimScore(0);
    const interval = setInterval(() => {
      if (current < target) {
        current++;
        setAnimScore(current);
        const newParticle = { id: Math.random(), x: Math.random() * 100, y: Math.random() * 100, rot: Math.random() * 360 };
        setParticles(prev => [...prev.slice(-20), newParticle]);
      } else {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [introPhase]);

  useEffect(() => {
    if (introPhase === 4) {
      let curA = 0, curB = 0;
      const interval = setInterval(() => {
        let done = true;
        if (curA < MOCK_RESULT.teamA.public) { curA++; done = false; }
        if (curB < MOCK_RESULT.teamB.public) { curB++; done = false; }
        setStagePublicA(curA);
        setStagePublicB(curB);
        if (done) clearInterval(interval);
      }, 40);
      return () => clearInterval(interval);
    }
    if (introPhase === 7) {
      let aiA = 0, aiB = 0;
      const interval = setInterval(() => {
        let done = true;
        if (aiA < aiTotalA) { aiA++; done = false; }
        if (aiB < aiTotalB) { aiB++; done = false; }
        setStageAIA(aiA);
        setStageAIB(aiB);
        if (done) clearInterval(interval);
      }, 40);
      return () => clearInterval(interval);
    }
  }, [introPhase, aiTotalA, aiTotalB]);

  useEffect(() => {
  const handleVoteResult = (data: VoteOutcome) => {
		// 🔍 [확인용 콘솔] 데이터가 어떻게 들어오는지 여기서 확인하세요!
		console.log("🏆 서버로부터 최종 결과 데이터를 받았습니다:", data);
		
		setResultData(data);
	};

	socket.on('vote_result', handleVoteResult);

	return () => {
		socket.off('vote_result', handleVoteResult);
	};
	}, []);

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
              <img src={introPhase === 2 ? Ateam : Bteam} style={{ width: '650px', objectFit: 'contain', filter: 'drop-shadow(5px 5px 0 #000)' }} />
            </div>
            <div className="score-huge">{animScore}</div>
          </div>
        )}

        {(introPhase === 5 || introPhase === 6) && (
          <div key={`judge-${introPhase}`} style={{ textAlign: 'center', width: '100%', animation: 'zoom-in-judge 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '40px', background: 'rgba(255,255,255,0.1)', padding: '20px 50px', borderRadius: '20px', border: '3px solid #333' }}>
              <img src={introPhase === 5 ? ateam : bteam} style={{ height: '110px', objectFit: 'contain' }} />
              <img src={airesult} style={{ height: '220px', objectFit: 'contain' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '15px', justifyContent: 'center', width: '100%' }}>
              {selectedJudges.map((j, i) => {
                const pScore = introPhase === 5 ? MOCK_RESULT.teamA.ai[i] : MOCK_RESULT.teamB.ai[i];
                return (
                  <div key={i} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                    background: '#fff', padding: '20px', borderRadius: '20px', border: '4px solid #111',
                    width: '220px',
                    animation: `slide-in-right 0.4s ${i * 0.15}s both`,
                    boxShadow: '10px 10px 0 rgba(0,0,0,0.2)', position: 'relative'
                  }}>
                    <img src={j.image} style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ddd' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#111', marginBottom: '5px' }}>{j.name}</div>
                      <div style={{ fontSize: '1.1rem', color: '#555', wordBreak: 'keep-all', lineHeight: '1.2', animation: `pop-comment 0.5s ${0.3 + i * 0.2}s both` }}>
                        "{introPhase === 5 ? j.commentA : j.commentB}"
                      </div>
                    </div>
                    {/* Individual Score Badge */}
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

            {/* Stamp Effect */}
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
            {/* A팀 섹션 */}
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

            {/* B팀 섹션 */}
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


          {/* AI 심사위원단 Label added here */}
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginTop: '30px', marginBottom: '10px', background: '#333', padding: '5px 30px', borderRadius: '20px', border: '2px solid #fff', boxShadow: '5px 5px 0 #000' }}>
            AI 심사위원단
          </div>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            {selectedJudges.map((j, i) => (
              <div key={i} className="judge-card-mini" style={{ animation: `elastic-zoomies 0.5s ${i * 0.1}s both` }}>
                <img src={j.image} style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ddd', marginBottom: '5px' }} />
                <div style={{ fontWeight: 900 }}>{j.name}</div>
              </div>
            ))}
          </div>


        </div>

        {/* Floating Play Again Button */}
        {introPhase === 7 && (
          <button
            onClick={() => window.location.reload()}
            style={{
              position: 'fixed', bottom: '30px', right: '400px', zIndex: 11000,
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

        <div style={{ width: '380px', height: '100%', display: 'flex', paddingTop: '50px', paddingRight: '15px' }}>
          <ChatArea />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default JudgeResultPhase;