import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import background from '@/assets/bg/paper.png';
import logo from '@/assets/logo.png';

import { animationStyles } from './createAnimations';
import CreateDecorations from './CreateDecorations';
import CreateFormCard from './CreateFormCard';
import CreateButtons from './CreateButtons';

export default function CreatePage() {
  const navigate = useNavigate();

  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(30);
  const [storytellers, setStorytellers] = useState(4);
  const [rounds, setRounds] = useState(5);
  const [voteTime, setVoteTime] = useState(30);

  const controls = [
    { label: '최대 인원', value: maxPlayers, setValue: setMaxPlayers, unit: '명' },
    { label: '이야기꾼 수', value: storytellers, setValue: setStorytellers, unit: '명' },
    { label: '목표 라운드', value: rounds, setValue: setRounds, unit: 'R' },
    { label: '투표 시간', value: voteTime, setValue: setVoteTime, unit: '초', step: 10 },
  ] as const;

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
        onCreate={() => alert('방 생성!')}
      />
    </div>
  );
}
