import { useEffect } from 'react';

interface Props {
  onFinish?: () => void;
}

const JudgeResultPhase = ({ onFinish }: Props) => {
  useEffect(() => {
    // 3초 뒤에 다음 페이즈로 넘어감 (임시 로직)
    const timer = setTimeout(() => {
      onFinish?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-bold mb-4">🃏 AI판사 결과</h1>
      <p>AI판사 결과 페이즈 (3초 뒤 넘어감)</p>
    </div>
  );
};

export default JudgeResultPhase;