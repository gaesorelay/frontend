import { useState } from 'react';

// 🖼️ 이미지 에셋 (실제 경로에 맞게 수정해주세요)
// 없으면 임시로 로고나 다른 이미지를 import 하셔도 됩니다.
import leftArrowImg from '@/assets/logo/leftarrow.png';
import rightArrowImg from '@/assets/logo/rightarrow.png';
import ruleImg1 from '@/assets/rule/rule_step1.png'; // 📌 룰 이미지 1 (시작)
import ruleImg2 from '@/assets/rule/rule_step1.png'; // 📌 룰 이미지 2 (진행)
import ruleImg3 from '@/assets/rule/rule_step1.png'; // 📌 룰 이미지 3 (결과)
import ruleImg4 from '@/assets/rule/rule_step1.png'; // 📌 룰 이미지 3 (결과)
import ruleImg5 from '@/assets/rule/rule_step1.png'; // 📌 룰 이미지 3 (결과)

// 📝 룰 데이터 정의
const RULE_DATA = [
  {
    step: 1,
    title: '팀 선정',
    desc: '관객들중에서 무대에 오를 개를 뽑아 두 팀을 구성하고 게임을 시작하세요!',
    image: ruleImg1,
  },
  {
    step: 2,
    title: '스토리 작성',
    desc: '순서에 따라 이미지를 보고 개소리같은 이야기를 작성하세요!',
    image: ruleImg2,
  },
  {
    step: 3,
    title: '릴레이 스토리',
    desc: '팀원들의 이야기를 이어서 개소리 릴레이를 완성하세요!',
    image: ruleImg3,
  },
  {
    step: 4,
    title: '투표',
    desc: '관객들은 각 팀의 완성된 스토리 중 더 재미있는 이야기에 투표하세요!',
    image: ruleImg4,
  },
  {
    step: 5,
    title: 'AI 심사',
    desc: 'AI 심사위원들의 평가가 투표에 더해져 최종 승패가 결정됩니다!',
    image: ruleImg5,
  },
];

export default function GameRuleGuide() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const totalRules = RULE_DATA.length;
  const currentRule = RULE_DATA[currentIdx];

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev === 0 ? totalRules - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev === totalRules - 1 ? 0 : prev + 1));
  };

  // 🎨 스타일 (Setup.tsx와 톤앤매너 통일)
  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      // Setup 페이지 레이아웃에 맞춰 크기 조정
      width: '100%',
      maxWidth: '400px',
    },
    cardBox: {
      flex: 1,
      background: 'white',
      padding: '20px',
      boxSizing: 'border-box' as const,
      boxShadow: '6px 6px 0px rgba(0,0,0,0.08)',
      border: '3px solid #333',
      // 약간 다른 둥근 모서리로 차별화
      borderRadius: '15px 15px 15px 15px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      textAlign: 'center' as const,
      minHeight: '300px', // 높이 고정 (내용 바뀔 때 흔들림 방지)
    },
    titleBadge: {
      background: '#FFD700', // 노란색 포인트
      border: '2px solid #333',
      borderRadius: '20px',
      padding: '5px 15px',
      fontSize: '16px',
      fontWeight: 'bold',
      marginBottom: '15px',
      boxShadow: '2px 2px 0px rgba(0,0,0,0.1)',
    },
    imageArea: {
      width: '120px',
      height: '120px',
      marginBottom: '15px',
      border: '2px solid #333',
      borderRadius: '10px',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9f9f9',
    },
    ruleImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
    },
    desc: {
      fontSize: '16px',
      lineHeight: '1.5',
      color: '#555',
      whiteSpace: 'pre-line' as const, // \n 줄바꿈 적용
      fontWeight: 500,
    },
    arrowBtn: {
      background: 'none',
      border: 'none',
      outline: 'none',
      cursor: 'pointer',
      padding: '0',
      transition: 'transform 0.1s',
    },
    arrowIcon: {
      width: '50px', // 메인보다 조금 작게
      height: '50px',
      objectFit: 'contain' as const,
      filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.2))',
    },
    pageIndicator: {
      marginTop: '10px',
      fontSize: '12px',
      color: '#999',
      fontWeight: 'bold',
    },
  };

  return (
    <div style={styles.container}>
      {/* 왼쪽 화살표 */}
      <button
        onClick={handlePrev}
        style={styles.arrowBtn}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.9)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <img src={leftArrowImg} alt="이전" style={styles.arrowIcon} />
      </button>

      {/* 가운데 카드 */}
      <div style={styles.cardBox}>
        <div style={styles.titleBadge}>
          Step {currentRule.step}. {currentRule.title}
        </div>

        <div style={styles.imageArea}>
          {currentRule.image ? (
            <img src={currentRule.image} alt={currentRule.title} style={styles.ruleImage} />
          ) : (
            <span style={{ fontSize: '10px' }}>No Image</span>
          )}
        </div>

        <div style={styles.desc}>{currentRule.desc}</div>

        <div style={styles.pageIndicator}>
          {currentIdx + 1} / {totalRules}
        </div>
      </div>

      {/* 오른쪽 화살표 */}
      <button
        onClick={handleNext}
        style={styles.arrowBtn}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.9)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <img src={rightArrowImg} alt="다음" style={styles.arrowIcon} />
      </button>
    </div>
  );
}
