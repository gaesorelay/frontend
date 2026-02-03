import HandControl from '@/components/common/HandControl';
import type { ControlItem } from '../../components/common/types';

interface Props {
  items: ControlItem[];
}

export default function CreateControls({ items }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-evenly' }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '24px' }}>{item.label}</span>

          {/* 👇 여기에 min과 max를 추가했습니다! 이제 제한이 작동합니다. */}
          <HandControl
            value={item.value}
            setValue={item.setValue}
            unit={item.unit}
            step={item.step}
            min={item.min} // ✅ 최소값 전달 (이게 없어서 1까지 내려갔던 것!)
            max={item.max} // ✅ 최대값 전달
          />
        </div>
      ))}
    </div>
  );
}
