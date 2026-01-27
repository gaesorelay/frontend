import React, { useMemo } from 'react';

import bone from '@/assets/decorations/bone.png';
import foot from '@/assets/decorations/foot.png';
import heart from '@/assets/decorations/heart.png';
import bigHeart from '@/assets/decorations/big_heart.png';
import pencilRed from '@/assets/decorations/pencil_red.png';
import pencilBlue from '@/assets/decorations/pencil_blue.png';
import pencilGreen from '@/assets/decorations/pencil_green.png';
import star from '@/assets/decorations/star.png';

interface Props {
  selectedDogIcon: string;
}

// ✨ 애니메이션 종류 대폭 추가!
const animationStyles = `
  /* 1. 둥둥 떠다니기 */
  @keyframes float { 
    0%, 100% { transform: translateY(0px) rotate(0deg); } 
    50% { transform: translateY(-15px) rotate(5deg); } 
  }
  /* 2. 좌우로 흔들흔들 */
  @keyframes wiggle { 
    0%, 100% { transform: rotate(-10deg) scale(1); } 
    50% { transform: rotate(10deg) scale(1.1); } 
  }
  /* 3. 빙글빙글 회전 */
  @keyframes spin { 
    0% { transform: rotate(0deg); } 
    100% { transform: rotate(360deg); } 
  }
  /* 4. 커졌다 작아졌다 (줌) */
  @keyframes zoom { 
    0%, 100% { transform: scale(0.9); } 
    50% { transform: scale(1.2); } 
  }
  /* 5. 통통 튀기 */
  @keyframes bounce { 
    0%, 100% { transform: translateY(0); } 
    50% { transform: translateY(-20px); } 
  }
`;

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

// 🛡️ 중앙 침범 금지
const getSafeX = () => Math.random() > 0.5 ? rand(-2, 28) : rand(72, 102);

function SetupDecorations({ selectedDogIcon }: Props) {

  // 1. 🖼️ 고정형 데코 (프레임 9개 - 위치 고정)
  const staticItems = useMemo(() => [
    { src: bigHeart, style: { left: '3%', top: '3%', width: '75px', opacity: 0.9 }, anim: 'float', duration: 4 },
    { src: pencilRed, style: { left: '-15px', top: '15%', width: '110px', transform: 'rotate(25deg)' }, anim: 'wiggle', duration: 5 },
    { src: foot, style: { left: '15%', top: '25%', width: '40px', opacity: 0.8 }, anim: 'wiggle', duration: 3.5 },
    { src: pencilBlue, style: { left: '-25px', bottom: '10%', width: '100px', transform: 'rotate(-10deg)' }, anim: 'float', duration: 6 },
    { src: star, style: { left: '10%', bottom: '25%', width: '35px' }, anim: 'spin', duration: 10 },

    { src: pencilGreen, style: { right: '-10px', top: '5%', width: '120px', transform: 'rotate(-155deg)' }, anim: 'float', duration: 5 },
    { src: bone, style: { right: '15%', top: '15%', width: '60px', transform: 'rotate(20deg)' }, anim: 'wiggle', duration: 4 },
    { src: heart, style: { right: '5%', top: '30%', width: '40px' }, anim: 'zoom', duration: 3 }, // zoom 적용
    { src: foot, style: { right: '10%', bottom: '10%', width: '45px', transform: 'rotate(-15deg)' }, anim: 'bounce', duration: 5 }, // bounce 적용
  ], []);

  // 2. 🎈 랜덤 배치 아이템 (20개) - ✨ 애니메이션도 랜덤! ✨
  const scatteredItems = useMemo(() => {
    return Array.from({ length: 20 }).map((_) => {
      const imgList = [star, heart, foot, bone, bigHeart];
      
      // 랜덤으로 이미지 선택
      const randomSrc = imgList[Math.floor(Math.random() * imgList.length)];
      
      // 🔥 랜덤으로 애니메이션 선택 (5가지 중 하나)
      const animList = ['float', 'wiggle', 'spin', 'zoom', 'bounce'];
      const randomAnim = animList[Math.floor(Math.random() * animList.length)];

      return {
        src: randomSrc,
        top: rand(5, 95), 
        left: getSafeX(),
        size: rand(25, 45), 
        duration: rand(3, 8), // 속도도 랜덤
        delay: rand(0, 2), // 시작 타이밍도 랜덤
        rotation: rand(0, 360), // 초기 각도 랜덤
        opacity: rand(0.6, 0.9),
        anim: randomAnim // 결정된 애니메이션
      };
    });
    
  // 🔥 강아지(selectedDogIcon)가 바뀔 때마다 재계산!
  }, [selectedDogIcon]); 

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      <style>{animationStyles}</style>

      {/* 랜덤 배치 아이템 */}
      {scatteredItems.map((item, i) => (
        <img 
          // key값이 바뀌면 리액트가 아예 새로운 요소로 인식해서 애니메이션을 처음부터 다시 실행함
          key={`scatter-${i}-${selectedDogIcon}`} 
          src={item.src} 
          alt="" 
          style={{ 
            position: 'absolute',
            left: `${item.left}%`,
            top: `${item.top}%`,
            width: `${item.size}px`,
            opacity: item.opacity,
            transform: `rotate(${item.rotation}deg)`, // 초기 회전각도 적용
            animation: `${item.anim} ${item.duration}s ease-in-out infinite`,
            animationDelay: `${item.delay}s`,
            willChange: 'transform',
          }} 
        />
      ))}

      {/* 고정 데코 */}
      {staticItems.map((item, i) => (
        <img key={`static-${i}`} src={item.src} alt="" style={{
          position: 'absolute',
          objectFit: 'contain',
          animation: `${item.anim} ${item.duration}s ease-in-out infinite`,
          ...item.style
        }} />
      ))}
    </div>
  );
}

export default React.memo(SetupDecorations);