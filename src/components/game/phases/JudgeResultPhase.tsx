import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import ChatArea from '../ChatArea';
import { useGameStore } from '@/store/useGameStore';
import { useUserStore } from '@/store/useUserStore';
import { socket } from '@/lib/socket';
import { getResultJudgeImage } from '@/lib/judgeMapper'; // 이미지 매퍼
import { getAvatarSrc } from '@/lib/avatarMapper';
import { useAudioStore } from '@/store/useAudioStore'; // 🔊 추가
import tadaMp3 from '@/assets/sound/tada.mp3';

// avatarId (1-based) -> Image URL (Alias for consistency with internal usage)
const getAvatarUrl = getAvatarSrc;

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
  const { voteResult, roundData, players } = useGameStore();
  const { isHost } = useUserStore();
  const { playSFX, isMuted } = useAudioStore(); // 🔊 func + state

  // 🎵 Mount 시 짜잔 효과음
  useEffect(() => {
    if (!isMuted) {
      new Audio(tadaMp3).play().catch(() => { });
    }
  }, [isMuted]);

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

  // ⭐️ 승리 멘트 랜덤 선택 (점수가 바뀌지 않는 한 고정)
  const randomWinMent = useMemo(() => {
    const wTeam = totalA >= totalB ? 'A팀' : 'B팀';
    const rawMent = WIN_MENTS[Math.floor(Math.random() * WIN_MENTS.length)];
    return rawMent.replace("${teamName}", wTeam);
  }, [totalA, totalB]);

  // 4. 페이즈 타이머
  useEffect(() => {
    if (!voteResult) return;

    const timers = [
      setTimeout(() => {
        setIntroPhase(2);      // A팀 관객 점수
        playSFX('NUMBER_TICK');
        playSFX('GOOD_RESULT');
      }, 2000),
      setTimeout(() => {
        setIntroPhase(3);      // B팀 관객 점수
        playSFX('NUMBER_TICK');
        playSFX('GOOD_RESULT');
      }, 6000),
      setTimeout(() => setIntroPhase(4), 10000),  // 1차 합산     (4초)
      setTimeout(() => setIntroPhase(5), 16000),  // A팀 AI 심사  (6초 대기 후 시작)
      setTimeout(() => setIntroPhase(6), 27000),  // B팀 AI 심사  (A팀 11초 감상)
      setTimeout(() => setIntroPhase(7), 38000),  // 최종 합산    (B팀 11초 감상)
      // 8단계(Game Over)로 가지 않음!
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, [voteResult, winnerName]);

  // ⭐️ 100초 후 자동 exit (별도 Effect로 분리)
  useEffect(() => {
    if (introPhase === 7) {
      // 🎉 최종 결과(7단계) 진입 시 박수 갈채 재생!
      playSFX('APPLAUSE');

      const timer = setTimeout(() => {
        navigator('/');
      }, 100000);
      return () => clearTimeout(timer);
    }
  }, [introPhase, navigator, playSFX]);

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

  // 7. 우승자 판별 (단순 점수 비교 + 동점시 A)
  const finalWinnerTeam = totalA >= totalB ? 'A' : 'B';
  const winningPlayers = players.filter(p => p.team === finalWinnerTeam);

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, backgroundImage: `url(${bgImg})`, backgroundSize: 'cover', backgroundPosition: 'center',
      overflow: 'hidden', zIndex: 9999, display: 'flex', flexDirection: 'column'
    }}>
      <style>{`
        @keyframes full-screen-pop { 0% { transform: scale(0); opacity: 0; } 50% { opacity: 1; transform: scale(1.5); } 100% { transform: scale(1) translateY(-50px); opacity: 0; } }
        @keyframes stamp-slam { 0% { transform: translate(-50%, -50%) scale(5); opacity: 0; } 100% { transform: translate(-50%, -50%) scale(1) rotate(-15deg); opacity: 1; } }
        @keyframes elastic-zoomies { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes slide-in-right { 0% { transform: translateX(100%) scale(0.5); opacity: 0; } 100% { transform: translateX(0) scale(1); opacity: 1; } }
        @keyframes slide-in-left { 0% { transform: translateX(-100%) scale(0.5); opacity: 0; } 100% { transform: translateX(0) scale(1); opacity: 1; } }
        @keyframes zoom-in-judge { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes pop-comment { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }

        .particle-full { position: absolute; color: #facc15; font-size: 5vmin; font-weight: 900; animation: full-screen-pop 0.4s forwards; text-shadow: 0.5vmin 0.5vmin 0 #000; z-index: 11000; }
        .intro-overlay { position: absolute; width: 100%; top: 0; left: 0; height: 100%; z-index: 10000; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #000; transition: 0.5s; }
        .hidden { opacity: 0; visibility: hidden; pointer-events: none; }
        .score-huge { font-size: 15vmin; color: #fff; text-shadow: 0 0 30px #ff4444; font-weight: 900; }
        .gauge-container { width: 30vmin; height: 3.5vmin; background: #333; border: 0.4vmin solid #111; border-radius: 2vmin; overflow: hidden; position: relative; }
        .gauge-fill { height: 100%; transition: width 0.1s ease-out; }
        .judge-card-mini { width: 12vmin; text-align: center; background: #fff; padding: 1vmin; border-radius: 1vmin; border: 0.3vmin solid #111; font-size: 1.2vmin; }
        .winner-card { width: 18vmin; text-align: center; background: #fffdf0; padding: 2vmin; border-radius: 2vmin; border: 0.5vmin solid #111; box-shadow: 1vmin 1vmin 0 rgba(0,0,0,0.2); }
      `}</style>

      {[4, 7].includes(introPhase) && <img src={resultLogo} style={{
        position: 'absolute', top: '-10vmin',
        left: 'calc(50% - 15vmin)', transform: 'translateX(-50%)',
        height: '35vh', width: 'auto', zIndex: 20001, filter: 'drop-shadow(0.5vmin 0.5vmin 0 #000)',
        objectFit: 'contain'
      }} />}

      <div className={`intro-overlay ${[1, 2, 3, 5, 6, 8].includes(introPhase) ? '' : 'hidden'}`}>
        {particles.map(p => (
          <span key={p.id} className="particle-full" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: `rotate(${p.rot}deg)` }}>+1</span>
        ))}

        {introPhase === 1 && <img src={finalLogo} style={{ width: '50vmin', objectFit: 'contain', animation: 'elastic-zoomies 0.8s' }} />}

        {(introPhase === 2 || introPhase === 3) && (
          <div key={`phase-${introPhase}`} style={{ textAlign: 'center', animation: introPhase === 2 ? 'slide-in-left 0.5s both' : 'slide-in-right 0.5s both' }}>
            <div style={{ marginBottom: '-3vmin' }}>
              <img src={introPhase === 2 ? AteamLogo : BteamLogo} style={{ width: '60vmin', objectFit: 'contain', filter: 'drop-shadow(0.5vmin 0.5vmin 0 #000)' }} />
            </div>
            <div className="score-huge">{animScore}</div>
          </div>
        )}

        {(introPhase === 5 || introPhase === 6) && (
          <div key={`judge-${introPhase}`} style={{ textAlign: 'center', width: '100%', animation: 'zoom-in-judge 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3vmin', marginBottom: '4vmin', background: 'rgba(255,255,255,0.1)', padding: '2vmin 5vmin', borderRadius: '2vmin', border: '0.4vmin solid #333' }}>
              <img src={introPhase === 5 ? ateamImg : bteamImg} style={{ height: '12vmin', objectFit: 'contain' }} />
              <img src={airesultImg} style={{ height: '24vmin', objectFit: 'contain' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '2vw', justifyContent: 'center', width: '100%', alignItems: 'stretch' }}>
              {realJudges.map((j, i) => {
                const pScore = introPhase === 5 ? j.scoreA : j.scoreB;
                const pComment = introPhase === 5 ? j.commentA : j.commentB;
                return (
                  <div key={i} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5vh',
                    background: '#fff', padding: '2vw', borderRadius: '1.5vw', border: '0.4vw solid #111',
                    width: '23vw', animation: `slide-in-right 0.4s ${i * 0.15}s both`,
                    boxShadow: '0.8vw 0.8vw 0 rgba(0,0,0,0.2)', position: 'relative'
                  }}>
                    <img src={j.image} style={{ width: '12vh', height: '12vh', borderRadius: '1.5vh', objectFit: 'cover', border: '0.3vw solid #ddd' }} />
                    <div style={{ textAlign: 'center', width: '100%' }}>
                      <div style={{ fontWeight: 900, fontSize: '1.4vw', color: '#111', marginBottom: '1vh' }}>{j.name}</div>
                      <div style={{ fontSize: '1.4vw', color: '#333', wordBreak: 'keep-all', lineHeight: '1.4', animation: `pop-comment 0.5s ${0.3 + i * 0.2}s both`, fontWeight: '600' }}>
                        {pComment}
                      </div>
                    </div>
                    <div style={{
                      position: 'absolute', top: '-1.5vw', right: '-1.5vw',
                      background: '#ff0000', color: '#fff', fontSize: '2.5vw', fontWeight: 900,
                      padding: '0.5vw 1.5vw', borderRadius: '1.5vw', border: '0.3vw solid #fff',
                      boxShadow: '0.4vw 0.4vw 0 rgba(0,0,0,0.3)', transform: 'rotate(15deg)',
                      animation: `pop-comment 0.5s ${0.6 + i * 0.2}s both`
                    }}>
                      +{pScore}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: '5vw', color: '#facc15', marginTop: '4vh', fontWeight: 900, textShadow: '0.3vw 0.3vw 0 #000', animation: 'elastic-zoomies 0.5s 1.5s both' }}>
              AI Score: {introPhase === 5 ? aiTotalA : aiTotalB}점
            </div>
          </div>
        )}

        {/* Phase 8 (Game Over) Removed */}
      </div>

      <div style={{ flex: 1, display: 'flex' }}>
        <div style={{ flex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', opacity: [4, 7].includes(introPhase) ? 1 : 0, transition: '0.5s' }}>
          <div style={{ display: 'flex', gap: '6vmin', padding: '2vh 0 0 2vmin' }}>
            {/* A팀 섹션 */}
            <div style={{ textAlign: 'center' }}>
              <img src={teamALogo} style={{ width: '25vw', maxWidth: '300px', objectFit: 'contain' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', width: '22vw', fontWeight: 900, fontSize: '2vmin', marginBottom: '0.5vmin', textShadow: '0.2vmin 0.2vmin 0 #000', margin: '0 auto' }}>
                <span style={{ color: '#ffb3b3' }}>관객 {stagePublicA}</span>
                <span style={{ color: '#ff3333' }}>AI {stageAIA}</span>
              </div>
              <div className="gauge-container" style={{ width: '22vw', margin: '0 auto', height: '3vmin' }}>
                <div className="gauge-fill" style={{ width: `${((stagePublicA + stageAIA) / (totalA + totalB || 1)) * 100}%`, background: '#ff4444' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${(stagePublicA / (totalA + totalB || 1)) * 100}%`, background: '#ff7f7f', opacity: 0.8 }} />
              </div>
            </div>

            <div style={{ fontSize: '8vmin', fontWeight: 900, alignSelf: 'center' }}>VS</div>

            <div style={{ textAlign: 'center' }}>
              <img src={teamBLogo} style={{ width: '25vw', maxWidth: '300px', objectFit: 'contain' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', width: '22vw', fontWeight: 900, fontSize: '2vmin', marginBottom: '0.5vmin', textShadow: '0.2vmin 0.2vmin 0 #000', margin: '0 auto' }}>
                <span style={{ color: '#99ccff' }}>관객 {stagePublicB}</span>
                <span style={{ color: '#3385ff' }}>AI {stageAIB}</span>
              </div>
              <div className="gauge-container" style={{ width: '22vw', margin: '0 auto', height: '3vmin' }}>
                <div className="gauge-fill" style={{ width: `${((stagePublicB + stageAIB) / (totalA + totalB || 1)) * 100}%`, background: '#3b82f6' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${(stagePublicB / (totalA + totalB || 1)) * 100}%`, background: '#7fb2ff', opacity: 0.8 }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '5vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {introPhase === 4 ? (
              // Phase 4: 심사위원단 (기존 유지)
              <>
                <div style={{ fontSize: '3vmin', fontWeight: 900, color: '#fff', marginBottom: '2vmin', background: '#333', padding: '0.5vmin 3vmin', borderRadius: '2vmin', border: '0.3vmin solid #fff', boxShadow: '0.5vmin 0.5vmin 0 #000' }}>
                  AI 심사위원단
                </div>
                <div style={{ display: 'flex', gap: '2vmin', justifyContent: 'center' }}>
                  {realJudges.map((j, i) => (
                    <div key={i} className="judge-card-mini" style={{ animation: `elastic-zoomies 0.5s ${i * 0.1}s both` }}>
                      <img src={j.image} style={{ width: '8vmin', height: '8vmin', borderRadius: '50%', objectFit: 'cover', border: '0.3vmin solid #ddd', marginBottom: '0.5vmin' }} />
                      <div style={{ fontWeight: 900, fontSize: '1.2vmin' }}>{j.name}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              // Phase 7: 우승 팀 멤버들 (NEW!)
              <div style={{ textAlign: 'center', animation: 'zoom-in-judge 0.5s both', width: '100%' }}>

                {/* 1. Final Score Comparison */}
                <div style={{ fontSize: '5vmin', fontWeight: 900, color: '#fff', textShadow: '0.4vmin 0.4vmin 0 #000', marginBottom: '1vmin' }}>
                  <span style={{ color: '#ff7f7f' }}>{totalA}</span> : <span style={{ color: '#7fb2ff' }}>{totalB}</span>
                </div>

                {/* 2. Winner Declaration */}
                <div style={{ fontSize: '7vmin', fontWeight: 900, color: '#facc15', textShadow: '0.5vmin 0.5vmin 0 #000', marginBottom: '2vmin' }}>
                  🎉 {finalWinnerTeam === 'A' ? 'A팀' : 'B팀'} 승리! 🎉
                </div>

                {/* 3. Random Ment (smaller) & Dog Score (Winning Team's Score) */}
                <div style={{
                  position: 'relative', fontSize: '3vmin', fontWeight: 900, color: '#facc15',
                  textShadow: '0.3vmin 0.3vmin 0 #000', marginBottom: '2vmin', display: 'inline-block'
                }}>
                  "{randomWinMent}"
                  <div style={{ fontSize: '2.5vmin', color: '#fff', marginTop: '1vmin', textShadow: '0.2vmin 0.2vmin 0 #000' }}>
                    🏆 Dog Score: {finalWinnerTeam === 'A' ? totalA : totalB} 점 🏆
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '3vmin', justifyContent: 'center', marginTop: '2vmin' }}>
                  {winningPlayers.map((p, i) => (
                    <div key={p.userToken} className="winner-card" style={{ animation: `elastic-zoomies 0.6s ${i * 0.15}s both` }}>
                      <img
                        src={getAvatarUrl(p.avatarId)}
                        style={{ width: '10vmin', height: '10vmin', borderRadius: '50%', border: '0.5vmin solid #facc15', marginBottom: '1vmin', boxShadow: '0 0.5vmin 1vmin rgba(0,0,0,0.2)' }}
                      />
                      <div style={{ fontSize: '1.8vmin', fontWeight: 900 }}>{p.nickname}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {introPhase === 7 && (
            <div style={{
              position: 'absolute', bottom: '4vmin', right: '4vmin', zIndex: 11000,
              display: 'flex', gap: '2vmin'
            }}>
              <button
                onClick={() => navigator('/')}
                style={{
                  fontSize: '2.5vmin', fontWeight: 900,
                  padding: '1.5vmin 4vmin', borderRadius: '3vmin', border: '0.4vmin solid #fff',
                  background: '#ff4444', color: '#fff', cursor: 'pointer',
                  boxShadow: '0.5vmin 0.5vmin 0 rgba(0,0,0,0.5)', transition: '0.2s'
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
                    fontSize: '2.5vmin', fontWeight: 900,
                    padding: '1.5vmin 4vmin', borderRadius: '3vmin', border: '0.4vmin solid #fff',
                    background: '#333', color: '#fff', cursor: 'pointer',
                    boxShadow: '0.5vmin 0.5vmin 0 rgba(0,0,0,0.5)', transition: '0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  한 판 더 하기
                </button>
              )}
            </div>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1vmin', padding: '1vmin', height: '100vh', maxHeight: '100vh' }}>
          <ChatArea />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default JudgeResultPhase;
