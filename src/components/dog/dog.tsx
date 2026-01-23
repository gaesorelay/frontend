// src/components/dog/Dog.tsx
import { motion } from 'framer-motion';
import { DOG_IMAGE_MAP } from '@/lib/dogImages';
import type { DogData } from '@/types/dog';
import styles from './Dog.module.css';

type DogProps = {
  dog: DogData;
};

export const Dog = ({ dog }: DogProps) => {
  const direction = dog.direction || 'right';
  const walkHeight = dog.walkHeight || 20;
  const duration = 18 + Math.random() * 8; // 18~26초 사이의 다른 속도

  // direction에 따라 초기 위치와 이동 경로 설정
  const isMovingRight = direction === 'right';
  const initialX = isMovingRight ? -500 : window.innerWidth + 500;
  const xSequence = isMovingRight 
    ? [-500, window.innerWidth + 500]
    : [window.innerWidth + 500, -500];

  return (
    <motion.div
      className={styles.wrapper}
      style={{
        position: 'absolute',
        bottom: `${walkHeight}%`,
        zIndex: 'var(--z-dog)',
      }}
      initial={{ x: initialX }}
      animate={{
        x: xSequence,
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <motion.img
        className={styles.dog}
        src={DOG_IMAGE_MAP[dog.type]}
        alt={dog.type}
        style={{
          scaleX: isMovingRight ? 1 : -1, // 방향에 따라 이미지 flip
        }}
        animate={{
          y: [0, -8, 0],
          rotate: [-2, 2, -2],
        }}
        transition={{
          duration: 0.6 + Math.random() * 0.3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
};