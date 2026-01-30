import { useEffect, useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';

// 🖼️ [이미지 Import]
import judgeImg1 from '@/assets/judge/profile/judge1.png';
import judgeImg2 from '@/assets/judge/profile/judge2.png';
import judgeImg3 from '@/assets/judge/profile/judge3.png';
import judgeImg4 from '@/assets/judge/profile/judge4.png';
import judgeImg5 from '@/assets/judge/profile/judge5.png';
import judgeImg6 from '@/assets/judge/profile/judge6.png';
import judgeImg7 from '@/assets/judge/profile/judge7.png';
import judgeImg8 from '@/assets/judge/profile/judge8.png';
import judgeImg9 from '@/assets/judge/profile/judge9.png';
import judgeImg10 from '@/assets/judge/profile/judge10.png';
import judgeImg11 from '@/assets/judge/profile/judge11.png';
import judgeImg12 from '@/assets/judge/profile/judge12.png';

// 🖼️ [배경 이미지]
import bgImg from '@/assets/background.png';

// ✨ [로고 이미지]
import titleLogo from '@/assets/logo/judgelogo1.png';
import finishLogo from '@/assets/logo/judgelogo2.png';

// 🛠️ [데이터]
const JUDGES_POOL = [
    { id: 1, name: '개소리 미식가 멍성재', image: judgeImg1 },
    { id: 2, name: '과몰입 F 공감이', image: judgeImg2 },
    { id: 3, name: '낭만주의자 줄리엣', image: judgeImg3 },
    { id: 4, name: '음모론자 일루미', image: judgeImg4 },
    { id: 5, name: '칠 가이 (Chill Guy)', image: judgeImg5 },
    { id: 6, name: '팩트 폭격기 조', image: judgeImg6 },
    { id: 7, name: '침소리 성급맨', image: judgeImg7 },
    { id: 8, name: 'AI 판사 알빠노', image: judgeImg8 },
    { id: 9, name: '도파민 쇼츠왕', image: judgeImg9 },
    { id: 10, name: 'K-암행어사 조나단', image: judgeImg10 },
    { id: 11, name: '퍼포먼스 카니', image: judgeImg11 },
    { id: 12, name: '긍정왕 운동현', image: judgeImg12 },
];

const BARK_SOUNDS = ["월!", "멍!", "왈왈!", "Grrr...", "컹!", "깨갱!", "개소리!", "Woof!", "으르렁", "왕!"];

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface Props {
    onFinish?: () => void;
}

const JudgeShufflePhase = ({ onFinish }: Props) => {
    const targetWinners = useMemo(() => {
        return [...JUDGES_POOL].sort(() => 0.5 - Math.random()).slice(0, 3);
    }, []);

    const [highlightId, setHighlightId] = useState<number | null>(null);
    const [pickedIds, setPickedIds] = useState<number[]>([]);
    const [isFinished, setIsFinished] = useState(false);
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
            rotation: Math.random() * 40 - 20
        }));
        setFloatingTexts(texts);
    }, []);

    useEffect(() => {
        if (isRunningRef.current) return;
        isRunningRef.current = true;

        const runSequence = async () => {
            await wait(800);

            for (let round = 0; round < 3; round++) {
                const winner = targetWinners[round];
                let speed = 50;
                const spinCount = 20 + round * 5;

                for (let i = 0; i < spinCount; i++) {
                    const pool = JUDGES_POOL.filter(j => !pickedIds.includes(j.id) && !targetWinners.slice(0, round).map(w => w.id).includes(j.id));
                    if (pool.length > 0) {
                        const randomIdx = Math.floor(Math.random() * pool.length);
                        setHighlightId(pool[randomIdx].id);
                    }
                    if (i > spinCount - 5) speed += 50;
                    else if (i > spinCount - 10) speed += 20;
                    await wait(speed);
                }

                setHighlightId(winner.id);
                setPickedIds(prev => [...prev, winner.id]);
                await wait(1000);
            }

            setHighlightId(null);
            setIsFinished(true);
            await wait(2000);
            if (onFinish) onFinish();
        };

        runSequence();
    }, [targetWinners, onFinish]);

    if (!mounted) return null;

    return (
        <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            zIndex: 50, // 9999 -> 50 (헤더보다 낮아야 함)
            backgroundImage: `url(${bgImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Gaegu", cursive',
            margin: 0, padding: 0,
            overflow: 'hidden'
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&family=Black+Han+Sans&display=swap');
        
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
            <div style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
                overflow: 'hidden'
            }}>
                {floatingTexts.map((item) => (
                    <div key={item.id} style={{
                        position: 'absolute',
                        left: item.left,
                        fontSize: item.size,
                        color: '#78716c',
                        fontWeight: 'bold',
                        opacity: 0,
                        animation: `float-up ${item.duration} linear infinite`,
                        animationDelay: item.delay,
                        whiteSpace: 'nowrap'
                    }}>
                        {item.text}
                    </div>
                ))}
            </div>

            {/* 로고 영역 */}
            {/* 로고 & 타이틀 영역 */}
            <div style={{ marginBottom: '20px', textAlign: 'center', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                            ? '-100px'   // 🟢 로고 2 (완료)일 때: 덜 올라감
                            : '-150px', // 🔵 로고 1 (진행)일 때: 많이 올라감

                        // ▼ 아래쪽 여백 (Bottom)
                        marginBottom: isFinished
                            ? '-150px'   // 🟢 로고 2 (완료)일 때: 그리드랑 좀 떨어짐
                            : '-175px', // 🔵 로고 1 (진행)일 때: 그리드랑 딱 붙음

                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))',

                        // 3. 애니메이션 (기존 동일)
                        animation: isFinished
                            ? 'slam 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                            : 'dugu-dugu 0.2s linear infinite'
                    }}
                />
            </div>

            {/* Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: '16px',
                width: '90%', maxWidth: '800px',
                zIndex: 10
            }}>
                {JUDGES_POOL.map((judge) => {
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
                        cardStyle = { ...cardStyle, opacity: 0.3, filter: 'grayscale(100%)', transform: 'scale(0.95)' };
                    }
                    else if (isPicked) {
                        cardStyle = {
                            ...cardStyle,
                            border: '5px solid #ef4444',
                            boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
                            transform: 'scale(1.05)',
                            zIndex: 20
                        };
                    }
                    else if (isHighlight) {
                        cardStyle = {
                            ...cardStyle,
                            border: '5px solid #fbbf24',
                            boxShadow: '0 0 10px rgba(251, 191, 36, 0.4)',
                            transform: 'scale(1.02)',
                            zIndex: 10
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
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    zIndex: 30,
                                    animation: 'slam 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                                }}>
                                    <div style={{
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
                                        whiteSpace: 'nowrap'
                                    }}>
                                        당첨!
                                    </div>
                                </div>
                            )}

                            {isHighlight && !isPicked && (
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    backgroundColor: 'rgba(251, 191, 36, 0.2)',
                                    zIndex: 20
                                }}></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default JudgeShufflePhase;
