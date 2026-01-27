import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 이미지 에셋 (기존 유지)
import background from '@/assets/background.png';
import logo from '@/assets/logo.png';

// 같은 폴더(pages)에 있는 파일들 (만약 이것들도 옮겼다면 경로 수정 필요!)
import { animationStyles } from '../../components/common/createAnimations';
import CreateFormCard from './CreateFormCard';
import CreateButtons from './CreateButtons';

// ✅ 수정됨: components/common 폴더에서 가져오기
// (현재 파일이 src/pages/ 안에 있다고 가정할 때 '../'로 나감)
import CreateDecorations from '@/components/common/CreateDecorations'; 

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
      {/* 애니메이션 스타일 주입 */}
      <style>{animationStyles}</style>

      {/* 배경 꾸미기 요소 */}
      <CreateDecorations />

      {/* 방 만들기 폼 카드 */}
      <CreateFormCard
        logoSrc={logo}
        roomName={roomName}
        setRoomName={setRoomName}
        controls={[...controls]}
      />

      {/* 하단 버튼들 */}
      <CreateButtons
        onBack={() => navigate(-1)}
        onCreate={() => navigate('/setup')}
      />
    </div>
  );
}