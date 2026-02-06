import { Background } from '@/components/common/background';
import { Timer } from 'lucide-react';
import ChatArea from '@/components/game/ChatArea';
import StoryBoardArea from '../StoryBoardArea';
import JudgeArea from '@/components/game/JudgeArea';
import CardArea from '@/components/game/CardArea';

import { useGameStore } from '@/store/useGameStore';
import { useUserStore } from '@/store/useUserStore';
import { useAudioStore } from '@/store/useAudioStore'; // 오디오 스토어 추가
import { socket } from '@/lib/socket';
import { useState, useMemo, useEffect, useRef } from 'react';
import { getCardImage } from '@/lib/cardMapper';
import { getAvatarSrc } from '@/lib/avatarMapper';
import DisturbanceLayer from '../DisturbanceLayer';
// import { getJudgeImage } from '@/lib/judgeMapper';

// --- Assets (이미지) ---
// const dog1... imports removed

// 헤더 로고
import logoPlay from '@/assets/logo/logo_play.png';

// --- Assets (카운트다운 이미지 추가) ---
import logo3 from '@/assets/logo/logo_3.png';
import logo2 from '@/assets/logo/logo_2.png';
import logo1 from '@/assets/logo/logo_1.png';
import logoStart from '@/assets/logo/logo_start.png';

// --- Sound Effects ---
import clockMp3 from '@/assets/sound/clocksound.mp3';
import boomMp3 from '@/assets/sound/boom.mp3';

import { TURN_COUNT } from '@/constants/game';

const usePrevious = <T,>(value: T) => {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

// 아바타 ID를 이미지로 변환하는 헬퍼 -> avatarMapper로 대체됨
// const getAvatarImage = ... removed

interface WritingPhaseProps {
  currentRound: string; // "TURN1" ~ "TURN6" (TURN_COUNT 기준)
}

const WritingPhase = ({ currentRound }: WritingPhaseProps) => {
  // ⭐️ 0. 카운트다운 상태 관리
  const [countdown, setCountdown] = useState<number | 'START' | null>(3);

  useEffect(() => {
    if (countdown === null) return;

    const timer = setTimeout(() => {
      if (countdown === 3) setCountdown(2);
      else if (countdown === 2) setCountdown(1);
      else if (countdown === 1) setCountdown('START');
      else if (countdown === 'START') setCountdown(null);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // 카운트다운 이미지 매핑
  const getCountdownImage = () => {
    if (countdown === 3) return logo3;
    if (countdown === 2) return logo2;
    if (countdown === 1) return logo1;
    if (countdown === 'START') return logoStart;
    return null;
  };

  // 1. ⭐️ [수정] store에서 users가 아니라 'players'를 가져옵니다!
  const { players, roomConfig, roundData, draftText, setDraftText } = useGameStore();

  // console.log(players);

  // 2. 현재 턴 번호 계산
  const turnNumber = useMemo(() => {
    const num = parseInt(currentRound.replace('TURN', ''));
    return isNaN(num) ? 1 : num;
  }, [currentRound]);

  // 3. 슬롯 설정
  const maxStorytellers = roomConfig?.storytellerCount || 4;

  // 2. ⭐️ [핵심] 현재 턴의 카드 ID 찾기
  const currentCardId = useMemo(() => {
    if (!roundData || !roundData.cardIds) return 0;
    // turnNumber는 1부터 시작하므로 인덱스는 -1
    const index = turnNumber - 1;
    // 배열 범위 안전하게 접근
    return roundData.cardIds[index] || 0;
  }, [roundData, turnNumber]);

  // 3. ⭐️ [핵심] 심사위원 리스트 가져오기
  const judges = useMemo(() => {
    // roundData.judgeIds는 실제로는 Judge 객체 배열 [{id, name, persona}, ...]
    return roundData?.judges || [];
  }, [roundData]);

  // 4. ⭐️ [수정] players 배열을 필터링합니다.
  const teamAPlayers = useMemo(
    () =>
      players // users -> players
        .filter((p) => p.team === 'A' && p.role === 'PLAYER')
        .sort((a, b) => (a.slotIndex || 0) - (b.slotIndex || 0)),
    [players]
  );

  const teamBPlayers = useMemo(
    () =>
      players // users -> players
        .filter((p) => p.team === 'B' && p.role === 'PLAYER')
        .sort((a, b) => (a.slotIndex || 0) - (b.slotIndex || 0)),
    [players]
  );

  // 5. 현재 작성자(Active User) 계산
  const activeUserA = useMemo(() => {
    if (teamAPlayers.length === 0) return null;
    return teamAPlayers[(turnNumber - 1) % teamAPlayers.length];
  }, [teamAPlayers, turnNumber]);

  const activeUserB = useMemo(() => {
    if (teamBPlayers.length === 0) return null;
    return teamBPlayers[(turnNumber - 1) % teamBPlayers.length];
  }, [teamBPlayers, turnNumber]);

  // 6. ⭐️ 타이머 로직
  const roundTime = roomConfig?.roundTime || 60;
  const roundDuration = roundTime + (turnNumber === 1 ? 3 : 0);
  const [timeLeft, setTimeLeft] = useState(roundTime);
  const [isUrgent, setIsUrgent] = useState(false);

  // 7. 나의 상태 확인 (관전자 혹은 플레이어)
  const { userToken } = useUserStore();
  const myInfo = useMemo(
    () => players.find((p) => p.userToken === userToken),
    [players, userToken]
  );
  const isMyTurn = useMemo(
    () => activeUserA?.userToken === userToken || activeUserB?.userToken === userToken,
    [activeUserA, activeUserB, userToken]
  );
  const myTeam = useMemo(() => {
    if (activeUserA?.userToken === userToken) return 'A';
    if (activeUserB?.userToken === userToken) return 'B';
    return null;
  }, [activeUserA, activeUserB, userToken]);

  const mountTimeRef = useRef(Date.now());
  const latestTurnRef = useRef(0);
  const latestDraftRef = useRef('');
  const latestTeamRef = useRef<'A' | 'B' | null>(null);
  const latestRoomIdRef = useRef('');
  const latestUserTokenRef = useRef<string | null>(null);

  latestTurnRef.current = turnNumber;
  latestDraftRef.current = draftText;
  latestTeamRef.current = myTeam;
  latestRoomIdRef.current = players[0]?.roomUuid || '';
  latestUserTokenRef.current = userToken;

  useEffect(() => {
    // 1. 시작 시점을 변수에 고정 (서버 데이터가 없으면 현재 시간 사용)
    const startTime = roundData?.startedAt ? new Date(roundData.startedAt).getTime() : Date.now();
    const endTime = startTime + roundDuration * 1000;

    // 2. 인터벌 설정 (0.1초 단위 업데이트)
    const updateTimer = () => {
      const now = Date.now();
      const diff = endTime - now;
      const remaining = Math.max(0, diff / 1000);
      setTimeLeft(remaining);
      setIsUrgent(remaining <= 7 && remaining > 0);
      return remaining;
    };

    // ⭐️ 즉시 실행 (렌더링 직후 타이머 갱신으로 깜빡임 방지)
    const initialRemaining = updateTimer();

    // 남은 시간이 없으면 인터벌 돌리지 않음
    if (initialRemaining <= 0) return;

    const interval = setInterval(() => {
      const remaining = updateTimer();
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 100);

    // 3. 클린업
    return () => clearInterval(interval);
  }, [roundData?.startedAt, roundDuration, currentRound]); // 👈 여기에 currentRound를 추가하세요!

  // 🔊 사운드 이펙트 로직
  const { isMuted, toggleMute, playSFX, playBGM, stopBGM } = useAudioStore();

  // 1. 카운트다운 시작 시 효과음 재생
  useEffect(() => {
    // 카운트다운 숫자가 3일 때 시작음 재생 (필요 시 다른 로직으로 변경 가능)
    if (countdown === 3) {
      playSFX('COUNTDOWN');
    }

    // 카운트다운이 완전히 끝났을 때(null이 되었을 때) BGM 재생
    if (countdown === null) {
      playBGM('GAME');
    }
  }, [countdown, playSFX, playBGM]);

  // 2. 마운트/언마운트 시 BGM 처리
  useEffect(() => {
    // 언마운트 시 BGM 정지
    return () => {
      stopBGM();
    };
  }, [stopBGM]);

  // 3. 긴박한 상황(7초 이하)일 때 시계 소리 재생
  useEffect(() => {
    let audio: HTMLAudioElement | null = null;

    if (isUrgent && !isMuted) {
      audio = new Audio(clockMp3);
      audio.volume = 0.6;
      audio.play().catch(() => { });
    }

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [isUrgent, isMuted]);

  // ⭐️ 턴 변경(또는 언마운트) 시 자동 제출 로직
  // 1. 턴이 바뀌는 순간 직전 턴 내용을 자동 제출
  // 2. WritingPhase 언마운트 시 마지막 턴 내용 제출 (TURN6 등)
  const prevTurnNumber = usePrevious(turnNumber);
  const prevTeam = usePrevious(myTeam);
  const prevDraftText = usePrevious(draftText);

  useEffect(() => {
    if (prevTurnNumber === undefined) return;
    if (turnNumber === prevTurnNumber) return;
    if (!prevTeam || !latestUserTokenRef.current) return;

    // console.log(
    //   `💾 [WritingPhase] 턴 종료로 인한 자동 제출: ${prevDraftText ?? ''}, Turn: ${prevTurnNumber}`
    // );
    socket.emit('submit_story', {
      roomId: latestRoomIdRef.current || '',
      message: prevDraftText ?? '',
      team: prevTeam,
      userToken: latestUserTokenRef.current,
      turn: prevTurnNumber,
    });
    setDraftText('');
  }, [turnNumber, prevTurnNumber, prevTeam, prevDraftText, setDraftText]);

  useEffect(() => {
    return () => {
      const duration = Date.now() - mountTimeRef.current;
      // 언마운트 된 시간이 100ms 이하이면 submit_story 이벤트 발송안 함
      // 로컬 환경 방지
      if (import.meta.env.DEV && duration < 100) return;

      const team = latestTeamRef.current;
      const token = latestUserTokenRef.current;
      if (!team || !token) return;

      // console.log(
      //   `💾 [WritingPhase] 언마운트로 인한 자동 제출: ${latestDraftRef.current}, Turn: ${latestTurnRef.current}`
      // );
      socket.emit('submit_story', {
        roomId: latestRoomIdRef.current || '',
        message: latestDraftRef.current,
        team,
        userToken: token,
        turn: latestTurnRef.current,
      });
      useGameStore.getState().setDraftText('');
    };
  }, []);

  const formatTime = (sec: number) => {
    // 소수점은 안 보이길 원하심 + 0초가 너무 빨리 뜨는 것 방지(Math.ceil)
    const val = Math.ceil(sec);
    const m = Math.floor(val / 60)
      .toString()
      .padStart(2, '0');
    const s = (val % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // --- Styles (기존 스타일 그대로 유지) ---
  const paperBoxStyle: React.CSSProperties = {
    backgroundColor: '#fdfcf0',
    border: '3px solid #333',
    boxShadow: '4px 4px 0px rgba(0,0,0,0.15)',
    borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 20px',
    fontFamily: 'SchoolSafeLittleOne, sans-serif',
  };
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 60px',
    height: '120px',
    background: 'transparent',
  };
  const mainStyle: React.CSSProperties = {
    flex: 3,
    padding: '0 20px',
    alignItems: 'stretch',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '4px',
  };
  const leftColumnStyle: React.CSSProperties = {
    height: '100%',
    flex: 0.8,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };
  const centerColumnStyle: React.CSSProperties = {
    flex: 1.5,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  };
  const teamSectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    ...paperBoxStyle,
    borderRadius: '20px',
    alignItems: 'stretch',
    padding: '10px 15px',
    justifyContent: 'flex-start',
    flex: 1,
    overflow: 'hidden',
  };
  const teamHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  };
  const teamIndicatorStyle = (color: string): React.CSSProperties => ({
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: color,
    border: '2px solid #333',
  });
  const storytellersStyle: React.CSSProperties = { display: 'flex', gap: '8px' };
  const rightColumnStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '10px',
  };

  // 아바타 스타일
  const getAvatarStyle = (isActive: boolean, color: string): React.CSSProperties => ({
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: isActive ? `4px solid ${color}` : '2px solid #ccc',
    backgroundColor: '#fff',
    objectFit: 'cover',
    boxShadow: isActive ? `0 0 10px ${color}` : 'none',
    transform: isActive ? 'scale(1.2)' : 'scale(1)',
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    zIndex: isActive ? 10 : 1,
  });

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: '20px',
    width: '100%',
    overflow: 'hidden',
    padding: '0 20px',
  };

  // --- 병맛 스타일 추가 ---
  const kitchBoxStyle: React.CSSProperties = {
    backgroundColor: '#FFD93D',
    border: '4px solid #000',
    boxShadow: '6px 6px 0px #000',
    transform: 'rotate(-1deg)',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    position: 'relative',
  };

  const crazyTimerStyle: React.CSSProperties = {
    ...kitchBoxStyle,
    backgroundColor: timeLeft <= 7 ? '#ff4757' : '#FFD93D', // 7초 남으면 빨개짐
    color: timeLeft <= 7 ? '#fff' : '#000',
    transform: timeLeft <= 7 ? 'scale(1.1) rotate(2deg)' : 'rotate(-2deg)',
    transition: 'all 0.2s ease-in-out',
  };

  const badgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-15px',
    right: '-10px',
    backgroundColor: '#000',
    color: '#fff',
    fontSize: '0.7rem',
    padding: '2px 10px',
    transform: 'rotate(15deg)',
    fontWeight: 'bold',
  };

  const roundBadgeStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    border: '3px solid #000',
    borderRadius: '50px',
    padding: '2px 15px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    marginTop: '-5px',
    boxShadow: '3px 3px 0px rgba(0,0,0,0.2)',
  };

  // --- 스타일 수정: 로고를 위한 컨테이너 ---
  const logoWrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transform: 'rotate(-1deg)', // 로고도 살짝 기울여서 병맛미 추가
  };

  const logoImgStyle: React.CSSProperties = {
    height: '80px', // 헤더 높이에 맞춰 조절
    width: 'auto',
    filter: 'drop-shadow(4px 4px 0px rgba(0,0,0,0.2))', // 로고에 입체감 주기
    marginBottom: '5px',
  };

  // 렌더링 헬퍼
  const renderTeamAvatars = (teamPlayers: any[], activeUser: any, color: string) => {
    return Array.from({ length: maxStorytellers }).map((_, i) => {
      const player = teamPlayers.find((p) => p.slotIndex === i);

      if (!player) {
        return (
          <div
            key={`empty-${i}`}
            style={{ width: 40, height: 40, borderRadius: 10, border: '2px dashed #e5e7eb' }}
          />
        );
      }

      const isActive = player && activeUser && player.userToken === activeUser.userToken;
      const isMe = player.userToken === userToken;

      return (
        <div key={player.userToken} style={{ position: 'relative' }}>
          {/* 상단 라벨 (ME 또는 닉네임) */}
          <div
            style={{
              position: 'absolute',
              top: '-15px', // 닉네임 길이를 고려해 살짝 더 올렸습니다
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: isMe ? '#000' : '#fff', // 나면 검정, 남이면 흰색
              color: isMe ? '#fff' : '#000', // 나면 흰색, 남이면 검정
              fontSize: '0.65rem',
              padding: '2px 6px',
              borderRadius: '4px',
              zIndex: 30,
              border: isMe ? 'none' : '1px solid #e5e7eb', // 남일 때는 테두리를 주어 흰 배경과 구분
              whiteSpace: 'nowrap', // 닉네임이 길어도 줄바꿈 방지
            }}
          >
            {isMe ? 'ME' : player.nickname}
          </div>

          <img
            src={getAvatarSrc(player.avatarId)}
            style={getAvatarStyle(!!isActive, color)}
            alt={player.nickname}
          />
        </div>
      );
    });
  };

  return (
    <Background>
      <DisturbanceLayer />
      {/* ⭐️ 카운트다운 오버레이 */}
      {countdown !== null && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <img
            key={countdown} // key를 바꿔야 애니메이션이 재실행됨
            src={getCountdownImage()!}
            alt="countdown"
            style={{
              height: countdown === 'START' ? '170px' : '270px',
              animation: 'pop-in 0.8s cubic-bezier(0.17, 0.89, 0.32, 1.49) forwards',
            }}
          />
        </div>
      )}

      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          filter: countdown !== null ? 'blur(4px)' : 'none', // 카운트다운 중일 때 배경도 살짝 블러
          transition: 'filter 0.5s ease',
        }}
      >
        <style>
          {`
            /* 카운트다운 팝 애니메이션 */
            @keyframes pop-in {
              0% { transform: scale(0.5); opacity: 0; }
              70% { transform: scale(1.2); opacity: 1; }
              100% { transform: scale(1); opacity: 1; }
            }
            /* 로고 두근거림 애니메이션 */
            @keyframes pulse-soft {
              0% { transform: scale(1.2); }
              50% { transform: scale(1.25); }
              100% { transform: scale(1.2); }
            }
            .pulse-logo { animation: pulse-soft 0.5s infinite ease-in-out; }

            /* 평상시 은은한 박동 애니메이션 */
            @keyframes calm-pulse {
              0% { transform: scale(1); box-shadow: 4px 4px 0px #000; }
              50% { transform: scale(1.02); box-shadow: 6px 6px 12px rgba(0,0,0,0.1); }
              100% { transform: scale(1); box-shadow: 4px 4px 0px #000; }
            }
            .normal-timer { 
              animation: calm-pulse 2s infinite ease-in-out; 
            }

            @keyframes spin-slow {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }

            /* 10초 남았을 때 타이머 발광 (강렬하게) */
            @keyframes timer-glow {
              0%, 100% { box-shadow: 6px 6px 0px #000; background-color: #ff4757; }
              50% { box-shadow: 0px 0px 25px #ff4757; background-color: #ff6b81; }
            }
            .panic-timer { animation: timer-glow 0.3s infinite !important; }

            /* 10초 남았을 때 로고 미친듯이 두근거림 */
            @keyframes pulse-panic {
              0% { transform: scale(1.1) rotate(-3deg); }
              50% { transform: scale(1.3) rotate(3deg); }
              100% { transform: scale(1.1) rotate(-3deg); }
            }
            .panic-logo { animation: pulse-panic 0.2s infinite ease-in-out !important; }
          `}
        </style>
        <div style={mainStyle} className={isUrgent ? 'panic-mode' : ''}>
          {/* --- [수정된 개소릴레이 헤더] --- */}
          <header style={headerStyle}>
            {/* 타이머 구역 */}
            <div style={crazyTimerStyle} className={isUrgent ? 'panic-timer' : 'normal-timer'}>
              <div style={badgeStyle}>{timeLeft <= 7 ? '빨리빨리!!' : '기다리는중..'}</div>
              <Timer
                size={28}
                strokeWidth={3}
                style={{ animation: isUrgent ? 'none' : 'spin-slow 4s linear infinite' }}
              />
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.8rem',
                  fontWeight: 900,
                }}
              >
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* 중앙: logo_play 적용 구역 */}
            <div style={logoWrapperStyle}>
              <img
                src={logoPlay}
                alt="개소릴레이 로고"
                style={logoImgStyle}
                className={isUrgent ? 'panic-logo' : 'pulse-logo'}
              />

              <div style={roundBadgeStyle}>
                제 <span style={{ color: '#ef4444', fontSize: '1.2rem' }}>{turnNumber}</span>회차
                짖기 / {TURN_COUNT}
              </div>
            </div>

            {/* 우측 상단: 상태 배지 + 오디오 컨트롤 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '10px',
              }}
            >
              {/* 🔇 뮤트 버튼 */}
              <button
                onClick={toggleMute}
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '3px solid #333',
                  borderRadius: '50%',
                  width: '45px',
                  height: '45px',
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

              <div
                style={{
                  ...kitchBoxStyle,
                  backgroundColor: isMyTurn ? '#ff4757' : '#7bed9f',
                  transform: 'rotate(2deg)',
                }}
              >
                <span style={{ fontWeight: 'bold', color: isMyTurn ? '#fff' : '#000' }}>
                  {myInfo?.role === 'AUDIENCE'
                    ? '👀 관전 중...'
                    : isMyTurn
                      ? '✍️ 당신의 턴! 짖으세요!'
                      : '💤 동료가 짖는 중...'}
                </span>
              </div>
            </div>
          </header>

          <div style={contentStyle}>
            {/* Left: Image & Judges */}
            <div style={leftColumnStyle}>
              <CardArea cardIds={roundData?.cardIds || []} currentTurn={turnNumber} />
              <JudgeArea judges={judges} />
            </div>

            <div style={centerColumnStyle}>
              <div style={teamSectionStyle}>
                <div style={teamHeaderStyle}>
                  <div style={teamIndicatorStyle('#ef4444')} />
                  <span style={{ color: '#ef4444' }}>A팀</span>
                </div>
                {/* ⭐️ 작성자 슬롯 + 작성 중 표시 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '50px' }}>
                  <div style={storytellersStyle}>
                    {renderTeamAvatars(teamAPlayers, activeUserA, '#ef4444')}
                  </div>
                  {activeUserA && (
                    <div
                      style={{
                        fontSize: '1.3rem',
                        fontWeight: 'bold',
                        color: '#ef4444',
                        animation: 'pulse-soft 2s infinite',
                      }}
                    >
                      ✍️ {activeUserA.nickname} 짖는 중...
                    </div>
                  )}
                </div>
                {/* ⭐️ [교체] 스토리 보드 A */}
                {/* roomUuid는 roundData나 store에서 가져오거나 props로 받아야 함 */}
                <div style={{ flex: 1, minHeight: 0 }}>
                  <StoryBoardArea
                    team="A"
                    activeUser={activeUserA}
                    roomId={players[0]?.roomUuid || ''} // 유저 정보에 roomUuid가 있으니 그걸 씀
                    turnNumber={turnNumber} // ⭐️ 추가
                    isUrgent={isUrgent}
                  />
                </div>
              </div>

              <div style={teamSectionStyle}>
                <div style={teamHeaderStyle}>
                  <div style={teamIndicatorStyle('#3b82f6')} />
                  <span style={{ color: '#3b82f6' }}>B팀</span>
                </div>
                {/* ⭐️ 작성자 슬롯 + 작성 중 표시 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '50px' }}>
                  <div style={storytellersStyle}>
                    {renderTeamAvatars(teamBPlayers, activeUserB, '#3b82f6')}
                  </div>
                  {activeUserB && (
                    <div
                      style={{
                        fontSize: '1.3rem',
                        fontWeight: 'bold',
                        color: '#3b82f6',
                        animation: 'pulse-soft 2s infinite',
                      }}
                    >
                      ✍️ {activeUserB.nickname} 짖는 중...
                    </div>
                  )}
                </div>
                {/* ⭐️ [교체] 스토리 보드 B */}
                <div style={{ flex: 1, minHeight: 0 }}>
                  <StoryBoardArea
                    team="B"
                    activeUser={activeUserB}
                    roomId={players[0]?.roomUuid || ''}
                    turnNumber={turnNumber} // ⭐️ 추가
                    isUrgent={isUrgent}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={rightColumnStyle}>
          <ChatArea />
        </div>
      </div>
    </Background>
  );
};

export default WritingPhase;
