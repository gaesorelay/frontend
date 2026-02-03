import CreateControls from './CreateControls';
import { sketchBorderStyle } from './createStyles';
import type { ControlItem } from '../../components/common/types';

interface Props {
  logoSrc: string;
  roomName: string;
  setRoomName: (v: string) => void;
  controls: ControlItem[];
}

export default function CreateFormCard({ logoSrc, roomName, setRoomName, controls }: Props) {
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* ✅ [복구됨] 로고 이미지 */}
      <img
        src={logoSrc}
        alt="방 만들기"
        style={{
          width: '350px', // 크기 적절히 조절
          zIndex: 11,
          marginBottom: '-10px', // 카드와 살짝 겹치게 (자연스럽게)
          filter: 'drop-shadow(5px 5px 0px rgba(0,0,0,0.1))',
          animation: 'logoJitter 0.3s linear infinite', // 흔들리는 애니메이션 유지
        }}
      />

      {/* 흰색 카드 영역 */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          background: 'white',
          padding: '25px 35px',
          width: '550px',       // 요청하신 대로 가로를 조금 넓게 잡음
          minHeight: '500px',   // ↕️ 높이 늘리기
          boxSizing: 'border-box',
          boxShadow: '8px 8px 0px rgba(0,0,0,0.08)',
          display: 'flex',        // ✨ Flex 컨테이너로 변경
          flexDirection: 'column',// 세로 정렬
          ...sketchBorderStyle, // 스케치북 스타일 테두리
        }}
      >
        <label style={{ fontSize: '24px', display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          방 이름
        </label>

        <input
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="방 이름을 적어줘!"
          style={{
            width: '100%',
            padding: '12px 18px',
            fontSize: '20px',
            border: '2.5px solid #333',
            borderRadius: '40px 10px 45px 8px / 8px 45px 10px 40px',
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
          }}
        />

        <div style={{ marginTop: '10px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <CreateControls items={controls} />
        </div>
      </div>
    </div>
  );
}
