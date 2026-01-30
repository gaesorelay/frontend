import { useMemo } from 'react';
import clickSound from '@/assets/sound/2.wav'; // wav 파일 경로 확인

interface HandControlProps {
  value: number;
  setValue: (v: number) => void;
  unit?: string;
  step?: number;
  min?: number; // 최소값
  max?: number; // 최대값
}

export default function HandControl({
  value,
  setValue,
  unit = '',
  step = 1,
  min = 1,
  max = 9999,
}: HandControlProps) {

  // --- 🔊 소리 로직 (가장 빠른 반응 속도) ---
  const baseAudio = useMemo(() => {
    const sound = new Audio(clickSound);
    sound.volume = 0.6;
    sound.preload = 'auto';
    return sound;
  }, []);

  const playSound = () => {
    try {
      const clone = baseAudio.cloneNode() as HTMLAudioElement;
      clone.volume = 0.6;
      clone.play().catch(e => console.error(e));
    } catch (e) {
      console.error(e);
    }
  };
  // ----------------------------------------

  // ✅ [입력 핸들러] 숫자만 입력 가능하게
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // 다 지웠을 때는 잠시 빈 화면 허용 (UX상 자연스럽게)
    if (val === '') {
      setValue(0); // 내부적으로 0이나 임시값 처리, UI에서는 빈칸처럼 보일 수 있음
      return;
    }

    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      // 입력 중에는 최대값만 막고, 최소값은 Blur에서 처리 (타이핑 편의성)
      if (parsed > max) setValue(max);
      else setValue(parsed);
    }
  };

  // ✅ [포커스 해제 핸들러] 입력이 끝나면 최소값 검사 (예: 20초 미만 입력 시 20으로 복구)
  const handleBlur = () => {
    if (value < min) setValue(min);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

      {/* 🎨 브라우저 기본 스핀 버튼(화살표) 숨기는 스타일 */}
      <style>{`
        .no-spin::-webkit-inner-spin-button, 
        .no-spin::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        .no-spin {
          -moz-appearance: textfield;
        }
      `}</style>

      {/* ⬜ 값 입력 박스 */}
      <div
        style={{
          width: '80px', // 입력 편의를 위해 살짝 넓힘 (60 -> 80)
          height: '42px',
          backgroundColor: 'white',
          border: '2.5px solid #222',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '10px',
          fontFamily: 'inherit',
          boxShadow: '3px 3px 0px rgba(0,0,0,0.1)',
          position: 'relative', // 단위 배치를 위해
          overflow: 'hidden',   // 글자가 박스 밖으로 나가는 것 방지
        }}
      >
        {/* ✅ 숫자 입력 인풋 */}
        <input
          type="number"
          className="no-spin" // 화살표 숨김 클래스 적용
          value={value === 0 ? '' : value} // 0일 땐 빈칸처럼 보이게 (선택사항)
          onChange={handleChange}
          onBlur={handleBlur}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            outline: 'none',
            fontSize: '22px',
            fontWeight: 'bold',
            textAlign: 'center', // 가운데 정렬
            background: 'transparent',
            paddingRight: unit ? '20px' : '0px', // 단위가 있으면 공간 확보
            fontFamily: 'inherit',
            color: '#222',
          }}
        />

        {/* ✅ 단위 표시 (명, 초) - 절대 위치로 고정 */}
        {unit && (
          <span
            style={{
              position: 'absolute',
              right: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#888',
              pointerEvents: 'none', // 클릭 통과 (뒤에 input 선택되게)
            }}
          >
            {unit}
          </span>
        )}
      </div>

      {/* 🎛 컨트롤 버튼 영역 (기존 유지) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <button
          className="control-btn"
          onClick={() => {
            playSound();
            setValue(Math.min(max, value + step));
          }}
          style={{
            width: '28px',
            height: '19px',
            cursor: 'pointer',
            border: '2px solid #222',
            backgroundColor: '#C1E1C1',
            borderRadius: '6px 6px 2px 2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            padding: 0,
            fontFamily: 'inherit',
            color: '#222',
            boxShadow: '1px 1px 0px rgba(0,0,0,0.1)',
          }}
          type="button"
        >
          ▲
        </button>

        <button
          className="control-btn"
          onClick={() => {
            playSound();
            setValue(Math.max(min, value - step)); // 최소값 제한
          }}
          style={{
            width: '28px',
            height: '19px',
            cursor: 'pointer',
            border: '2px solid #222',
            backgroundColor: '#FFD1D1',
            borderRadius: '2px 2px 6px 6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            padding: 0,
            fontFamily: 'inherit',
            color: '#222',
            boxShadow: '1px 1px 0px rgba(0,0,0,0.1)',
          }}
          type="button"
        >
          ▼
        </button>
      </div>
    </div>
  );
}