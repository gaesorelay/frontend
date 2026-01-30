import HandControl from '@/components/common/HandControl';
// 보통 공통 컴포넌트에는 공통 타입을 쓰는 경우가 많으므로 아래 경로를 선택했습니다.
// 만약 에러가 난다면 './types'로 바꿔주세요.
import type { ControlItem } from '../../components/common/types';

interface Props {
  items: ControlItem[];
}

export default function CreateControls({ items }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '20px' }}>
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
          <HandControl
            value={item.value}
            setValue={item.setValue}
            unit={item.unit}
            step={item.step}
          />
        </div>
      ))}
    </div>
  );
}