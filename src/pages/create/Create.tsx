import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';
import type { RoomConfig } from '@/types/game'; // 타입 체크를 위해 import 추천

// 이미지 에셋
import background from '@/assets/background.png';
import logo from '@/assets/logo.png';

// 컴포넌트
import { animationStyles } from '../../components/common/createAnimations';
import CreateFormCard from './CreateFormCard';
import CreateButtons from './CreateButtons';
import CreateDecorations from '@/components/common/CreateDecorations';

export default function CreatePage() {
  const navigate = useNavigate();

  // 1. 상태값들 (State)
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(10);  // 총 정원
  const [storytellers, setStorytellers] = useState(4); // 이야기꾼 수
  const [rounds, setRounds] = useState(3);           // 라운드 수
  const [roundTime, setRoundTime] = useState(60);    // ⭐️ [추가] 라운드 시간
  const [voteTime, setVoteTime] = useState(30);      // 투표 시간

  // 2. 컨트롤러 설정 (UI 표시용)
  const controls = [
    { label: '최대 인원', value: maxPlayers, setValue: setMaxPlayers, unit: '명', step: 1 },
    { label: '이야기꾼 수', value: storytellers, setValue: setStorytellers, unit: '명', step: 1 },
    { label: '라운드 수', value: rounds, setValue: setRounds, unit: 'R', step: 1 },
    // ⭐️ [추가] 라운드 시간 컨트롤러
    { label: '라운드 시간', value: roundTime, setValue: setRoundTime, unit: '초', step: 10 },
    { label: '투표 시간', value: voteTime, setValue: setVoteTime, unit: '초', step: 10 },
  ] as const;

  const setRoomActions = useGameStore((state) => state.setRoomActions);

  const handleCreateRoom = () => {
    // 3. 유효성 검사
    if (!roomName.trim()) {
      alert("방 제목을 입력해주세요!");
      return;
    }
    
    // 이야기꾼이 총 인원보다 많을 순 없음
    if (maxPlayers < storytellers) {
        alert("최대 인원은 이야기꾼 수보다 많아야 합니다!");
        return;
    }

    // 권장 인원 체크 (이야기꾼의 2배수 권장 등 정책에 따라)
    // if (maxPlayers < storytellers * 2) {
    //   if (!window.confirm(`최대 인원이 이야기꾼 수(${storytellers}명)의 2배보다 적습니다.\n관전자가 부족할 수 있는데 진행할까요?`)) {
    //     return;
    //   }
    // }

    // 4. 설정값 포장 📦 (RoomConfig 타입과 100% 일치시킴)
    // 꼬아서 생각할 필요 없이 State 변수 그대로 넣으면 됩니다!
    const configData: RoomConfig = {
      maxPlayers: maxPlayers,        // 총 정원
      storytellerCount: storytellers,// 이야기꾼 수
      rounds: rounds,                // 라운드 수
      roundTime: roundTime,          // ⭐️ 라운드 시간 (초)
      voteTime: voteTime,            // 투표 시간 (초)
    };

    // 5. 스토어에 저장
    setRoomActions(roomName, configData);

    // [Debug] 저장 확인
    setTimeout(() => {
      const stored = localStorage.getItem('game-storage');
      console.log("📦 [CreatePage] 저장 완료:", configData);

      if (!stored) {
        alert("❌ 스토어 저장 실패!");
      } else {
        navigate('/setup');
      }
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

      <CreateFormCard
        logoSrc={logo}
        roomName={roomName}
        setRoomName={setRoomName}
        controls={[...controls]} 
      />

      <CreateButtons
        onBack={() => navigate(-1)}
        onCreate={handleCreateRoom}
      />
    </div>
  );
}