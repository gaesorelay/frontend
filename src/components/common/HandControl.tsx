interface HandControlProps {
  value: number;
  setValue: (v: number) => void;
  unit?: string;
  step?: number;
}

export default function HandControl({
  value,
  setValue,
  unit = '',
  step = 1,
}: HandControlProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          width: '60px',
          height: '42px',
          backgroundColor: 'white',
          border: '2.5px solid #222',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '22px',
          borderRadius: '10px',
          fontFamily: 'inherit',
          boxShadow: '3px 3px 0px rgba(0,0,0,0.1)',
        }}
      >
        {value}
        {unit}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <button
          className="control-btn"
          onClick={() => setValue(value + step)}
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
          onClick={() => setValue(Math.max(1, value - step))}
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
