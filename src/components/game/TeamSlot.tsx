import React from 'react';
import { motion } from 'framer-motion';
import styles from './TeamSlot.module.css';
import dogHouseImg from '@/assets/doghouse.png';

// 아이콘 (나중에 파일로 교체하세요)
const ICON_PLUS = "➕";
const ICON_LOCKED = "🚫";

interface TeamSlotProps {
  status: 'LOCKED' | 'EMPTY' | 'FILLED'; // 상태 정의
  user?: { nickname: string; avatar: string }; // 채워졌다면 유저 정보
  onClick: () => void;
}

export const TeamSlot = ({ status, user, onClick }: TeamSlotProps) => {
  // 1. 비활성화된 슬롯 (빨간줄)
  if (status === 'LOCKED') {
    return (
      <div className={`${styles.slotBase} ${styles.locked}`}>
        <span className={styles.iconLocked}>{ICON_LOCKED}</span>
      </div>
    );
  }

  // 2. 비어있는 슬롯 (+ 버튼)
  if (status === 'EMPTY') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`${styles.slotBase} ${styles.empty}`}
      >
        <img src={dogHouseImg} className={styles.houseBg} alt="empty house" />
        {/* <div className={styles.houseBg} /> */}
        <div className={styles.plusOverlay}>+</div>
      </motion.button>
    );
  }

  // 3. 유저가 들어간 슬롯
  return (
    <motion.div
      layoutId={user?.nickname}
      onClick={onClick}
      className={`${styles.slotBase} ${styles.filled}`}
      whileHover="hover" // 부모 요소 호버 상태 전파
    >
      <img src={dogHouseImg} className={styles.houseBg} alt="dog house" />

      <div className={styles.avatarWrapper}>
        <img src={user?.avatar} className={styles.dogAvatar} alt={user?.nickname} />
      </div>

      {/* 명패 부분에 애니메이션 추가 가능 */}
      <motion.div

        className={styles.nameTag}
        variants={{
          hover: { rotate: [0, -2, 2, 0], transition: { repeat: Infinity, duration: 0.5 } }
        }}
      >
        <span className={styles.nickname}>{user?.nickname}</span>
      </motion.div>
    </motion.div>
  );
};