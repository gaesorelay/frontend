import { useState } from 'react';
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

const currentScene: SceneId = 'main';
const scene = SCENES[currentScene];

export const Intro = () => {
  // --------------------------------------------------------
  // 1. 기능 로직 (Hooks & Handlers)
  // --------------------------------------------------------
  const navigate = useNavigate();
  const setRoomId = useUserStore((state) => state.setRoomId);

  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputCode, setInputCode] = useState("");

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

  // --------------------------------------------------------
  // 2. 화면 렌더링 (UI)
  // --------------------------------------------------------
  return (
    <>
      <Background>
        {/* 로고 애니메이션 */}
        <motion.img 
          src={mainLogo} 
          alt="mainLogo" 
          style={{
            margin: '0 auto',
            width: '60%',
            height: 'auto',
            display: 'block',
            marginTop: '8vh', // 상단 여백 살짝 조정
          }}
          animate={{
            y: [0, -5, 0],
            rotate: [-1, 1, -1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />

        {/* 버튼 컨테이너 */}
        <div style={{
          width: '60%',
          maxWidth: '400px', // 너무 넓어지지 않게 제한
          margin: '40px auto 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px', // 버튼 사이 간격
          position: 'relative',
          zIndex: 10 // 강아지들보다 위에 오게
        }}>
          {/* 버튼 1: 방 만들기 */}
          <button 
            onClick={handleCreateRoom}
            style={{
              width: '100%', 
              padding: '14px 18px', 
              fontSize: '24px',
              backgroundColor: '#FFD93D', // 노란색 포인트
              color: '#000',
              fontWeight: 'bold',
              border: '3px solid #222', 
              borderRadius: '20px 10px 20px 10px',
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
            onClick={() => setIsModalOpen(true)}
            style={{
              width: '100%', 
              padding: '14px 18px', 
              fontSize: '24px',
              backgroundColor: '#fff',
              color: '#333',
              fontWeight: 'bold',
              border: '3px solid #333', 
              borderRadius: '10px 20px 10px 20px',
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

        {/* 강아지 장식 요소들 */}
        {DOGS.map((dog) => (
          <Dog
            key={dog.id}
            dog={dog}
            message={scene.dogMessages[dog.id]}
          />
        ))}

        {/* 입장 코드 입력 모달 */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="text-center space-y-4 font-sans"> 
            {/* 모달 내부는 가독성을 위해 기본 폰트 사용 혹은 font-pen 클래스 추가 */}
            <h2 className="text-2xl font-bold text-gray-800">입장 코드 입력</h2>
            <input 
              type="text"
              placeholder="예: 1234"
              className="w-full p-3 text-center text-xl border-2 border-gray-300 rounded-lg focus:border-amber-500 outline-none"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
            />
            <button 
              onClick={handleJoinRoom}
              className="w-full py-3 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 shadow-md transition-all active:scale-95"
            >
              입장하기
            </button>
          </div>
        </Modal>

      </Background>
    </>
  );
};

export default Intro;