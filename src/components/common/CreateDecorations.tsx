import DecoItem from './DecoItem';
import { decorations } from '../../constants/decorations';

export default function CreateDecorations() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {decorations.map((d, i) => (
        <DecoItem key={i} {...d} />
      ))}
    </div>
  );
}
