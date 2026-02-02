import { motion } from 'framer-motion';
import { DOG_IMAGE_MAP } from '@/lib/dogImages';
import { SpeechBubble } from './SpeechBubble';
import type { DogData } from '@/types/dog';
import styles from './Dog.module.css';

// Intro에서 넘겨주는 데이터 구조에 딱 맞게 정의
type DogProps = {
  dog: DogData;
  onClick?: () => void;
};

export const Dog = ({ dog, onClick }: DogProps) => {
  const direction = dog.direction || 'right';
  const walkHeight = dog.walkHeight || 20;
  const duration = 18 + Math.random() * 8;

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
        zIndex: 10,
        cursor: onClick ? 'pointer' : 'default',
        pointerEvents: 'auto',
      }}
      onClick={onClick}
      initial={{ x: initialX }}
      animate={{ x: xSequence }}
      transition={{
        x: {
          duration: duration,
          repeat: Infinity,
          ease: 'linear',
        },
      }}
      // --- 클릭(Tap) 시 시각 피드백 강화 ---
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? {
        scale: 0.8, // 꾹 눌리는 느낌
        transition: { type: "spring", stiffness: 400, damping: 10 }
      } : undefined}
    >
      {/* 말풍선 */}
      {dog.speechText && (
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
          zIndex: 1,
        }}>
          <SpeechBubble text={dog.speechText} isFlipped={!isMovingRight} />
        </div>
      )}

      {/* 강아지 이미지 */}
      <motion.img
        className={styles.dog}
        src={DOG_IMAGE_MAP[dog.type]}
        alt={dog.type}
        style={{
          scaleX: isMovingRight ? 1 : -1,
          display: 'block',
          pointerEvents: 'none', // 부모 div가 클릭을 잘 먹도록 방해 금지
        }}
        // 평소 걷는 애니메이션 (Y축 흔들림)
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