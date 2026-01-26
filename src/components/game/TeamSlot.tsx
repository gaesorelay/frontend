import React from 'react';
import { motion } from 'framer-motion';

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
      <div className="w-20 h-24 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-gray-300 opacity-50 cursor-not-allowed">
        <span className="text-4xl grayscale">{ICON_LOCKED}</span>
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
        className="w-20 h-24 bg-white rounded-lg flex items-center justify-center border-2 border-dashed border-amber-400 cursor-pointer shadow-sm hover:bg-amber-50"
      >
        <span className="text-3xl text-amber-500">{ICON_PLUS}</span>
      </motion.button>
    );
  }

  // 3. 유저가 들어간 슬롯
  return (
    <motion.div
      layoutId={user?.nickname}
      onClick={onClick} // 클릭하면 내보내기?
      className="w-20 h-24 bg-white rounded-lg flex flex-col items-center justify-center border-2 border-amber-600 shadow-md cursor-pointer relative overflow-hidden"
    >
      <div className="text-3xl mb-1">{user?.avatar}</div>
      <span className="text-xs font-bold truncate w-full text-center px-1">
        {user?.nickname}
      </span>
      {/* 마우스 올리면 X 표시 뜨게 해도 좋음 */}
    </motion.div>
  );
};