import CreateControls from './CreateControls';
import { sketchBorderStyle } from './createStyles';
// 아까 CreateControls와 맞춰서 공통 타입을 사용하도록 통일했습니다.
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
      <img
        src={logoSrc}
        alt="방 만들기"
        style={{
          width: '400px',
          zIndex: 11,
          marginBottom: '-5px',
          filter: 'drop-shadow(6px 6px 0px rgba(0,0,0,0.1))',
          animation: 'logoJitter 0.3s linear infinite',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          background: 'white',
          padding: '25px 45px',
          width: '450px',
          boxSizing: 'border-box',
          boxShadow: '10px 10px 0px rgba(0,0,0,0.08)',
          ...sketchBorderStyle,
        }}
      >
        <label style={{ fontSize: '26px', display: 'block', marginBottom: '10px' }}>방 이름</label>
        <input
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="방 이름을 적어줘!"
          style={{
            width: '100%',
            padding: '14px 22px',
            fontSize: '22px',
            border: '2.5px solid #333',
            borderRadius: '40px 10px 45px 8px / 8px 45px 10px 40px',
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
          }}
        />

        <CreateControls items={controls} />
      </div>
    </div>
  );
}