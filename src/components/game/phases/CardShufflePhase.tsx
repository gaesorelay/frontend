import { useEffect, useState, useMemo } from 'react';
import paperBg from '@/assets/bg/paper.png';
import titleLogo from '@/assets/logo/carddistribute.png';
import dotImage from '@/assets/logo/dot.png';
import cardLogo1 from '@/assets/logo/cardlogo1.png';
import cardLogo2 from '@/assets/logo/cardlogo2.png';
import cardLogo3 from '@/assets/logo/cardlogo3.png';
import aiTeacherLogo from '@/assets/logo/AIteacher.png';

import { getAvatarSrc, getTotalAvatars } from '@/lib/avatarMapper';

// Decorations Import
import bone from '@/assets/decorations/bone.png';
import foot from '@/assets/decorations/foot.png';
import heart from '@/assets/decorations/heart.png';
import bigHeart from '@/assets/decorations/big_heart.png';
import pencilRed from '@/assets/decorations/pencil_red.png';
import pencilBlue from '@/assets/decorations/pencil_blue.png';
import pencilGreen from '@/assets/decorations/pencil_green.png';
import star from '@/assets/decorations/star.png';

const DECORATION_IMAGES = [
  bigHeart, bone, foot, heart, pencilBlue, pencilGreen, pencilRed, star
];

import { useGameStore } from '@/store/useGameStore';
import { getCardImage } from '@/lib/cardMapper';

const TOTAL_CARDS = 40;
const TARGET_COUNT = 8;

const CardShufflePhase = () => {
  const [isShuffling, setIsShuffling] = useState(true);
  const [shuffleTick, setShuffleTick] = useState(0);
  const [isDealt, setIsDealt] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const [dotCount, setDotCount] = useState(1);
  const [outroStep, setOutroStep] = useState(0);
  const [showAITeacher, setShowAITeacher] = useState(false);

  const roundData = useGameStore((state) => state.roundData);

  const backgroundDecorations = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      image: DECORATION_IMAGES[Math.floor(Math.random() * DECORATION_IMAGES.length)],
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      rotation: `${Math.random() * 360}deg`,
      scale: `${Math.random() * 0.5 + 0.5}`,
    }));
  }, []);

  const cardsData = useMemo(() => {
    // 1. 카드 ID 준비 (데이터 없으면 1~8 fallback)
    const targetCardIds = roundData?.cardIds && roundData.cardIds.length >= TARGET_COUNT
      ? roundData.cardIds
      : [1, 2, 3, 4, 5, 6, 7, 8];

    // 2. 심사위원(Avatar) ID 준비
    let targetJudgeIds: number[] = [];
    if (roundData?.judgeIds && roundData.judgeIds.length >= TARGET_COUNT) {
      targetJudgeIds = roundData.judgeIds;
    } else {
      // Fallback: 랜덤 생성
      const dogIndices = new Set<number>();
      const totalAvatars = getTotalAvatars();
      const maxIndex = totalAvatars > 0 ? totalAvatars : 1;
      while (dogIndices.size < TARGET_COUNT) {
        dogIndices.add(Math.floor(Math.random() * maxIndex) + 1);
      }
      targetJudgeIds = Array.from(dogIndices);
    }

    return Array.from({ length: TOTAL_CARDS }).map((_, i) => {
      const isTarget = i < TARGET_COUNT;

      let frontImage = '';
      let backImage = '';

      if (isTarget) {
        // 실제 게임 데이터 매핑
        const cId = targetCardIds[i]; // 카드 ID
        const jId = targetJudgeIds[i]; // 심사위원 ID
        frontImage = getCardImage(cId);
        backImage = getAvatarSrc(jId);
      } else {
        // 더미 카드 (나머지 깔리는 카드들)
        // 앞면은 그냥 1번 카드(혹은 아무거나), 뒷면은 기본값
        frontImage = getCardImage(targetCardIds[0]);
        backImage = getAvatarSrc(1);
      }

      return {
        id: i,
        isTarget,
        frontImage,
        backImage,
      };
    });
  }, [roundData]);

  const getShufflePos = (index: number) => {
    if (!isShuffling) return { x: 0, y: 0, r: 0 };
    const randomSeed = index * shuffleTick * 123.45;
    const randomX = (Math.sin(randomSeed) * 50);
    const randomY = (Math.cos(randomSeed * 0.5) * 50);
    const randomR = (Math.sin(randomSeed * 0.2) * 40);
    return { x: randomX, y: randomY, r: randomR };
  };

  useEffect(() => {
    const dotInterval = setInterval(() => setDotCount((prev) => (prev < 3 ? prev + 1 : 1)), 300);
    const shuffleInterval = setInterval(() => setShuffleTick((prev) => prev + 1), 80);

    const stopShuffleTimer = setTimeout(() => { clearInterval(shuffleInterval); setIsShuffling(false); }, 2000);
    const dealTimer = setTimeout(() => setIsDealt(true), 2500);

    const revealStartTimer = setTimeout(() => {
      clearInterval(dotInterval); setDotCount(0);
      for (let i = 0; i < TARGET_COUNT; i++) { setTimeout(() => setVisibleCount((prev) => prev + 1), i * 200); }
    }, 4000);

    const outroTimer1 = setTimeout(() => setOutroStep(1), 6000);
    const outroTimer2 = setTimeout(() => setOutroStep(2), 7500);
    const outroTimer3 = setTimeout(() => setOutroStep(3), 9000); // 9초에 "킹받을까!?" 등장

    // ⚡️ [시간 단축] 9.8초: 0.8초 뒤에 바로 AI 등장 (기존 10.5초에서 단축)
    const aiTeacherTimer = setTimeout(() => {
      setShowAITeacher(true);
    }, 9800);

    // 🏁 [시간 단축] 12.0초: 종료 (기존 12.5초에서 단축)
    // const finishTimer = setTimeout(() => onFinish(), 12000);

    return () => {
      clearInterval(dotInterval); clearInterval(shuffleInterval);
      clearTimeout(stopShuffleTimer); clearTimeout(dealTimer); clearTimeout(revealStartTimer);
      clearTimeout(outroTimer1); clearTimeout(outroTimer2); clearTimeout(outroTimer3);
      clearTimeout(aiTeacherTimer);
      // clearTimeout(finishTimer);
    };
  }, []);

  return (
    <div
      style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: `url(${paperBg})`, backgroundSize: 'cover', backgroundPosition: 'center',
        zIndex: 10, overflow: 'hidden',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.6 }}>
        {backgroundDecorations.map((deco) => (
          <img key={deco.id} src={deco.image} alt="deco" style={{ position: 'absolute', top: deco.top, left: deco.left, transform: `translate(-50%, -50%) rotate(${deco.rotation}) scale(${deco.scale})`, width: '40px', height: 'auto', filter: 'grayscale(20%)' }} />
        ))}
      </div>

      {/* --- 상단 로고 및 아웃트로 영역 --- */}
      <div style={{ position: 'absolute', top: '8%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', zIndex: 20, transition: 'all 0.5s', transform: visibleCount > 0 ? 'scale(0.9) translateY(-20px)' : 'scale(1)', opacity: outroStep > 0 ? 0 : 1 }}>
          <img src={titleLogo} alt="Card Distribute" className="drop-shadow-md" style={{ width: '800px', height: 'auto', display: 'block', margin: 0 }} />
          <div style={{ display: 'flex', gap: '8px', marginLeft: '20px', alignItems: 'center', marginTop: '60px' }}>
            {dotCount >= 1 && <img src={dotImage} alt="dot" className="animate-bounce" style={{ width: '30px', height: '30px', animationDelay: '0ms' }} />}
            {dotCount >= 2 && <img src={dotImage} alt="dot" className="animate-bounce" style={{ width: '30px', height: '30px', animationDelay: '150ms' }} />}
            {dotCount >= 3 && <img src={dotImage} alt="dot" className="animate-bounce" style={{ width: '30px', height: '30px', animationDelay: '300ms' }} />}
          </div>
        </div>

        {outroStep > 0 && (
          <div style={{ position: 'absolute', top: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <img src={cardLogo1} alt="1" className={`absolute top-0 drop-shadow-lg transition-all duration-500 ${outroStep === 1 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-10'}`} style={{ width: '400px' }} />
            <img src={cardLogo2} alt="2" className={`absolute top-0 drop-shadow-lg transition-all duration-500 ${outroStep === 2 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-10'}`} style={{ width: '400px' }} />
            <img src={cardLogo3} alt="3" className={`absolute top-0 drop-shadow-xl transition-all duration-500 ${outroStep === 3 ? 'opacity-100 scale-125 translate-y-0' : 'opacity-0 scale-50 translate-y-10'}`} style={{ width: '450px' }} />
          </div>
        )}
      </div>

      {/* 🆕 [AI 심사위원 등장 영역] */}
      <div
        style={{
          position: 'absolute', top: '55%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          transition: 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          opacity: showAITeacher ? 1 : 0,
          scale: showAITeacher ? 1 : 0.5,
        }}
      >
        {/* 🚨 수정: 크기를 600px로 더욱 확대 (초대형) */}
        <img
          src={aiTeacherLogo}
          alt="AI Teacher"
          style={{ width: '600px', height: 'auto', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))' }}
        />
      </div>

      {/* 🃏 카드 무대 */}
      <div
        style={{
          position: 'relative', width: '600px', height: '400px', perspective: '1000px', zIndex: 10,
          marginTop: '140px',
          transition: 'all 1s',
          opacity: outroStep > 0 ? 0.3 : 1,
          filter: outroStep > 0 ? 'blur(4px)' : 'none'
        }}
      >
        {cardsData.map((card, index) => {
          const shufflePos = getShufflePos(index);
          const col = index % 4; const row = Math.floor(index / 4);
          const gridX = (col - 1.5) * 150; const gridY = (row - 0.5) * 220;
          let x = 0, y = 0, rotate = 0, opacity = 1;
          if (isShuffling) { x = shufflePos.x; y = shufflePos.y; rotate = shufflePos.r; }
          else if (isDealt) { if (card.isTarget) { x = gridX; y = gridY; rotate = 0; } else { x = 0; y = 0; opacity = 0; } }
          const isFlipped = card.isTarget && index < visibleCount;
          return (
            <div key={card.id} style={{ position: 'absolute', top: '50%', left: '50%', width: '120px', height: '180px', marginTop: '-90px', marginLeft: '-60px', transition: isShuffling ? 'transform 0.1s linear' : 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s', transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)`, opacity: opacity, zIndex: card.isTarget ? 100 + index : index }}>
              <div style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', transition: 'transform 0.5s', transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)', boxShadow: '2px 4px 8px rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', border: '4px solid white', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)' }}><img src={card.frontImage} alt="front" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)' }}><img src={card.backImage} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CardShufflePhase;
