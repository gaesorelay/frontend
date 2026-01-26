import HandControl from '@/components/common/HandControl';
import type { ControlItem } from './types';

interface Props {
  items: ControlItem[];
}

export default function CreateControls({ items }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '24px' }}>
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
          <HandControl value={item.value} setValue={item.setValue} unit={item.unit} step={item.step} />
        </div>
      ))}
    </div>
  );
}
