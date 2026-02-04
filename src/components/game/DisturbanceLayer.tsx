import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { useUserStore } from '@/store/useUserStore'; // nickname용
import { socket } from '@/lib/socket';
import pawImg from '@/assets/paw_print.png';

const generateId = () => Math.random().toString(36).substr(2, 9);

const DisturbanceLayer = () => {
  // 1. 필요한 상태들 가져오기
  const { footprints, addFootprint, removeFootprint, isSabotageMode, players } = useGameStore();
  const { nickname } = useUserStore();
  const [mounted, setMounted] = useState(false);

  // 2. ⭐️ [핵심 수정] ChatArea와 동일한 로직으로 '관객 여부' 판단
  // socket.id를 기준으로 내 정보를 찾습니다.
  const myInfo = players.find((p) => p.currentSocketId === socket.id);
  // 내 정보가 없거나(입장 직후), 팀이 없거나, 역할이 AUDIENCE면 관객으로 간주
  const isAudience = !myInfo || myInfo.role === 'AUDIENCE';

  // 마운트 체크
  useEffect(() => {
    setMounted(true);
  }, []);

  // 소켓 리스너
  useEffect(() => {
    const handleReaction = (data: { emoji: string }) => {
      if (!data.emoji.includes('|')) return;
      const [symbol, xStr, yStr] = data.emoji.split('|');
      if (symbol === '🐾' && xStr && yStr) {
        const id = generateId();
        addFootprint({
          id,
          x: parseFloat(xStr),
          y: parseFloat(yStr),
          rotation: Math.random() * 360,
        });
        setTimeout(() => removeFootprint(id), 3000);
      }
    };
    socket.on('receive_reaction', handleReaction);
    return () => {
      socket.off('receive_reaction', handleReaction);
    };
  }, [addFootprint, removeFootprint]);

  // 2. ⭐️ [핵심 변경] 전역 클릭 감지 리스너
  useEffect(() => {
    if (!isSabotageMode || !isAudience) return;

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // 🚨 [예외 처리] 클릭한 곳이 '채팅창(.chat-area-container)' 내부라면?
      // 방해 공작을 하지 않고, 원래 클릭 동작(버튼 클릭, 채팅 입력 등)을 허용합니다.
      if (target.closest('.chat-area-container')) {
        return;
      }

      // 그 외의 영역(책, 배경 등)을 클릭했다면? -> 방해 공작 발동!

      // A. 원래 기능(책 넘김 등) 막기
      e.stopPropagation();
      e.preventDefault();

      // B. 좌표 계산 및 전송
      const x = ((e.clientX / window.innerWidth) * 100).toFixed(2);
      const y = ((e.clientY / window.innerHeight) * 100).toFixed(2);
      const payload = `🐾|${x}|${y}`;
      socket.emit('send_reaction', { emoji: payload, nickname });
    };

    // 'click' 이벤트보다 더 빨리 잡기 위해 'pointerdown' 사용 권장 (모바일 호환성 등)
    // capture: true 옵션을 사용하여 가장 먼저 이벤트를 낚아챕니다.
    window.addEventListener('pointerdown', handleGlobalClick, { capture: true });

    return () => {
      window.removeEventListener('pointerdown', handleGlobalClick, { capture: true });
    };
  }, [isSabotageMode, isAudience, nickname]); // 모드가 바뀔 때마다 리스너 갱신

  // 클릭 핸들러
  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // ⭐️ isAudience 변수 사용 (role 변수 X)
    if (!isAudience || !isSabotageMode) return;

    const x = ((e.clientX / window.innerWidth) * 100).toFixed(2);
    const y = ((e.clientY / window.innerHeight) * 100).toFixed(2);
    const payload = `🐾|${x}|${y}`;
    socket.emit('send_reaction', { emoji: payload, nickname });
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {isSabotageMode && isAudience && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99998,
            pointerEvents: 'none', // ⭐️ 클릭은 자바스크립트로 잡으므로 이건 통과시킴
            boxShadow: 'inset 0 0 0 5px rgba(255, 71, 87, 0.5)', // 붉은 테두리
          }}
        />
      )}

      {/* 커서 스타일을 위한 전역 스타일 주입 */}
      {isSabotageMode && isAudience && (
        <style>{`
          body { cursor: crosshair !important; }
          /* 채팅창 위에서는 다시 원래 커서로 */
          .chat-area-container { cursor: auto !important; }
          .chat-area-container button { cursor: pointer !important; }
        `}</style>
      )}

      {/* 2. 발자국 렌더링 레이어 */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 99999,
          overflow: 'hidden',
        }}
      >
        <AnimatePresence>
          {footprints.map((fp) => (
            <motion.img
              key={fp.id}
              src={pawImg}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.8 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{
                position: 'absolute',
                left: `${fp.x}%`,
                top: `${fp.y}%`,
                width: '120px',
                // Framer Motion 전용 속성 사용
                translateX: '-50%',
                translateY: '-50%',
                rotate: fp.rotation,
                imageRendering: '-webkit-optimize-contrast' as any,
                filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.2))',
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </>,
    document.body
  );
};

export default DisturbanceLayer;
