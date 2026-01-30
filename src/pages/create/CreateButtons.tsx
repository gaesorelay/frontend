import { sketchBorderStyle, shadowColor } from './createStyles';
import clickSound from '@/assets/sound/click.mp3';

interface Props {
  onBack: () => void;
  onCreate: () => void;
}

export default function CreateButtons({ onBack, onCreate }: Props) {
  // ✅ 소리 재생 함수 (이걸 복사해서 다른 파일에서도 쓰시면 됩니다)
  const playSound = () => {
    try {
      const audio = new Audio(clickSound);
      audio.volume = 0.6;
      audio.play();
    } catch (e) {
      console.error("Sound error", e);
    }
  };

  return (
    <div style={{ display: 'flex', width: '450px', gap: '22px', marginTop: '25px', zIndex: 10 }}>
      {/* 🔙 돌아가기 버튼 */}
      <button
        onClick={() => {
          playSound(); // 🔊 딸깍!
          onBack();
        }}
        className="create-btn"
        style={{
          flex: 0.8,
          padding: '14px',
          fontSize: '22px',
          background: '#E3F2FD',
          color: '#666',
          cursor: 'pointer',
          boxShadow: `5px 5px 0px ${shadowColor}`,
          fontFamily: 'inherit',
          ...sketchBorderStyle,
        }}
        type="button"
      >
        돌아가기
      </button>

      {/* ✅ 방 만들기 버튼 */}
      <button
        onClick={() => {
          playSound(); // 🔊 딸깍!
          onCreate();
        }}
        className="create-btn"
        style={{
          flex: 1.2,
          padding: '14px',
          fontSize: '24px',
          background: '#FFE066',
          color: '#000',
          cursor: 'pointer',
          boxShadow: `6px 6px 0px ${shadowColor}`,
          fontFamily: 'inherit',
          ...sketchBorderStyle,
        }}
        type="button"
      >
        이대로 방 만들기!
      </button>
    </div>
  );
}