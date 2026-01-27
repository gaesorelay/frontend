import type { DecoProps } from './types';

export default function DecoItem({
  src,
  x,
  y,
  right,
  bottom,
  rotate = 0,
  size = 80,
  delay = 0,
  duration = 3,
  type = 'float',
}: DecoProps) {
  return (
    <img
      src={src}
      alt=""
      style={{
        position: 'absolute',
        left: x !== undefined ? `${x}%` : undefined,
        top: y !== undefined ? `${y}%` : undefined,
        right: right !== undefined ? `${right}%` : undefined,
        bottom: bottom !== undefined ? `${bottom}%` : undefined,
        width: `${size}px`,
        pointerEvents: 'none',
        zIndex: 1,
        animation: `${type} ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        // @ts-expect-error CSS var
        '--base-rotation': `${rotate}deg`,
        transform: `rotate(${rotate}deg)`,
        filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.15))',
      }}
    />
  );
}
