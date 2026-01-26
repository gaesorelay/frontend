// src/pages/create/CreatePage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore'; // 👈 GameStore import (설정 저장용)

import background from '@/assets/bg/paper.png';
import logo from '@/assets/logo.png';

import { animationStyles } from './createAnimations';
import CreateDecorations from './CreateDecorations';
import CreateFormCard from './CreateFormCard';
import CreateButtons from './CreateButtons';

export default function CreatePage() {
  const navigate = useNavigate();
  const setRoomConfig = useGameStore((state) => state.setRoomConfig); // 👈 스토어 함수 가져오기

  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(30);
  const [storytellers, setStorytellers] = useState(4);
  const [rounds, setRounds] = useState(5);
  const [voteTime, setVoteTime] = useState(30);

  const controls = [
    { label: '최대 인원', value: maxPlayers, setValue: setMaxPlayers, unit: '명', step: 1, min: 4, max: 50 },
    { label: '이야기꾼 수', value: storytellers, setValue: setStorytellers, unit: '명', step: 1, min: 2, max: 8 },
    { label: '목표 라운드', value: rounds, setValue: setRounds, unit: 'R', step: 1, min: 1, max: 10 },
    { label: '투표 시간', value: voteTime, setValue: setVoteTime, unit: '초', step: 10, min: 10, max: 180 },
  ] as const;

  // ⭐️ [수정된 핸들러] API 호출 안 함! 설정만 저장하고 이동!
  const handleCreateRoom = () => {
    // 1. 유효성 검사
    if (!roomName.trim()) {
      alert("방 제목을 입력해주세요!");
      return;
    }
    if (maxPlayers < storytellers * 2) {
      if (!window.confirm(`최대 인원이 너무 적습니다.\n(최소 ${storytellers * 2}명 권장)\n진행할까요?`)) {
        return;
      }
    }

    // 2. 설정값 포장 📦
    const configData = {
      title: roomName,
      maxPlayers,
      storytellerCount: storytellers,
      rounds,
      voteTime,
      roundTime: 30, // 기본값 (UI에 없으면)
    };

    // 3. 스토어에 저장 (Setup 페이지가 이걸 보고 "아, 내가 방장이구나" 인식함)
    setRoomConfig(configData); 

    console.log("📦 방 설정 저장 완료, Setup 페이지로 이동:", configData);

    // 4. Setup 페이지로 이동
    navigate('/setup'); 
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
        onCreate={handleCreateRoom} // 👈 심플해진 핸들러 연결
      />
    </div>
  );
}