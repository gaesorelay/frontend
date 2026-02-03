import { useEffect, useState, useMemo } from 'react';
import paperBg from '@/assets/background.png';
import titleLogo from '@/assets/logo/carddistribute.png';
import dotImage from '@/assets/logo/dot.png';

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

const DECORATION_IMAGES = [bigHeart, bone, foot, heart, pencilBlue, pencilGreen, pencilRed, star];

import { useGameStore } from '@/store/useGameStore';
import { getCardImage } from '@/lib/cardMapper';

const TOTAL_CARDS = 40;
const TARGET_COUNT = 8;

const CardShufflePhase = () => {
  const [isShuffling, setIsShuffling] = useState(true);
  const [shuffleTick, setShuffleTick] = useState(0);
  const [isScattered, setIsScattered] = useState(false);
  const [isDealt, setIsDealt] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const [dotCount, setDotCount] = useState(1);
  const [outroStep, setOutroStep] = useState(0);

  // 🆕 그림 카드 줌인 효과를 위한 상태 추가
  const [focusedCardIndex, setFocusedCardIndex] = useState(-1);

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
    const targetCardIds =
      roundData?.cardIds && roundData.cardIds.length >= TARGET_COUNT
        ? roundData.cardIds
        : [1, 2, 3, 4, 5, 6, 7, 8];

    const totalAvatars = getTotalAvatars();
    const maxAvatarIndex = totalAvatars > 0 ? totalAvatars : 1;

    let targetJudgeIds: number[] = [];
    if (roundData?.judgeIds && roundData.judgeIds.length >= TARGET_COUNT) {
      targetJudgeIds = roundData.judgeIds;
    } else {
      const dogIndices = new Set<number>();
      while (dogIndices.size < TARGET_COUNT) {
        dogIndices.add(Math.floor(Math.random() * maxAvatarIndex) + 1);
      }
      targetJudgeIds = Array.from(dogIndices);
    }

    return Array.from({ length: TOTAL_CARDS }).map((_, i) => {
      const isTarget = i < TARGET_COUNT;
      let frontImage = '';
      let backImage = '';

      if (isTarget) {
        const cId = targetCardIds[i];
        const jId = targetJudgeIds[i];
        frontImage = getCardImage(cId);
        backImage = getAvatarSrc(jId);
      } else {
        frontImage = getCardImage(targetCardIds[i % TARGET_COUNT]);
        const randomDogId = Math.floor(Math.random() * maxAvatarIndex) + 1;
        backImage = getAvatarSrc(randomDogId);
      }

      const scatterX = (Math.random() - 0.5) * 1400;
      const scatterY = (Math.random() - 0.5) * 900;
      const scatterR = (Math.random() - 0.5) * 720;

      return {
        id: i,
        isTarget,
        frontImage,
        backImage,
        scatterPos: { x: scatterX, y: scatterY, r: scatterR },
      };
    });
  }, [roundData]);

  const getShufflePos = (index: number) => {
    if (!isShuffling) return { x: 0, y: 0, r: 0 };
    const randomSeed = index * shuffleTick * 999.99;
    const randomX = Math.sin(randomSeed) * 60;
    const randomY = Math.cos(randomSeed * 0.8) * 60;
    const randomR = Math.sin(randomSeed * 0.5) * 180;
    return { x: randomX, y: randomY, r: randomR };
  };

  useEffect(() => {
    const dotInterval = setInterval(() => setDotCount((prev) => (prev < 3 ? prev + 1 : 1)), 300);
    const shuffleInterval = setInterval(() => setShuffleTick((prev) => prev + 1), 50);

    const stopShuffleTimer = setTimeout(() => {
      clearInterval(shuffleInterval);
      setIsShuffling(false);
      setIsScattered(true);
    }, 2000);

    const dealTimer = setTimeout(() => setIsDealt(true), 3200);

    // 🆕 [그림 카드 줌인/줌아웃 효과 추가]
    const revealStartTimer = setTimeout(() => {
      clearInterval(dotInterval);
      setDotCount(0);
      for (let i = 0; i < TARGET_COUNT; i++) {
        setTimeout(() => {
          setVisibleCount((prev) => prev + 1); // 뒤집기
          setFocusedCardIndex(i); // 줌인!

          // 0.3초 뒤에 다시 줌아웃 (원래 크기로 복귀)
          setTimeout(() => {
            setFocusedCardIndex(-1);
          }, 300);
        }, i * 400); // 0.4초 간격
      }
    }, 4500);

    // 텍스트 등장 지연
    const outroTimer1 = setTimeout(() => setOutroStep(1), 8500);

    return () => {
      clearInterval(dotInterval);
      clearInterval(shuffleInterval);
      clearTimeout(stopShuffleTimer);
      clearTimeout(dealTimer);
      clearTimeout(revealStartTimer);
      clearTimeout(outroTimer1);
    };
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${paperBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 10,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.6 }}
      >
        {backgroundDecorations.map((deco) => (
          <img
            key={deco.id}
            src={deco.image}
            alt="deco"
            style={{
              position: 'absolute',
              top: deco.top,
              left: deco.left,
              transform: `translate(-50%, -50%) rotate(${deco.rotation}) scale(${deco.scale})`,
              width: '40px',
              height: 'auto',
              filter: 'grayscale(20%)',
            }}
          />
        ))}
      </div>

      {/* --- 상단 로고 --- */}
      <div
        style={{
          position: 'absolute',
          top: '5%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '2rem',
            zIndex: 20,
            transition: 'all 0.5s',
            transform: visibleCount > 0 ? 'scale(0.9) translateY(-20px)' : 'scale(1)',
            opacity: outroStep > 0 ? 0 : 1,
          }}
        >
          <img
            src={titleLogo}
            alt="Card Distribute"
            className="drop-shadow-md"
            style={{ width: '800px', height: 'auto', display: 'block', margin: 0 }}
          />
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginLeft: '20px',
              alignItems: 'center',
              marginTop: '60px',
            }}
          >
            {dotCount >= 1 && (
              <img
                src={dotImage}
                alt="dot"
                className="animate-bounce"
                style={{ width: '30px', height: '30px', animationDelay: '0ms' }}
              />
            )}
            {dotCount >= 2 && (
              <img
                src={dotImage}
                alt="dot"
                className="animate-bounce"
                style={{ width: '30px', height: '30px', animationDelay: '150ms' }}
              />
            )}
            {dotCount >= 3 && (
              <img
                src={dotImage}
                alt="dot"
                className="animate-bounce"
                style={{ width: '30px', height: '30px', animationDelay: '300ms' }}
              />
            )}
          </div>
        </div>

        {/* 1, 2, 3 로고 */}
        {outroStep > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '150px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
            </div>
          </div>
        )}
      </div>

      {/* 🃏 카드 무대 */}
      <div
        style={{
          position: 'relative',
          width: '600px',
          height: '400px',
          perspective: '1000px',
          zIndex: 10,
          marginTop: '140px',
          transition: 'all 1s',
          opacity: outroStep > 0 ? 0.2 : 1,
          filter: outroStep > 0 ? 'blur(5px)' : 'none',
        }}
      >
        {cardsData.map((card, index) => {
          const shufflePos = getShufflePos(index);
          const col = index % 4;
          const row = Math.floor(index / 4);
          const gridX = (col - 1.5) * 240;
          const gridY = (row - 0.5) * 180;

          let x = 0,
            y = 0,
            rotate = 0,
            opacity = 1,
            scale = 1;

          // 🆕 줌인/줌아웃 효과 (현재 포커스된 카드면 확대)
          const isFocused = index === focusedCardIndex;

          if (isDealt) {
            if (card.isTarget) {
              x = gridX;
              y = gridY;
              rotate = 0;
              // 기본 1.3배, 줌인 시 1.6배
              scale = isFocused ? 1.6 : 1.3;
            } else {
              x = card.scatterPos.x;
              y = card.scatterPos.y;
              rotate = card.scatterPos.r * 10;
              scale = 0;
              opacity = 0;
            }
          } else if (isScattered) {
            x = card.scatterPos.x;
            y = card.scatterPos.y;
            rotate = card.scatterPos.r * 2;
            scale = 1.0;
          } else if (isShuffling) {
            x = shufflePos.x;
            y = shufflePos.y;
            rotate = shufflePos.r;
          }

          const isFlipped = card.isTarget && index < visibleCount;

          return (
            <div
              key={card.id}
              style={{
                // 가로형 카드
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '180px',
                height: '120px',
                marginTop: '-60px',
                marginLeft: '-90px',
                // 줌인 될 때는 부드럽게 트랜지션
                transition: isShuffling
                  ? 'transform 0.05s linear'
                  : isDealt
                    ? 'transform 0.5s cubic-bezier(0.68, -0.6, 0.32, 1.6), opacity 0.5s'
                    : 'transform 1.0s cubic-bezier(0.1, 0.9, 0.2, 1.2)',
                transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`,
                opacity: opacity,
                // 줌인 된 카드는 맨 위로 올림
                zIndex: isFocused ? 500 : card.isTarget ? 100 + index : index,
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.5s',
                  transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)',
                  boxShadow: '2px 4px 8px rgba(0,0,0,0.2)',
                  borderRadius: '8px',
                }}
              >
                {/* 앞면 (그림) */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '4px solid white',
                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
                  }}
                >
                  <img
                    src={card.frontImage}
                    alt="front"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                {/* 뒷면 (강아지) - 중앙에 작게 배치 */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #ddd',
                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={card.backImage}
                    alt="cover"
                    style={{ width: '60%', height: '60%', objectFit: 'contain' }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CardShufflePhase;
