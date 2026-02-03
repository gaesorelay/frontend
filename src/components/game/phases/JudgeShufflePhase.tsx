import { useEffect, useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useGameStore } from '@/store/useGameStore'; // ⭐️ Store
import { getJudgeImage } from '@/lib/judgeMapper'; // ⭐️ Mapper
// 🖼️ [배경 이미지]
import bgImg from '@/assets/background.png';
import cardLogo1 from '@/assets/logo/cardlogo1.png';
import cardLogo2 from '@/assets/logo/cardlogo2.png';
import cardLogo3 from '@/assets/logo/cardlogo3.png';

// ✨ [로고 이미지]
import titleLogo from '@/assets/logo/judgelogo1.png';
import finishLogo from '@/assets/logo/judgelogo2.png';

// 🛠️ [심사위원 전체 데이터 (ID 1~12)]
// 이미지는 Mapper로 가져오므로, 여기선 이름만 정의하면 됩니다.
const ALL_JUDGES = [
  { id: 1, name: '개소리 미식가 멍성재', persona: '저는 완결성과 창의성을 중요하게 생각하걸랑요.' },
  {
    id: 2,
    name: '침소리 성급맨',
    persona: '이런 말씀을 드리고 싶어요. 말이 안돼도 뻔뻔하게 밀고나가라.',
  },
  {
    id: 3,
    name: '과몰입 F 공감이',
    persona: '저는 짠하고 눈물나는 이야기에 너무 약한거 같아요. 흐어엉 ㅠㅠ',
  },
  {
    id: 4,
    name: 'AI 판사 알빠노',
    persona: '팩트만 말하십시오. 말이 안된다면 무조건 감점하겠습니다.',
  },
  {
    id: 5,
    name: '도파민 쇼츠왕',
    persona: '진지충은 OUT! 도파민 터지는 최고의 병맛 전개를 보여주라고.',
  },
  {
    id: 6,
    name: '낭만주의자 줄리엣',
    persona: '애틋하고 감동적인 사랑이야기야말로 최고라고 생각해요. 사랑이 우주를 구한다!',
  },
  {
    id: 7,
    name: '음모론자 일루미',
    persona: '달 뒷면의 비밀기지, 일루미나티의 계획. 세계의 진실을 나에게 알려줘.',
  },
  {
    id: 8,
    name: '칠 가이 (Chill Guy)',
    persona: '사람들이 심사기준이 뭐냐고 물어보지만 귀찮은게 싫을 뿐일 때',
  },
  {
    id: 9,
    name: '암행어사 조나단',
    persona: '제 K-소울을 제대로 건드려서, 제 하얀 이가 보일 정도로 활짝 웃게 만들면 합격입니다!',
  },
  { id: 10, name: '퍼포먼스 카니', persona: '아주 매끈매끈한 글을 쓰시면 만점 드릴게요!' },
  {
    id: 11,
    name: '팩트 폭격기 조',
    persona: '난 개연성 없는 글은 취급 안해. 날 설득시키려는 노력을 보이라고.',
  },
  {
    id: 12,
    name: '긍정왕 운동현',
    persona: '심사 스트레스 많이 받을거야. 그런 스트레스 필요해. 도움 많이 된다.',
  },
];
const BARK_SOUNDS = [
  '월!',
  '멍!',
  '왈왈!',
  'Grrr...',
  '컹!',
  '깨갱!',
  '개소리!',
  'Woof!',
  '으르렁',
  '왕!',
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const JudgeShufflePhase = () => {
  // 1. ⭐️ Store에서 당첨된 심사위원 데이터 가져오기
  const { roundData } = useGameStore();

  // 2. ⭐️ 당첨자 명단 확정 (서버 데이터 사용)
  const targetWinners = useMemo(() => {
    // 서버에서 온 데이터가 없으면 fallback (1,2,3번)
    // roundData.judgeIds는 [{id, name, persona}, ...] 객체 배열임
    if (roundData?.judgeIds && roundData.judgeIds.length > 0) {
      return roundData.judgeIds.map((j: any) => {
        // ID로 로컬 데이터(Persona 등) 찾기
        const localInfo = ALL_JUDGES.find((aj) => aj.id === j.id);
        return {
          id: j.id,
          name: j.name,
          persona: localInfo?.persona || '멍멍!', // 멘트 없으면 기본값
          image: getJudgeImage(j.id),
        };
      });
    }

    // Fallback: 랜덤 3명
    return ALL_JUDGES.slice(0, 3).map((j) => ({ ...j, image: getJudgeImage(j.id) }));
  }, [roundData]);

  // 3. ⭐️ 전체 풀(Pool) 구성 (화면에 보여질 12명)
  const displayPool = useMemo(() => {
    return ALL_JUDGES.map((j) => ({
      ...j,
      image: getJudgeImage(j.id),
    }));
  }, []);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const [pickedIds, setPickedIds] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // 🆕 [소개 모드 상태]
  const [introStep, setIntroStep] = useState(-1); // -1: 셔플중, 0~2: 각 심사위원 소개
  const [showIntroUI, setShowIntroUI] = useState(false); // 그리드 숨기고 소개화면 띄우기

  const isRunningRef = useRef(false);
  const [mounted, setMounted] = useState(false);

  const [floatingTexts, setFloatingTexts] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    const texts = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      text: BARK_SOUNDS[Math.floor(Math.random() * BARK_SOUNDS.length)],
      left: Math.random() * 90 + 5 + '%',
      duration: Math.random() * 5 + 5 + 's',
      delay: Math.random() * 5 + 's',
      size: Math.random() * 1.5 + 1 + 'rem',
      rotation: Math.random() * 40 - 20,
    }));
    setFloatingTexts(texts);
  }, []);

  useEffect(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    const runSequence = async () => {
      await wait(800);

      let speed = 50;
      const totalSpins = 35;

      for (let i = 0; i < totalSpins; i++) {
        const pool = displayPool.filter((j) => !pickedIds.includes(j.id));

        if (pool.length > 0) {
          const randomIdx = Math.floor(Math.random() * pool.length);
          setHighlightId(pool[randomIdx].id);
        }

        if (i > totalSpins - 10) speed += 15;
        if (i > totalSpins - 5) speed += 30;

        await wait(speed);
      }

      for (let round = 0; round < targetWinners.length; round++) {
        const winner = targetWinners[round];

        setHighlightId(winner.id);
        setPickedIds((prev) => [...prev, winner.id]);

        await wait(1200);
      }

      // [3단계] 종료 처리
      setHighlightId(null);
      setIsFinished(true);
      // [3단계] ⭐️ 소개 시퀀스 시작 (그리드 사라지고 3명만 등장)
      await wait(1000);
      setShowIntroUI(true); // 화면 전환

      // 1명씩 포커스 (0 -> 1 -> 2)
      for (let i = 0; i < targetWinners.length; i++) {
        setIntroStep(i);
        await wait(3500); // 멘트 읽을 시간
      }

      setIntroStep(3); // 소개 끝 (모두 평범하게 보임 or 다음 단계 이동 신호)
    };

    runSequence();
  }, [targetWinners, displayPool]);

  if (!mounted) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 50, // 9999 -> 50 (헤더보다 낮아야 함)
        backgroundImage: `url(${bgImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <style>{`
        /* 결과 로고 쾅! 효과 */
        @keyframes slam {
          0% { transform: scale(3) rotate(-20deg); opacity: 0; }
          50% { transform: scale(0.9) rotate(-10deg); opacity: 1; }
          75% { transform: scale(1.1) rotate(-12deg); }
          100% { transform: scale(1) rotate(-12deg); }
        }

        /* ✨ [NEW] 진행 중 로고 "두구두구" 떨리는 효과 */
        @keyframes dugu-dugu {
          0% { transform: translate(0, 0); }
          10% { transform: translate(-3px, -3px) rotate(-1deg); }
          20% { transform: translate(3px, 3px) rotate(1deg); }
          30% { transform: translate(-3px, 3px) rotate(-1deg); }
          40% { transform: translate(3px, -3px) rotate(1deg); }
          50% { transform: translate(-2px, 0) rotate(0); }
          60% { transform: translate(2px, 0) rotate(0); }
          70% { transform: translate(0, 2px) rotate(0); }
          80% { transform: translate(0, -2px) rotate(0); }
          90% { transform: translate(-1px, 1px) rotate(0); }
          100% { transform: translate(0, 0); }
        }

        @keyframes float-up {
          0% { transform: translateY(110vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.4; }
          100% { transform: translateY(-10vh) rotate(360deg); opacity: 0; }
        }
      `}</style>

      {/* 배경 둥둥 텍스트 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        {floatingTexts.map((item) => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              left: item.left,
              fontSize: item.size,
              color: '#78716c',
              fontWeight: 'bold',
              opacity: 0,
              animation: `float-up ${item.duration} linear infinite`,
              animationDelay: item.delay,
              whiteSpace: 'nowrap',
            }}
          >
            {item.text}
          </div>
        ))}
      </div>

      {/* 로고 영역 */}
      {/* 로고 & 타이틀 영역 */}
      <div
        style={{
          marginBottom: '20px',
          textAlign: 'center',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: showIntroUI ? 0 : 1,
        }}
      >
        <img
          src={isFinished ? finishLogo : titleLogo}
          alt="Judge Logo"
          style={{
            // 1. 크기 설정 (기존 동일)
            width: isFinished ? '900px' : '900px',
            maxWidth: isFinished ? '80%' : '95%',
            height: 'auto',

            // ▼ 위쪽 여백 (Top)
            marginTop: isFinished
              ? '-100px' // 🟢 로고 2 (완료)일 때: 덜 올라감
              : '-150px', // 🔵 로고 1 (진행)일 때: 많이 올라감

            // ▼ 아래쪽 여백 (Bottom)
            marginBottom: isFinished
              ? '-200px' // 🟢 로고 2 (완료)일 때: 그리드랑 좀 떨어짐
              : '-175px', // 🔵 로고 1 (진행)일 때: 그리드랑 딱 붙음

            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))',

            // 3. 애니메이션 (기존 동일)
            animation: isFinished
              ? 'slam 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
              : 'dugu-dugu 0.2s linear infinite',
          }}
        />
      </div>

      {/* Grid */}
      {!showIntroUI && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: '20px',
            width: '90%',
            maxWidth: '800px',
            zIndex: 10,
          }}
        >
          {displayPool.map((judge) => {
            const isPicked = pickedIds.includes(judge.id);
            const isHighlight = highlightId === judge.id;
            const isLoser = isFinished && !isPicked;

            let cardStyle: React.CSSProperties = {
              position: 'relative',
              borderRadius: '15px',
              overflow: 'hidden',
              backgroundColor: 'transparent',
              transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
              opacity: 1,
              transform: 'scale(1)',
              border: '3px solid #e5e7eb',
            };

            if (isLoser) {
              cardStyle = {
                ...cardStyle,
                opacity: 0.3,
                filter: 'grayscale(100%)',
                transform: 'scale(0.95)',
              };
            } else if (isPicked) {
              cardStyle = {
                ...cardStyle,
                border: '5px solid #ef4444',
                boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
                transform: 'scale(1.05)',
                zIndex: 20,
              };
            } else if (isHighlight) {
              cardStyle = {
                ...cardStyle,
                border: '5px solid #fbbf24',
                boxShadow: '0 0 10px rgba(251, 191, 36, 0.4)',
                transform: 'scale(1.02)',
                zIndex: 10,
              };
            }

            return (
              <div key={judge.id} style={cardStyle}>
                <img
                  src={judge.image}
                  alt={judge.name}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />

                {isPicked && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 30,
                      animation: 'slam 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                    }}
                  >
                    <div
                      style={{
                        border: '5px solid #dc2626',
                        color: '#dc2626',
                        fontFamily: '"Black Han Sans", sans-serif',
                        fontSize: '1.8rem',
                        fontWeight: '900',
                        padding: '5px 15px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        boxShadow: '5px 5px 10px rgba(0,0,0,0.2)',
                        transform: 'rotate(-12deg)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      당첨!
                    </div>
                  </div>
                )}

                {isHighlight && !isPicked && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(251, 191, 36, 0.2)',
                      zIndex: 20,
                    }}
                  ></div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ⭐️ B. 소개 모드 (showIntroUI가 true일 때 보임) */}
      {showIntroUI && (
        <>
          {/* 1. 배경 텍스트 애니메이션 (1 -> 2 -> 3) */}
          <div
            style={{
              position: 'absolute',
              top: '5%', // 카드 셔플 로고 위치와 통일
              width: '100%',
              height: '300px', // 여유 공간 확보
              display: 'flex',
              justifyContent: 'center',
              zIndex: 40,
              pointerEvents: 'none',
              // ✨ 수정됨: 등장 애니메이션 추가
              animation: 'fade-in-up 0.8s ease-out forwards',
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
              <img
                src={cardLogo1}
                alt="1"
                style={{
                  position: 'absolute',
                  left: '10%', // 심사위원 1번 위치 근처
                  top: '20px',
                  width: '450px',
                  filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))',
                  transition: 'all 0.5s',
                  opacity: introStep >= 0 ? 1 : 0,
                  transform: introStep >= 0 ? 'scale(1)' : 'scale(0.8)',
                }}
              />
              <img
                src={cardLogo2}
                alt="2"
                style={{
                  position: 'absolute',
                  left: '28%', // 심사위원 2번 위치 근처
                  top: '85px',
                  width: '450px',
                  filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))',
                  transition: 'all 0.5s',
                  opacity: introStep >= 1 ? 1 : 0,
                  transform: introStep >= 1 ? 'scale(1)' : 'scale(0.8)',
                }}
              />
              <img
                src={cardLogo3}
                alt="3"
                style={{
                  position: 'absolute',
                  left: '53%', // 심사위원 3번 위치 근처
                  top: '160px',
                  width: '500px',
                  filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))',
                  transition: 'all 0.5s',
                  opacity: introStep >= 2 ? 1 : 0,
                  transform: introStep >= 2 ? 'scale(1.1)' : 'scale(0.8)',
                }}
              />
            </div>
          </div>

          {/* 2. 당첨된 심사위원 3명 카드 리스트 */}
          <div
            style={{
              display: 'flex',
              gap: '60px',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              zIndex: 100,
              marginTop: '180px', // 텍스트 로고와 겹치지 않게 살짝 내림
            }}
          >
            {targetWinners.map((judge, index) => {
              const isFocused = introStep === index;
              // 다른 심사위원 소개 중일 때는 약간 흐리게 처리 (집중도 향상)
              const isDimmed = introStep !== -1 && introStep < 3 && !isFocused;

              return (
                <div
                  key={judge.id}
                  style={{
                    position: 'relative',
                    width: '240px',
                    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: isFocused ? 'scale(1.3) translateY(-20px)' : 'scale(1)',
                    opacity: isDimmed ? 0.4 : 1,
                    filter: isDimmed ? 'grayscale(50%) blur(1px)' : 'none',
                    zIndex: isFocused ? 200 : 100,
                  }}
                >
                  {/* 심사위원 이미지 프레임 */}
                  <div
                    style={{
                      borderRadius: '20px',
                      border: '5px solid #333',
                      overflow: 'hidden',
                      backgroundColor: 'white',
                      boxShadow: '10px 10px 0 rgba(0,0,0,0.2)',
                    }}
                  >
                    <img
                      src={judge.image}
                      alt={judge.name}
                      style={{ width: '100%', display: 'block' }}
                    />
                  </div>

                  {/* 이름표 */}
                  <div
                    style={{
                      marginTop: '15px',
                      textAlign: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: '#333',
                      textShadow: '2px 2px 0 white',
                      backgroundColor: 'rgba(255,255,255,0.6)',
                      borderRadius: '10px',
                      padding: '2px 0',
                    }}
                  >
                    {judge.name}
                  </div>

                  {/* 💬 말풍선 (해당 순서일 때만 등장) */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-70px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#333',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '30px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                      opacity: isFocused ? 1 : 0,

                      // 말풍선 팝업 애니메이션
                      animation: isFocused
                        ? 'pop-bubble 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                        : 'none',
                      pointerEvents: 'none',
                    }}
                  >
                    {judge.persona}
                    {/* 말풍선 꼬리 */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%) rotate(45deg)',
                        width: '15px',
                        height: '15px',
                        backgroundColor: '#333',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default JudgeShufflePhase;
