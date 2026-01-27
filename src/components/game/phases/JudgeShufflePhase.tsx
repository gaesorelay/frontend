import { useEffect, useState } from 'react';

// 🛠️ [Mock] 당첨될 심사위원 (서버가 정해준 사람)
const MOCK_JUDGE = {
  nickname: "엄격한 멍멍이",
  avatar: "🦁"
};

interface Props {
  onFinish: () => void;
}

const JudgeShufflePhase = ({ onFinish }: Props) => {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // 1. 막 돌아가는 애니메이션 (Roulette Effect) 구현 공간
    // ...

    // 2. 2초 뒤에 당첨자 공개!
    const revealTimer = setTimeout(() => {
      setIsRevealed(true);
    }, 2000);

    // 3. 5초 뒤에 글쓰기 단계로 이동
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 5000);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-purple-900">
      <h2 className="text-yellow-300 text-2xl font-bold mb-10">이번 라운드 심사위원은?</h2>

      <div className={`transition-all duration-700 ${isRevealed ? 'scale-125' : 'scale-100 animate-pulse'}`}>
        <div className="w-40 h-40 bg-white rounded-full border-8 border-yellow-400 flex items-center justify-center text-8xl shadow-2xl">
          {isRevealed ? MOCK_JUDGE.avatar : "❓"} {/* 👈 여기가 변수 자리 */}
        </div>
      </div>

      <div className="h-20 mt-4">
        {isRevealed && (
           <p className="text-white text-4xl font-black animate-fade-in-up">
             {MOCK_JUDGE.nickname} 님! {/* 👈 여기가 변수 자리 */}
           </p>
        )}
      </div>
    </div>
  );
};

export default JudgeShufflePhase;