import { useEffect, useState } from 'react';

// 🛠️ [Mock] 나중에 서버에서 받아올 이미지들
const MOCK_CARDS = [
  '/images/card1.png', '/images/card2.png', '/images/card3.png', 
  '/images/card4.png', '/images/card5.png', '/images/card6.png',
  '/images/card7.png', '/images/card8.png'
];

interface Props {
  onFinish: () => void; // 애니메이션 끝나면 호출할 함수 (부모가 내려줌)
}

const CardShufflePhase = ({ onFinish }: Props) => {
  const [showFront, setShowFront] = useState(false); // 처음엔 뒷면

  useEffect(() => {
    // 1. 애니메이션 시나리오 (프론트 맘대로 연출)
    
    // 2초 뒤에 카드 뒤집기 (공개)
    const flipTimer = setTimeout(() => {
      setShowFront(true);
    }, 2000);

    // 5초 뒤에 다음 단계(심사위원 선정)로 넘어가기 (서버 신호 대용)
    const finishTimer = setTimeout(() => {
      onFinish(); 
    }, 5000);

    return () => {
      clearTimeout(flipTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/80">
      <h1 className="text-white text-3xl font-bold mb-8 animate-bounce">
        {showFront ? "이 카드들로 이야기를 만들어주세요!" : "카드를 섞고 있습니다..."}
      </h1>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-4 gap-4">
        {MOCK_CARDS.map((imgSrc, index) => (
          <div key={index} className="w-32 h-48 bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-500 hover:scale-110">
            {showFront ? (
              // 🅰️ 앞면 (변수 처리될 부분)
              <img src={imgSrc} alt="카드" className="w-full h-full object-cover" />
            ) : (
              // 🅱️ 뒷면 (공통 디자인)
              <div className="w-full h-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-4xl">?</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardShufflePhase;