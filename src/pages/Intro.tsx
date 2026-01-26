import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/* =========================
   기능(Logic) 관련 Import
========================= */
import { useUserStore } from '../store/useUserStore';
import { checkRoomCodeApi } from '../api/roomApi';
import Modal from '../components/common/Modal';

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

const currentScene: SceneId = 'main';
const scene = SCENES[currentScene];

export const Intro = () => {
  // --------------------------------------------------------
  // 1. 기능 로직 (Hooks & Handlers)
  // --------------------------------------------------------
  const navigate = useNavigate();
  const setRoomId = useUserStore((state) => state.setRoomId);

  // 입력 필드 표시 상태 관리
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [inputCode, setInputCode] = useState("");

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // [기능 1] 방 만들기 버튼 클릭
  const handleCreateRoom = () => {
    setRoomId(null); // 방장이니까 기존 방 정보 초기화
    navigate('/create'); // 방 설정 페이지로 이동
  };

  // [기능 2] 코드 입력 후 확인 버튼 클릭
  const handleJoinRoom = async () => {
    if (!inputCode) return alert("코드를 입력해주세요!");

    try {
      // 가짜 API 호출
      const result = await checkRoomCodeApi(inputCode);
      
      if (result.exists && result.roomId) {
        setRoomId(result.roomId);
        navigate('/setup'); // 캐릭터 설정 페이지로
      } else {
        alert("존재하지 않는 방입니다. (힌트: 1234)");
      }
    } catch (error) {
      console.error(error);
      alert("에러가 발생했습니다.");
    }
  };

  // 애니메이션 상태 관리
  const [animationComplete, setAnimationComplete] = useState(false);

  // --------------------------------------------------------
  // 2. 화면 렌더링 (UI)
  // --------------------------------------------------------
  return (
    <>
      <style>{animationStyles}</style>
      <Background style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}>
        {/* 1. 로고와 버튼 (중앙 정렬) */}
        <div style={{ position: 'relative', zIndex: 20 }}>
          {/* 로고 입장 애니메이션 (애니메이션 완료 후 숨김) */}
          {!animationComplete && (
            <motion.img 
              src={mainLogo} 
              alt="mainLogo" 
              style={{
                display: 'block',
              }}
              initial={{
                width: '100vw',
                height: '100vh',
                margin: '0',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 100,
              }}
              animate={{
                width: '60%',
                height: 'auto',
                margin: '0 auto',
                position: 'relative',
                top: 'auto',
                left: 'auto',
                zIndex: 2,
              }}
              transition={{
                duration: 1.2,
                ease: 'easeInOut',
              }}
              onAnimationComplete={() => {
                setAnimationComplete(true);
              }}
            />
          )}

          {/* 로고 무한 반복 애니메이션 (입장 애니메이션 완료 후) */}
          {animationComplete && (
            <motion.img 
              src={mainLogo} 
              alt="mainLogo" 
              style={{
                margin: '22px auto',
                width: '60%',
                height: 'auto',
                display: 'block',
              }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                y: [0, -5, 0],
                rotate: [-1, 1, -1],
              }}
              transition={{
                opacity: { duration: 0.5 },
                y: { duration: 3, repeat: Infinity },
                rotate: { duration: 3, repeat: Infinity },
              }}
            />
          )}

          {/* 버튼 컨테이너 */}
          <div style={{
            width: '60%',
            maxWidth: '400px', // 너무 넓어지지 않게 제한
            margin: '50px auto 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px', // 버튼 사이 간격
            position: 'relative',
            zIndex: 10, // 강아지들보다 위에 오게
          }}>
            {/* 버튼 1: 방 만들기 */}
            <button 
              onClick={handleCreateRoom}
              style={{
                width: '100%', 
                padding: '14px 18px', 
                fontSize: '24px',
                border: '3.5px solid #222',
                borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                backgroundColor: '#FFD93D', // 노란색 포인트
                color: '#000',
                fontWeight: 'bold',
                outline: 'none', 
                fontFamily: 'inherit', 
                boxSizing: 'border-box',
                cursor: 'pointer',
                boxShadow: '4px 4px 0px rgba(0,0,0,0.8)', // 그림자 효과
                transition: 'transform 0.1s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
              방 만들기
            </button>

            {/* 버튼 2: 코드로 입장하기 */}
            <button 
              onClick={() => setShowCodeInput(!showCodeInput)}
              style={{
                width: '100%', 
                padding: '14px 18px', 
                fontSize: '24px',
                backgroundColor: '#fff',
                border: '3.5px solid #222',
                borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                color: '#333',
                fontWeight: 'bold',
                outline: 'none', 
                fontFamily: 'inherit', 
                boxSizing: 'border-box',
                cursor: 'pointer',
                boxShadow: '4px 4px 0px rgba(0,0,0,0.2)',
                transition: 'transform 0.1s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              코드로 입장하기
            </button>
          </div>
        </div>

        {/* 강아지 장식 요소들 */}
        {DOGS.map((dog) => (
        <Dog key={dog.id} dog={dog} />
        ))}

        {/* 메인페이지 장식 (bone과 foot) */}
        {mainDecorations.map((d, i) => (
          <DecoItem key={i} {...d} />
        ))}

        {/* 코드 입력 필드 (화면 하단) */}
        {showCodeInput && (
          <div style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '500px',
            backgroundColor: '#fff',
            border: '3px solid #333',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#333',
            }}>입장 코드 입력</h3>
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
              onClick={handleJoinRoom}
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