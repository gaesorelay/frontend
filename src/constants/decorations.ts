import star from '@/assets/decorations/star.png';
import heart from '@/assets/decorations/heart.png';
import bone from '@/assets/decorations/bone.png';
import foot from '@/assets/decorations/foot.png';
import pencilRed from '@/assets/decorations/pencil_red.png';
import pencilBlue from '@/assets/decorations/pencil_blue.png';
import pencilGreen from '@/assets/decorations/pencil_green.png';

import type { DecoProps } from '../components/common/types';

export const decorations: DecoProps[] = [
  { src: pencilRed, x: 2, y: 5, size: 130, rotate: -25, duration: 4 },
  { src: star, x: 10, y: 4, size: 45, type: 'wiggle', delay: 0.5 },
  { src: heart, x: 18, y: 10, size: 30, type: 'floatReverse', delay: 0.2 },
  { src: bone, x: 8, y: 18, size: 70, rotate: 45, duration: 3.5 },
  { src: star, x: 3, y: 25, size: 25, type: 'wiggle', delay: 1 },
  { src: pencilBlue, x: -2, y: 30, size: 120, rotate: 80, duration: 5 },
  { src: foot, x: 15, y: 35, size: 50, rotate: -10, duration: 4 },
  { src: heart, x: 25, y: 32, size: 35, type: 'float', delay: 0.4 },
  { src: star, x: 5, y: 42, size: 30, type: 'floatReverse', delay: 1.1 },
  { src: heart, x: 14, y: 48, size: 40, type: 'wiggle', delay: 0.7 },
  { src: bone, x: 5, y: 58, size: 60, rotate: -30, type: 'floatReverse' },
  { src: foot, x: 20, y: 62, size: 45, rotate: 15, duration: 4.5 },
  { src: pencilGreen, x: 4, bottom: 15, size: 140, rotate: 15, duration: 5 },
  { src: star, x: 18, bottom: 25, size: 35, type: 'wiggle', delay: 1.2 },
  { src: foot, x: 10, bottom: 5, size: 55, rotate: 20, duration: 3 },
  { src: heart, x: 24, bottom: 14, size: 35, type: 'float', delay: 0.9 },
  { src: star, x: 5, bottom: 2, size: 30, type: 'wiggle', delay: 1.5 },

  { src: pencilBlue, right: 2, y: 8, size: 130, rotate: 160, duration: 4.2 },
  { src: heart, right: 14, y: 3, size: 40, type: 'wiggle', delay: 0.3 },
  { src: star, right: 22, y: 10, size: 35, type: 'floatReverse' },
  { src: foot, right: 8, y: 20, size: 55, rotate: 15, duration: 3.8 },
  { src: pencilRed, right: -3, y: 32, size: 125, rotate: 200, duration: 6 },
  { src: bone, right: 18, y: 30, size: 65, rotate: -20, delay: 0.6 },
  { src: heart, right: 26, y: 38, size: 30, type: 'wiggle', delay: 1.3 },
  { src: pencilRed, right: 5, y: 48, size: 145, rotate: 195, delay: 0.5, duration: 5.5 },
  { src: star, right: 22, y: 52, size: 30, type: 'wiggle', delay: 0.8 },
  { src: foot, right: 30, y: 58, size: 40, rotate: -45, duration: 4 },
  { src: heart, right: 12, y: 65, size: 45, type: 'floatReverse' },
  { src: bone, right: 4, y: 72, size: 55, rotate: 10, type: 'wiggle' },

  { src: pencilGreen, right: 3, bottom: 10, size: 150, rotate: 215, duration: 4.8 },
  { src: bone, right: 15, bottom: 22, size: 70, type: 'wiggle', delay: 0.4 },
  { src: star, right: 25, bottom: 28, size: 35, type: 'float', delay: 0.7 },
  { src: foot, right: 10, bottom: 5, size: 50, rotate: -15, duration: 3.2 },
  { src: star, right: 25, bottom: 12, size: 40, type: 'floatReverse', delay: 1.5 },
  { src: heart, right: 5, bottom: 2, size: 30, type: 'wiggle', delay: 2 },

  { src: star, x: 30, y: 15, size: 20, type: 'wiggle', delay: 2 },
  { src: heart, right: 30, bottom: 20, size: 25, type: 'floatReverse', delay: 1.8 },
];
