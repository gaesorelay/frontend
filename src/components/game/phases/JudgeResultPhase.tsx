import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import ChatArea from '../ChatArea';

import bgImg from '@/assets/background.png';
import resultLogo from '@/assets/logo/resultlogo.png';
import finalLogo from '@/assets/logo/finallogo.png';
import ateam from '@/assets/dog/shiba.png';
import bteam from '@/assets/dog/fug1.png';
import airesult from '@/assets/logo/AIresult.png';
import Ateam from '@/assets/logo/Ateam.png';
import Bteam from '@/assets/logo/Bteam.png';
import teamALogo from '@/assets/logo/Ateamresult.png';
import teamBLogo from '@/assets/logo/Bteamresult.png';
import logoA from '@/assets/logo/A.png';
import logoB from '@/assets/logo/B.png';
import countImg from '@/assets/logo/Acount.png';
import countImgB from '@/assets/logo/Bcount.png';


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

const LOSE_MENTS = [
  "${teamName} 패배! 너무 사람같이 말해서 노잼으로 판명됨. 반성하셈.",
  "${teamName} 패배! 심사위원이 그냥 여러분 얼굴이 킹받는대요.",
  "${teamName} 패배! 개소리는 못해도 사람은 착할 수도.. 아, 아님.",
  "${teamName} 패배! 오늘부터 산책 금지! 사료 대신 반성문 드세요.",
  "${teamName} 패배! 개껌 씹던 심사위원이 정색하게 만든 노잼 논리!"
];

const JudgeResultPhase = () => {
  const [selectedJudges] = useState<Judge[]>(() => {
    const savedData = localStorage.getItem('SELECTED_JUDGES_V2');
    if (savedData) return JSON.parse(savedData);
    const picked = [...MASTER_DB].sort(() => 0.5 - Math.random()).slice(0, 3);
    localStorage.setItem('SELECTED_JUDGES_V2', JSON.stringify(picked));
    return picked;
  });

  const [introPhase, setIntroPhase] = useState(1);
  const [finalMent, setFinalMent] = useState("");
  const [animScoreA, setAnimScoreA] = useState(0);
  const [animScoreB, setAnimScoreB] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; rot: number }[]>([]);

  const [stagePublicA, setStagePublicA] = useState(0);
  const [stagePublicB, setStagePublicB] = useState(0);
  const [stageAIA, setStageAIA] = useState(0);
  const [stageAIB, setStageAIB] = useState(0);
  const [showScore, setShowScore] = useState(false);

  const aiTotalA = MOCK_RESULT.teamA.ai.reduce((a, b) => a + b, 0);
  const aiTotalB = MOCK_RESULT.teamB.ai.reduce((a, b) => a + b, 0);
  const totalA = MOCK_RESULT.teamA.public + aiTotalA;
  const totalB = MOCK_RESULT.teamB.public + aiTotalB;

  useEffect(() => {
    const timers = [
      setTimeout(() => setIntroPhase(2), 3000),   // Phase 2: A Title
      setTimeout(() => setIntroPhase(3), 5000),   // Phase 3: A Public Score
      setTimeout(() => setIntroPhase(4), 9000),   // Phase 4: A AI Analysis
      setTimeout(() => setIntroPhase(5), 15000),  // Phase 5: B Title
      setTimeout(() => setIntroPhase(6), 17000),  // Phase 6: B Public Score
      setTimeout(() => setIntroPhase(7), 21000),  // Phase 7: B AI Analysis
      setTimeout(() => setIntroPhase(8), 27000),  // Phase 8: Blackout
      setTimeout(() => {
        setIntroPhase(9); // Phase 9: Final Result
        const winner = totalA > totalB ? 'A팀' : 'B팀';
        setFinalMent(WIN_MENTS[Math.floor(Math.random() * WIN_MENTS.length)].replace('${teamName}', winner));
      }, 28000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, [totalA, totalB]);

  // Public Score Animation (Phase 3 & 6)
  useEffect(() => {
    setParticles([]); // Clear previous particles
    let interval: any;

    if (introPhase === 3) {
      let cur = 0;
      const target = MOCK_RESULT.teamA.public;
      interval = setInterval(() => {
        let changed = false;
        if (cur < target) { cur++; setAnimScoreA(cur); changed = true; }
        else clearInterval(interval);

        if (changed) {
          // Spawn multiple particles for chaos
          const count = Math.floor(Math.random() * 3) + 2;
          const newParticles = Array.from({ length: count }).map(() => ({
            id: Math.random(),
            x: Math.random() * 100,
            y: Math.random() * 100,
            rot: Math.random() * 360
          }));
          setParticles(prev => [...prev.slice(-30), ...newParticles]);
        }
      }, 30);
    }
    if (introPhase === 6) {
      let cur = 0;
      const target = MOCK_RESULT.teamB.public;
      interval = setInterval(() => {
        let changed = false;
        if (cur < target) { cur++; setAnimScoreB(cur); changed = true; }
        else clearInterval(interval);

        if (changed) {
          // Spawn multiple particles for chaos
          const count = Math.floor(Math.random() * 3) + 2;
          const newParticles = Array.from({ length: count }).map(() => ({
            id: Math.random(),
            x: Math.random() * 100,
            y: Math.random() * 100,
            rot: Math.random() * 360
          }));
          setParticles(prev => [...prev.slice(-30), ...newParticles]);
        }
      }, 30);
    }
    return () => clearInterval(interval);
  }, [introPhase]);

  // Phase 3: AI Animation or other logic if needed (currently static display is fine)
  // Phase 9: Final Gauge Animation (Sequentially: Public -> AI)
  useEffect(() => {
    if (introPhase === 9) {
      // 1. Reset
      setStagePublicA(0); setStagePublicB(0);
      setStageAIA(0); setStageAIB(0);

      const targetPubA = MOCK_RESULT.teamA.public;
      const targetPubB = MOCK_RESULT.teamB.public;
      const targetAiA = aiTotalA;
      const targetAiB = aiTotalB;

      let pA = 0, pB = 0, aA = 0, aB = 0;
      let phase = 'public'; // 'public' -> 'ai'

      const interval = setInterval(() => {
        if (phase === 'public') {
          let change = false;
          if (pA < targetPubA) { pA++; setStagePublicA(pA); change = true; }
          if (pB < targetPubB) { pB++; setStagePublicB(pB); change = true; }

          if (!change) {
            phase = 'ai'; // Switch to AI animation
          }
        } else if (phase === 'ai') {
          let change = false;
          if (aA < targetAiA) { aA++; setStageAIA(aA); change = true; }
          if (aB < targetAiB) { aB++; setStageAIB(aB); change = true; }

          if (!change) {
            clearInterval(interval);
          }
        }
      }, 30); // Animation speed

      return () => clearInterval(interval);
    }
  }, [introPhase]);

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
        .intro-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 99999; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); backdrop-filter: blur(5px); transition: 0.5s; }
        .intro-overlay.dark-mode { background: rgba(0,0,0,0.95); backdrop-filter: blur(10px); }
        .hidden { opacity: 0; visibility: hidden; pointer-events: none; }
        .score-huge { font-size: 11rem; color: #fff; text-shadow: 0 0 30px #ff4444; font-weight: 900; }
        .gauge-container { width: 300px; height: 35px; background: #333; border: 3px solid #111; border-radius: 20px; overflow: hidden; position: relative; }
        .gauge-fill { height: 100%; transition: width 0.1s ease-out; }
        .judge-card-mini { width: 110px; text-align: center; background: #fff; padding: 10px; border-radius: 10px; border: 2px solid #111; font-size: 0.8rem; }
      `}</style>

      {[9, 10].includes(introPhase) && <img src={resultLogo} style={{
        position: 'absolute', top: '-100px',
        left: 'calc((100vw - 380px) / 2)', transform: 'translateX(-50%)',
        height: '350px', width: 'auto', zIndex: 20001, filter: 'drop-shadow(4px 4px 0 #000)',
        objectFit: 'contain'
      }} />}

      <div className={`intro-overlay ${[1, 2, 3, 4, 5, 6, 7, 8].includes(introPhase) ? '' : 'hidden'} ${[1, 2, 3, 4, 5, 6, 7, 8].includes(introPhase) ? 'dark-mode' : ''}`}>
        {particles.map(p => (
          <img key={p.id} src={introPhase === 6 ? countImgB : countImg} className="particle-full" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: `rotate(${p.rot}deg)`, width: '100px', height: '100px', objectFit: 'contain' }} />
        ))}

        {introPhase === 1 && <img src={finalLogo} style={{ width: '50%', objectFit: 'contain', animation: 'elastic-zoomies 0.8s' }} />}

        {/* Phase 2: A Team Title */}
        {introPhase === 2 && (
          <div style={{ textAlign: 'center', width: '100%', zIndex: 12000 }}>
            <div style={{ animation: 'bounce-in 0.8s both' }}>
              <img src={Ateam} style={{ width: '700px', objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(255,0,0,0.5))' }} />
            </div>
          </div>
        )}

        {/* Phase 3: A Team Public Score */}
        {introPhase === 3 && (
          <div style={{ textAlign: 'center', width: '100%', zIndex: 12000 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
              <div style={{ background: 'rgba(0,0,0,0.6)', padding: '30px 60px', borderRadius: '30px', border: '5px solid #ff4444', animation: 'elastic-zoomies 0.5s 0.2s both' }}>
                <div style={{ fontSize: '3rem', color: '#ffb3b3', marginBottom: '20px' }}>관객 투표 점수</div>
                <img src={ateam} style={{ width: '200px', height: '200px', objectFit: 'contain', borderRadius: '50%', border: '5px solid #fff', marginBottom: '20px' }} />
                <div style={{ fontSize: '7rem', fontWeight: 900, color: '#ff4444', textShadow: '4px 4px 0 #000' }}>{animScoreA}점</div>
              </div>
            </div>
          </div>
        )}

        {introPhase === 4 && (
          <div style={{ textAlign: 'center', width: '100%', zIndex: 12000 }}>
            <img src={airesult} style={{ width: '400px', objectFit: 'contain', animation: 'bounce-in 0.5s', marginBottom: '30px', filter: 'drop-shadow(0 0 10px #facc15)' }} />
            <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {selectedJudges.map((j, i) => (
                <div key={`a-${i}`} style={{ background: '#fff', padding: '20px', borderRadius: '20px', width: '220px', border: '4px solid #ff4444', animation: `pop-comment 0.5s ${i * 0.2}s both`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img src={j.image} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '15px' }} />
                  <div style={{ fontSize: '1.3rem', fontWeight: 900 }}>{j.name}</div>
                  <div style={{ fontSize: '1rem', margin: '15px 0', wordBreak: 'keep-all', flex: 1, display: 'flex', alignItems: 'center' }}>"{j.commentA}"</div>
                  <div style={{ fontWeight: 900, color: '#f00', fontSize: '2rem' }}>+{MOCK_RESULT.teamA.ai[i]}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '40px', fontSize: '3rem', color: '#fff', fontWeight: 900, animation: 'elastic-zoomies 0.5s 1.5s both', textShadow: '0 0 20px #facc15' }}>
              AI 총점: <span style={{ color: '#facc15' }}>{aiTotalA}점</span>
            </div>
          </div>
        )}

        {/* Phase 5: B Team Title */}
        {introPhase === 5 && (
          <div style={{ textAlign: 'center', width: '100%', zIndex: 12000 }}>
            <div style={{ animation: 'bounce-in 0.8s both' }}>
              <img src={Bteam} style={{ width: '700px', objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(0,0,255,0.5))' }} />
            </div>
          </div>
        )}

        {/* Phase 6: B Team Public Score */}
        {introPhase === 6 && (
          <div style={{ textAlign: 'center', width: '100%', zIndex: 12000 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
              <div style={{ background: 'rgba(0,0,0,0.6)', padding: '30px 60px', borderRadius: '30px', border: '5px solid #3b82f6', animation: 'elastic-zoomies 0.5s 0.2s both' }}>
                <div style={{ fontSize: '3rem', color: '#99ccff', marginBottom: '20px' }}>관객 투표 점수</div>
                <img src={bteam} style={{ width: '200px', height: '200px', objectFit: 'contain', borderRadius: '50%', border: '5px solid #fff', marginBottom: '20px' }} />
                <div style={{ fontSize: '7rem', fontWeight: 900, color: '#3b82f6', textShadow: '4px 4px 0 #000' }}>{animScoreB}점</div>
              </div>
            </div>
          </div>
        )}

        {introPhase === 7 && (
          <div style={{ textAlign: 'center', width: '100%', zIndex: 12000 }}>
            <img src={airesult} style={{ width: '400px', objectFit: 'contain', animation: 'bounce-in 0.5s', marginBottom: '30px', filter: 'drop-shadow(0 0 10px #facc15)' }} />
            <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {selectedJudges.map((j, i) => (
                <div key={`b-${i}`} style={{ background: '#fff', padding: '20px', borderRadius: '20px', width: '220px', border: '4px solid #3b82f6', animation: `pop-comment 0.5s ${i * 0.2}s both`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img src={j.image} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '15px' }} />
                  <div style={{ fontSize: '1.3rem', fontWeight: 900 }}>{j.name}</div>
                  <div style={{ fontSize: '1rem', margin: '15px 0', wordBreak: 'keep-all', flex: 1, display: 'flex', alignItems: 'center' }}>"{j.commentB}"</div>
                  <div style={{ fontWeight: 900, color: '#00f', fontSize: '2rem' }}>+{MOCK_RESULT.teamB.ai[i]}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '40px', fontSize: '3rem', color: '#fff', fontWeight: 900, animation: 'elastic-zoomies 0.5s 1.5s both', textShadow: '0 0 20px #facc15' }}>
              AI 총점: <span style={{ color: '#facc15' }}>{aiTotalB}점</span>
            </div>
          </div>
        )}






      </div>

      <div style={{ flex: 1, display: 'flex', padding: '0 0 4vw 4vw', gap: '2vw' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '15vh', justifyContent: 'flex-start', opacity: 1, transition: '0.5s' }}>

          {/* Phase 8 Blackout - Just wait */}

          {/* Main Stage Content - Partially Visible in background, Fully visible in Phase 9 */}
          <div style={{ display: 'flex', gap: '60px', marginTop: '2vh', opacity: [1, 2, 3, 4, 5, 6, 7, 8].includes(introPhase) ? 0 : 1, transition: '0.5s', pointerEvents: [1, 2, 3, 4, 5, 6, 7, 8].includes(introPhase) ? 'none' : 'auto' }}>
            {/* A팀 섹션 */}
            <div style={{ textAlign: 'center' }}>
              <img src={logoA} style={{ width: '300px', objectFit: 'contain' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', width: '300px', fontWeight: 900, fontSize: '1.5rem', marginBottom: '5px', textShadow: '2px 2px 0 #000' }}>
                <span style={{ color: '#ffb3b3' }}>관객 {stagePublicA}</span>
                <span style={{ color: '#ff3333' }}>AI {stageAIA}</span>
              </div>

              <div className="gauge-container">
                <div className="gauge-fill" style={{ width: `${((stagePublicA + stageAIA) / (totalA + totalB || 1)) * 100}%`, background: '#ff4444' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${(stagePublicA / (totalA + totalB || 1)) * 100}%`, background: '#ff7f7f', opacity: 0.8 }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '5rem', fontWeight: 900, marginBottom: '20px' }}>VS</div>
            </div>

            {/* B팀 섹션 */}
            <div style={{ textAlign: 'center' }}>
              <img src={logoB} style={{ width: '300px', objectFit: 'contain' }} />

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





        </div>

        {/* Final Stamp (Overlay on Main Page - Exclude Chat Area) */}
        {introPhase === 9 && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: 'calc(100% - 380px)', height: '100%', zIndex: 15000, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: '10vh' }}>

            {/* Funny Ment (Slide Up) */}
            <div style={{
              fontSize: '2.5rem', color: '#fff', fontWeight: 900, textShadow: '3px 3px 6px #000',
              textAlign: 'center', maxWidth: '90%', marginBottom: '40px',
              animation: 'slide-in-up 0.8s both', wordBreak: 'keep-all', lineHeight: '1.4'
            }}>
              {finalMent}
            </div>

            <div style={{
              transform: 'rotate(-15deg)',
              border: '10px solid #ff0000', color: '#ff0000', padding: '20px 50px', borderRadius: '20px',
              fontSize: '5rem', fontWeight: 900, background: 'rgba(255,255,255,0.95)',
              animation: 'stamp-slam 0.5s both', whiteSpace: 'nowrap',
              boxShadow: '0 0 50px rgba(255,0,0,0.5)'
            }}>
              {totalA > totalB ? 'A팀 승리!' : 'B팀 승리!'}
            </div>
          </div>
        )}

        {/* Floating Play Again Button */}
        {introPhase === 9 && (
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

        <div style={{ width: '380px', height: '100%', display: 'flex', paddingTop: '50px', paddingRight: '15px', opacity: introPhase === 9 ? 1 : 0, transition: '0.5s', pointerEvents: introPhase === 9 ? 'auto' : 'none' }}>
          <ChatArea />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default JudgeResultPhase;