import { sketchBorderStyle, shadowColor } from './createStyles';

interface Props {
  onBack: () => void;
  onCreate: () => void;
}

export default function CreateButtons({ onBack, onCreate }: Props) {
  return (
    <div style={{ display: 'flex', width: '450px', gap: '22px', marginTop: '25px', zIndex: 10 }}>
      <button
        onClick={onBack}
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

      <button
        onClick={onCreate}
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
