import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';
import { useAudioStore } from '@/store/useAudioStore';
import type { RoomConfig } from '@/types/game';

// 이미지 에셋
import background from '@/assets/background.png';
import logo from '@/assets/logo.png';
// import bgmMp3 from '@/assets/sound/BGM1.mp3'; // 삭제
import clickMp3 from '@/assets/sound/click.mp3';

// 컴포넌트
import { animationStyles } from '../../components/common/createAnimations';
import CreateFormCard from './CreateFormCard';
import CreateButtons from './CreateButtons';
import CreateDecorations from '@/components/common/CreateDecorations';

export default function CreatePage() {
  const navigate = useNavigate();

  // 3. 오디오 상태 관리 (전역 Store 사용)
  const { isMuted, toggleMute } = useAudioStore();

  const handleToggleMute = () => {
    toggleMute();
    playClick();
  };

  const playClick = () => {
    const audio = new Audio(clickMp3);
    audio.volume = 0.8;
    audio.play().catch(() => { });
  };

  // 1. 상태값들 (State)
  // 초기값은 범위 내 안전한 값으로 설정해두는 것이 좋습니다.
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(20);  // 초기값 20명
  const [storytellers, setStorytellers] = useState(4); // 초기값 4명
  const [roundTime, setRoundTime] = useState(30);    // 초기값 30초
  const [voteTime, setVoteTime] = useState(20);      // 초기값 20초

  // 2. ⚙️ 컨트롤러 설정 (여기에 Min/Max 제한 적용!)
  // HandControl 컴포넌트가 이 min/max 값을 받아 버튼/입력을 제어합니다.
  const controls = [
    {
      label: '최대 인원',
      value: maxPlayers,
      setValue: setMaxPlayers,
      unit: '명',
      step: 1,
      min: 8,   // ✅ 최소 8명
      max: 50   // ✅ 최대 50명
    },
    {
      label: '이야기꾼 수',
      value: storytellers,
      setValue: setStorytellers,
      unit: '명',
      step: 1,
      min: 3,   // ✅ 최소 3명
      max: 8    // ✅ 최대 8명
    },
    {
      label: '글 작성 시간',
      value: roundTime,
      setValue: setRoundTime,
      unit: '초',
      step: 5,  // 5초 단위 이동
      min: 15,  // ✅ 최소 15초
      max: 45   // ✅ 최대 45초
    },
    {
      label: '투표 시간',
      value: voteTime,
      setValue: setVoteTime,
      unit: '초',
      step: 5,
      min: 15,   // ✅ 최소 15초
      max: 25   // ✅ 최대 25초
    },
  ];

  const setRoomActions = useGameStore((state) => state.setRoomActions);

  const handleCreateRoom = () => {
    // 3. 유효성 검사
    if (!roomName.trim()) {
      alert("방 제목을 입력해주세요!");
      return;
    }

    // 논리적 오류 검사 (최대 인원이 이야기꾼보다 적으면 안 됨)
    if (maxPlayers < storytellers) {
      alert("최대 인원은 이야기꾼 수보다 많아야 합니다!");
      return;
    }

    // 4. 설정값 포장 📦
    const configData: RoomConfig = {
      maxPlayers: maxPlayers,        // 총 정원
      storytellerCount: storytellers,// 이야기꾼 수
      roundTime: roundTime,          // 라운드 시간 (초)
      voteTime: voteTime,            // 투표 시간 (초)
    };

    // 5. 스토어에 저장
    setRoomActions(roomName, configData);

    // [Debug] 저장 확인 및 이동
    setTimeout(() => {

      navigate('/setup');

    }, 100);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        overflow: 'hidden',
        fontFamily: 'inherit',
      }}
    >
      <style>{animationStyles}</style>
      <CreateDecorations />

      {/* CreateFormCard에 controls 배열을 그대로 넘겨줍니다.
        내부적으로 HandControl이 min/max를 사용하게 됩니다.
      */}
      <CreateFormCard
        logoSrc={logo}
        roomName={roomName}
        setRoomName={setRoomName}
        controls={[...controls]}
      />

      <button
        onClick={handleToggleMute}
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

      <CreateButtons
        onBack={() => { playClick(); navigate(-1); }}
        onCreate={() => { playClick(); handleCreateRoom(); }}
      />
    </div>
  );
}
