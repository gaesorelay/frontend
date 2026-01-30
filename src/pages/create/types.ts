export type DecoAnimType = 'float' | 'floatReverse' | 'wiggle';

export interface DecoProps {
  src: string;
  x?: number;
  y?: number;
  right?: number;
  bottom?: number;
  rotate?: number;
  size?: number;
  delay?: number;
  duration?: number;
  type?: DecoAnimType;
}

// ✅ 여기를 수정해주세요!
export interface ControlItem {
  label: string;
  value: number;
  setValue: (v: number) => void;
  unit?: string;
  step?: number;
  min?: number; // 👈 이 줄 추가 (최소값)
  max?: number; // 👈 이 줄 추가 (최대값)
}