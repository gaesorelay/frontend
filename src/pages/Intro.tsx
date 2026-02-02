import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/* =========================
   기능(Logic) 관련 Import
========================= */
import { useUserStore } from '../store/useUserStore';
import { useAudioStore } from '@/store/useAudioStore';
import { checkRoomCodeApi } from '../api/roomApi';

/* =========================
   디자인(Design) 관련 Import
========================= */
import { DOGS } from '@/constants/dogs';
import { SCENES, type SceneId } from '@/constants/scenes';
import { Dog } from '@/components/dog/dog';
import { Background } from '@/components/common/background';
import mainLogo from '@/assets/logo/main_logo.png';
import { mainDecorations } from '@/pages/create/decorations';
import DecoItem from '@/pages/create/DecoItem';
import { animationStyles } from './create/createAnimations';

import bgmMp3 from '@/assets/sound/BGM1.mp3';
import barkWav from '@/assets/sound/bark.wav';
import clickMp3 from '@/assets/sound/click.mp3';

const currentScene: SceneId = 'main';
const scene = SCENES[currentScene];

export const Intro = () => {
  const navigate = useNavigate();
  const setRoomId = useUserStore((state) => state.setRoomId);

  // --------------------------------------------------------
  // 상태 관리
  // --------------------------------------------------------
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. 화면 리사이즈 핸들러
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. BGM 초기 설정 및 싱글톤 관리
  useEffect(() => {
    // 중복 생성 방지: 이미 있으면 새로 만들지 않음
    if (!audioRef.current) {
      const audio = new Audio(bgmMp3);
      audio.loop = true;
      audio.volume = 0.5;
      audioRef.current = audio;
    }

    const audio = audioRef.current;

    const attemptPlay = () => {
      audio.play().catch(() => {
        console.log("Autoplay blocked. Waiting for user interaction.");
      });
    };

    // 브라우저 정책 대응 (상호작용 시 재생)
    document.addEventListener('click', attemptPlay, { once: true });
    attemptPlay();

    return () => {
      // 컴포넌트 언마운트 시에만 정지
      audio.pause();
      document.removeEventListener('click', attemptPlay);
    };
  }, []);

  // 3. 뮤트 상태 변화 감지 및 적용
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      // 뮤트 해제 시 재생되고 있지 않다면 재생 시도
      if (!isMuted && audioRef.current.paused) {
        audioRef.current.play().catch(() => { });
      }
    }
  }, [isMuted]);

  // --------------------------------------------------------
  // 핸들러 함수
  // --------------------------------------------------------
  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    playClick(); // 클릭음도 뮤트 상태를 따름
  };

  const playBark = () => {
    if (isMuted) return;
    const audio = new Audio(barkWav);
    audio.volume = 0.8;
    audio.play().catch(() => { });
  };

  const playClick = () => {
    if (isMuted) return;
    const audio = new Audio(clickMp3);
    audio.volume = 0.8;
    audio.play().catch(() => { });
  };

  const handleCreateRoom = () => {
    setRoomId(null);
    navigate('/create');
  };

  const handleJoinRoom = async () => {
    if (!inputCode.trim()) return alert("코드를 입력해주세요!");
    try {
      const result = await checkRoomCodeApi(inputCode);
      if (result.exists && result.roomId) {
        setRoomId(result.roomId);
        navigate(`/setup/${result.roomId}`);
      } else {
        alert("존재하지 않는 방입니다. 코드를 다시 확인해주세요!");
      }
    } catch (error) {
      console.error(error);
      alert("서버 연결에 실패했습니다.");
    }
  };

  // --------------------------------------------------------
  // UI 렌더링
  // --------------------------------------------------------
  return (
    <>
      <style>{animationStyles}</style>
      <Background style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}>

        {/* Mute Button */}
        <button
          onClick={toggleMute}
          style={{
            position: 'absolute', top: '20px', right: '20px', zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.8)', border: '2px solid #333',
            borderRadius: '50%', width: '50px', height: '50px',
            fontSize: '24px', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '2px 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        <div style={{ position: 'relative', zIndex: 20, pointerEvents: 'none' }}>
          {/* 로고 입장 애니메이션 */}
          {!animationComplete && (
            <motion.img
              src={mainLogo}
              alt="mainLogo"
              style={{ display: 'block' }}
              initial={{
                width: '100vw', height: '100vh', margin: '0',
                position: 'fixed', top: 0, left: 0, zIndex: 100,
              }}
              animate={{
                width: '60%', height: 'auto', margin: '0 auto',
                position: 'relative', top: 'auto', left: 'auto', zIndex: 2,
              }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              onAnimationComplete={() => setAnimationComplete(true)}
            />
          )}

          {/* 로고 루프 애니메이션 */}
          {animationComplete && (
            <motion.img
              src={mainLogo}
              alt="mainLogo"
              style={{ margin: '22px auto', width: '60%', height: 'auto', display: 'block' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, -5, 0], rotate: [-1, 1, -1] }}
              transition={{
                opacity: { duration: 0.5 },
                y: { duration: 3, repeat: Infinity },
                rotate: { duration: 3, repeat: Infinity },
              }}
            />
          )}

          {/* 버튼 컨테이너 */}
          <div style={{
            width: '60%', maxWidth: '400px', margin: '50px auto 0',
            display: 'flex', flexDirection: 'column', gap: '16px',
            position: 'relative', zIndex: 10, pointerEvents: 'auto',
          }}>
            <button
              onClick={() => { playClick(); handleCreateRoom(); }}
              className="cartoon-btn" // 공통 스타일이 있다면 클래스 활용 권장
              style={{
                width: '100%', padding: '14px 18px', fontSize: '24px',
                border: '3.5px solid #222', borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                backgroundColor: '#FFD93D', color: '#000', fontWeight: 'bold',
                cursor: 'pointer', boxShadow: '4px 4px 0px rgba(0,0,0,0.8)', transition: 'transform 0.1s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              방 만들기
            </button>

            <button
              onClick={() => { playClick(); setShowCodeInput(!showCodeInput); }}
              style={{
                width: '100%', padding: '14px 18px', fontSize: '24px',
                backgroundColor: '#fff', border: '3.5px solid #222',
                borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                color: '#333', fontWeight: 'bold', cursor: 'pointer',
                boxShadow: '4px 4px 0px rgba(0,0,0,0.2)', transition: 'transform 0.1s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              코드로 입장하기
            </button>
          </div>
        </div>

        {DOGS.map((dog) => (
          <Dog key={dog.id} dog={dog} onClick={playBark} />
        ))}

        {mainDecorations.map((d, i) => (
          <DecoItem key={i} {...d} />
        ))}

        {showCodeInput && (
          <div style={{
            position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
            width: '90%', maxWidth: '500px', backgroundColor: '#fff', border: '3px solid #333',
            borderRadius: '20px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            zIndex: 30, display: 'flex', flexDirection: 'column', gap: '12px',
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold', color: '#333' }}>입장 코드 입력</h3>
            <input
              type="text"
              placeholder="예: 1234"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '18px',
                border: '2px solid #ccc',
                borderRadius: '8px',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
              autoFocus
            />
            <button
              onClick={() => { playClick(); handleJoinRoom(); }}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '18px',
                fontWeight: 'bold',
                backgroundColor: '#FFD93D',
                color: '#000',
                border: '2px solid #333',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'transform 0.1s',
                fontFamily: 'inherit',
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              입장하기
            </button>
          </div>
        )}
      </Background>
    </>
  );
};

export default Intro;