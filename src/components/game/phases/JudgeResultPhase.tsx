import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

import bgImg from '@/assets/background.png';
import resultLogo from '@/assets/logo/resultlogo.png';

// ✅ 심사위원 이미지 import
import judge1 from '@/assets/result/1.png';
import judge2 from '@/assets/result/2.png';
import judge3 from '@/assets/result/3.png';
import judge4 from '@/assets/result/4.png';
import judge5 from '@/assets/result/5.png';
import judge6 from '@/assets/result/6.png';
import judge7 from '@/assets/result/7.png';
import judge8 from '@/assets/result/8.png';
import judge9 from '@/assets/result/9.png';
import judge10 from '@/assets/result/10.png';
import judge11 from '@/assets/result/11.png';
import judge12 from '@/assets/result/12.png';

interface Props { }

const MASTER_DB = [
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

const getVictoryMentions = (teamName: string) => [
  `[속보] ${teamName}, '인간 실격' 처분 확정!`,
  `${teamName} 전원, 지능 반납 절차 완료.`,
  `금일부터 ${teamName}의 직립 보행을 금지합니다.`,
  `검사 결과: ${teamName}의 전두엽 기능 영구 정지.`,
  `${teamName}의 노예 계약 효력 발생! 왈왈!`,
  `${teamName}, 이성(Reason) 수치 0% 도달 축하.`,
  `DNA 정밀 판독 결과: ${teamName} = 100% 짐승.`,
  `${teamName}의 영혼 판매 계약 성사 (환불 불가).`,
  `국가공인 '멍멍이' 자격증 발급: ${teamName} 귀하.`,
  `${teamName}의 언어 구사 능력이 완전히 소멸됨.`
];

const JudgeResultPhase = ({ }: Props) => {
  const [selectedJudges, setSelectedJudges] = useState<typeof MASTER_DB>(() => {
    const savedData = localStorage.getItem('SELECTED_JUDGES_DB');
    if (savedData) return JSON.parse(savedData);
    const shuffled = [...MASTER_DB].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, 3);
    localStorage.setItem('SELECTED_JUDGES_DB', JSON.stringify(picked));
    return picked;
  });

  const [introPhase, setIntroPhase] = useState(1);
  const [step, setStep] = useState(0);

  const [scoreA, setScoreA] = useState({ public: 0, aiSteps: [0, 0, 0] });
  const [scoreB, setScoreB] = useState({ public: 0, aiSteps: [0, 0, 0] });
  const [chats, setChats] = useState([{ user: '시스템', msg: '🐶 개소리 분석기 가동 중... 삐빅!', color: '#ff4444' }]);
  const [inputValue, setInputValue] = useState('');
  const [finalMent, setFinalMent] = useState("");

  const [animPublic, setAnimPublic] = useState(0);
  const [animAI, setAnimAI] = useState(0);
  const [isCounting, setIsCounting] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const aiTotalA = MOCK_RESULT.teamA.ai.reduce((a, b) => a + b, 0);
  const aiTotalB = MOCK_RESULT.teamB.ai.reduce((a, b) => a + b, 0);
  const totalA = MOCK_RESULT.teamA.public + aiTotalA;
  const totalB = MOCK_RESULT.teamB.public + aiTotalB;

  useEffect(() => {
    setTimeout(() => setIntroPhase(2), 3000);
    setTimeout(() => setIntroPhase(3), 8500);

    setTimeout(() => {
      setIntroPhase(4);
      setStep(5);

      setScoreA({ public: MOCK_RESULT.teamA.public, aiSteps: MOCK_RESULT.teamA.ai });
      setScoreB({ public: MOCK_RESULT.teamB.public, aiSteps: MOCK_RESULT.teamB.ai });

      const winnerName = totalA > totalB ? MOCK_RESULT.teamA.name : MOCK_RESULT.teamB.name;
      const mentionList = getVictoryMentions(winnerName);
      const randomIdx = Math.floor(Math.random() * mentionList.length);
      setFinalMent(mentionList[randomIdx]);

    }, 14000);
  }, []);

  // 🔢 병맛 점수 카운트업
  useEffect(() => {
    let targetPublic = 0;
    let targetAI = 0;

    if (introPhase === 2) { targetPublic = MOCK_RESULT.teamA.public; targetAI = aiTotalA; }
    else if (introPhase === 3) { targetPublic = MOCK_RESULT.teamB.public; targetAI = aiTotalB; }
    else { return; }

    setAnimPublic(0);
    setAnimAI(0);
    setIsCounting(true);

    const duration = 2000;
    const interval = 40;
    const steps = duration / interval;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      const progress = current / steps;

      let jitterPublic = Math.random() * (targetPublic * 0.3) * (Math.random() > 0.5 ? 1 : -1);
      let jitterAI = Math.random() * (targetAI * 0.3) * (Math.random() > 0.5 ? 1 : -1);

      let currentPublic = Math.floor(targetPublic * progress + jitterPublic * (1 - progress));
      let currentAI = Math.floor(targetAI * progress + jitterAI * (1 - progress));

      setAnimPublic(Math.max(0, Math.min(currentPublic, targetPublic + 10)));
      setAnimAI(Math.max(0, Math.min(currentAI, targetAI + 5)));

      if (current >= steps) {
        setAnimPublic(targetPublic);
        setAnimAI(targetAI);
        setIsCounting(false);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [introPhase, aiTotalA, aiTotalB]);


  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chats]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setChats(prev => [...prev, { user: '나', msg: inputValue, color: '#facc15' }]);
    setInputValue('');
  };

  if (selectedJudges.length === 0) return null;

  const winnerName = totalA > totalB ? 'A팀' : 'B팀';

  return createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundImage: `url(${bgImg})`,
      backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
      fontFamily: '"Gaegu", cursive', overflow: 'hidden', zIndex: 9999, display: 'flex', flexDirection: 'column',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gaegu:wght@300;400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap');

        body::after {
            content: ""; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNDAwIDQwMCI+PGZpbHRlciBpZD0ibm9pc2UiPjxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjY1IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlc30ic3RpdGNoIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=');
            pointer-events: none; z-index: 99999; opacity: 0.4;
        }

        @keyframes popIn { 
            0% { transform: scale(0) rotate(-10deg); opacity: 0; } 
            70% { transform: scale(1.1) rotate(5deg); opacity: 1; } 
            100% { transform: scale(1) rotate(0deg); } 
        }
        
        @keyframes wobble-mad { 
          0% { transform: translate(0, 0) rotate(0deg) scale(1); } 
          25% { transform: translate(-5px, 5px) rotate(-3deg) scale(1.1); color: #ff0000; } 
          50% { transform: translate(-5px, -5px) rotate(2deg) scale(0.9); color: #ffff00; } 
          75% { transform: translate(5px, 5px) rotate(-2deg) scale(1.05); color: #00ff00; } 
          100% { transform: translate(0, 0) rotate(0deg) scale(1); } 
        }
        .wobble-text { display: inline-block; animation: wobble-mad 0.1s infinite; font-weight: 900; text-shadow: 4px 4px 0 #000 !important; -webkit-text-stroke: 2px #000; }

        @keyframes stamp-slam { 0% { transform: scale(5) rotate(20deg); opacity: 0; } 60% { transform: scale(0.8) rotate(-10deg); opacity: 1; } 80% { transform: scale(1.1) rotate(5deg); } 100% { transform: scale(1) rotate(-5deg); } }

        .text-outline { text-shadow: 3px 3px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000; letter-spacing: 2px; font-weight: 900; }
        
        .intro-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: #111; 
            background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNDAwIDQwMCI+PGZpbHRlciBpZD0ibm9pc2UiPjxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjkiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giIC8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMC4zIiBmaWxsPSIjZmZmIi8+PC9zdmc+');
            z-index: 10000;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            color: #fff; text-align: center;
            transition: opacity 0.5s ease-out, visibility 0.5s; opacity: 1; visibility: visible;
        }
        .intro-overlay.hidden { opacity: 0; visibility: hidden; pointer-events: none; }

        .intro-text { font-size: 4rem; font-weight: 900; animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); margin-bottom: 30px; text-shadow: 5px 5px 0 #000; transform: rotate(-3deg); }
        .intro-content { display: flex; flex-direction: column; align-items: center; gap: 30px; width: 95%; max-width: 1200px; }
        
        .judges-row { display: flex; justify-content: center; gap: 30px; width: 100%; margin-top: 40px; flex-wrap: wrap; }
        
        .judge-item { display: flex; flex-direction: column; align-items: center; width: 28%; min-width: 200px; animation: popIn 0.5s both; }
        .judge-item:nth-child(1) { animation-delay: 0.1s; transform: rotate(2deg); } 
        .judge-item:nth-child(2) { animation-delay: 0.3s; transform: rotate(-2deg); } 
        .judge-item:nth-child(3) { animation-delay: 0.5s; transform: rotate(1deg); }
        
        .judge-img-circle { width: 140px; height: 140px; border-radius: 50%; border: 6px dashed #fff; object-fit: cover; background: #fff; box-shadow: 0 0 20px rgba(255,255,255,0.5); margin-bottom: 15px; transform: rotate(-5deg); }
        .judge-bubble-small { background: #fff; color: #111; padding: 15px 20px; border-radius: 30px; border: 4px solid #111; font-size: 1.3rem; font-weight: 900; position: relative; width: 100%; word-break: keep-all; box-shadow: 6px 6px 0 #000; transform: rotate(1deg); }
        .judge-bubble-small::after { content: ''; position: absolute; top: -15px; left: 50%; width: 0; height: 0; border-left: 15px solid transparent; border-right: 15px solid transparent; border-bottom: 15px solid #111; transform: translateX(-50%) rotate(-5deg); }

        .final-result-container {
          width: 100%; height: 100%; display: flex; flex-direction: column; 
          align-items: center; justify-content: center;
          animation: popIn 1s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .crayon-text {
            background-image: linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff);
            background-size: 300% auto; animation: rainbow-move 2s linear infinite;
            -webkit-background-clip: text; background-clip: text;
            color: transparent; text-shadow: 3px 3px 0 rgba(0,0,0,0.3); font-weight: 900;
            -webkit-text-stroke: 1px #000;
        }
        @keyframes rainbow-move { 0% { background-position: 0% 50%; } 100% { background-position: 100% 50%; } }
        
        .sketch-box-container { 
            border: 5px solid #111 !important; 
            border-radius: 10px 30px 10px 30px / 30px 10px 30px 10px !important; 
            box-shadow: 10px 10px 0 rgba(0,0,0,0.2) !important;
            background: #fffdf0 !important; 
            position: relative;
            transform: rotate(1deg);
        }
        .sketch-box-container::before {
            content: ""; position: absolute; left: 10px; top: 0; bottom: 0; width: 20px;
            background-image: radial-gradient(circle at 10px 10px, #333 4px, transparent 5px);
            background-size: 20px 30px; background-repeat: repeat-y;
        }

        .chat-bubble { 
            padding: 10px 15px; border: 3px solid #111; 
            border-radius: 20px 5px 25px 10px / 10px 25px 5px 20px; 
            box-shadow: 3px 3px 0 rgba(0,0,0,0.2); margin-bottom: 10px; 
            font-size: 1.2rem; word-break: break-all; 
            transform: rotate(-0.5deg);
            font-family: 'Nanum Pen Script', cursive;
        }
      `}</style>

      {/* 🖼️ 로고 영역 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%',
        height: '12vh', display: 'flex', alignItems: 'center',
        justifyContent: 'flex-start', paddingLeft: '3.5vw', paddingTop: '1vh',
        zIndex: 50, pointerEvents: 'none', transform: 'rotate(-2deg)'
      }}>
        <img
          src={resultLogo}
          alt="Title Logo"
          style={{ height: '500px', marginTop: '100px', objectFit: 'contain', filter: 'drop-shadow(5px 5px 0 #000)' }}
        />
      </div>

      {/* 🎬 인트로 블랙아웃 (거친 질감) */}
      <div className={`intro-overlay ${introPhase === 4 ? 'hidden' : ''}`}>

        {introPhase === 1 && (
          <div className="intro-text" style={{ color: '#facc15', fontSize: '5rem' }}>
            🤔 너네 팀의<br />개소리는 얼마나?
          </div>
        )}

        {(introPhase === 2 || introPhase === 3) && (
          <div className="intro-content" key={introPhase}>
            <div className="intro-text" style={{ color: introPhase === 2 ? '#ef4444' : '#3b82f6', textDecoration: 'underline wavy #fff' }}>
              {introPhase === 2 ? '🔴 A팀' : '🔵 B팀'} 심사 결과 발표!
            </div>

            <div className="score-breakdown" style={{ fontSize: '3.5rem', background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '30px', border: '4px dashed #fff', transform: 'rotate(-1deg)' }}>
              🗣️ <span className={`text-outline ${isCounting ? 'wobble-text' : ''}`} style={{ color: '#facc15' }}>{animPublic}</span> +
              🤖 <span className={`text-outline ${isCounting ? 'wobble-text' : ''}`} style={{ color: '#facc15' }}>{animAI}</span>
              = <span className={`text-outline ${isCounting ? 'wobble-text' : ''}`} style={{ color: '#fff', fontSize: '4.5rem', textDecoration: 'underline solid #facc15' }}>{animPublic + animAI}</span>
            </div>

            <div className="judges-row">
              {selectedJudges.map((j, i) => (
                <div key={i} className="judge-item">
                  <img src={j.image} className="judge-img-circle" />
                  <div className="judge-bubble-small">{introPhase === 2 ? j.commentA : j.commentB}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 메인 컨테이너 */}
      <div style={{ flex: 1, display: 'flex', padding: '1vh 4vw', gap: '3vw', minHeight: 0, position: 'relative', marginTop: '10vh' }}>

        {/* 👈 왼쪽: 메인 스테이지 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', marginTop: '15vh' }}>

          {/* ✅ 메인 화면 (결과 멘트만 병맛스럽게 크게!) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 10 }}>
            {step === 5 && (
              <div className="final-result-container">
                {/* 승리 팀 이름 */}
                <div className="crayon-text" style={{ fontSize: '8rem', marginBottom: '10px', lineHeight: 1.1, transform: 'rotate(-3deg) skew(-5deg)' }}>
                  {winnerName} 승리!
                </div>

                {/* ✅ [수정] 멘트와 도장 래퍼 */}
                <div style={{ position: 'relative', display: 'inline-block', marginTop: '30px' }}>

                  {/* 웃긴 멘트 */}
                  <div style={{
                    fontSize: '3.5rem', fontWeight: 900, color: '#333', wordBreak: 'keep-all', textAlign: 'center',
                    padding: '20px 40px', textShadow: '3px 3px 0 #fff', lineHeight: 1.4,
                    background: 'linear-gradient(to top, #ffeb3b 50%, transparent 50%)',
                    transform: 'rotate(2deg)', border: '4px solid #111', borderRadius: '20px'
                  }}>
                    "{finalMent}"
                  </div>

                  {/* ✅ [수정] 쾅 찍히는 도장 (더 밑으로, 더 왼쪽으로) */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-70px', right: '-30px', /* ✅ 위치 수정됨 (더 아래로, 더 안쪽으로) */
                    border: '10px solid #ff0000', color: '#ff0000', borderRadius: '50% 45% 55% 50% / 50% 55% 45% 50%',
                    width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '3.5rem', fontWeight: 'bold', fontFamily: '"Nanum Pen Script", cursive', transform: 'rotate(-15deg)',
                    boxShadow: '0 0 30px rgba(255,0,0,0.8), inset 0 0 20px rgba(255,0,0,0.5)',
                    textShadow: '3px 3px 2px #990000', background: 'rgba(255,255,255,0.7)',
                    animation: 'stamp-slam 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.2s both',
                    zIndex: 100, filter: 'blur(0.5px)'
                  }}>
                    포기 완료
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 👉 오른쪽: 채팅창 */}
        <div className="sketch-box-container" style={{
          width: '24vw', maxWidth: '350px', height: '100%',
          display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden', zIndex: 50,
          paddingLeft: '30px'
        }}>
          <div style={{ padding: '15px', background: 'transparent', borderBottom: '4px dashed #111', fontWeight: '900', textAlign: 'center', fontSize: '1.6rem', fontFamily: '"Nanum Pen Script", cursive' }}>
            💬 실시간 개소리판
          </div>
          <div style={{ flex: 1, padding: '15px', overflowY: 'auto', background: 'transparent' }}>
            {chats.map((c, i) => (
              <div key={i} className="chat-bubble" style={{
                alignSelf: c.user === '나' ? 'flex-end' : 'flex-start',
                background: c.user === '나' ? '#fff' : '#fff',
                border: c.user === '나' ? '3px solid #facc15' : '3px solid #111',
                textAlign: c.user === '나' ? 'right' : 'left',
                transform: `rotate(${Math.random() * 2 - 1}deg)`
              }}>
                <strong style={{ color: '#555', fontSize: '1rem' }}>{c.user}</strong>
                <div style={{ fontWeight: 700, fontSize: '1.3rem' }}>{c.msg}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display: 'flex', padding: '15px', background: 'transparent', borderTop: '4px dashed #111' }}>
            <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              style={{ flex: 1, padding: '12px', border: '3px solid #111', borderRadius: '15px', outline: 'none', marginRight: '10px', fontSize: '1.2rem', fontFamily: '"Nanum Pen Script", cursive', background: '#fffdf0' }} placeholder="멍멍! 짖어봐!" />
            <button onClick={handleSend} style={{ background: '#111', color: '#fff', border: '3px solid #111', borderRadius: '15px', padding: '0 20px', cursor: 'pointer', fontWeight: 900, fontSize: '1.3rem', fontFamily: '"Nanum Pen Script", cursive', transform: 'rotate(-2deg)' }}>Go!</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default JudgeResultPhase;
