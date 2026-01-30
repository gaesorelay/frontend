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

export interface ControlItem {
  label: string;
  value: number;
  setValue: (v: number) => void;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
}
