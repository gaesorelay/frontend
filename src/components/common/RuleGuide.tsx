import { useState } from 'react';

import ruleImg1 from '@/assets/rule/rule_step1.png'; // 📌 룰 이미지 1 (시작)
import ruleImg2 from '@/assets/rule/rule_step2.png'; // 📌 룰 이미지 2 (진행)
import ruleImg3 from '@/assets/rule/rule_step3.png'; // 📌 룰 이미지 3 (결과)
import ruleImg4 from '@/assets/rule/rule_step4.png'; // 📌 룰 이미지 3 (결과)
import ruleImg5 from '@/assets/rule/rule_step5.png'; // 📌 룰 이미지 3 (결과)

// 📝 룰 데이터 정의
const RULE_DATA = [
  {
    step: 1,
    title: '팀 선정',
    desc: '관객들 중에서 무대에 오를 개를 뽑아\n두 팀을 구성하고 게임을 시작하세요!',
    image: ruleImg1,
  },
  {
    step: 2,
    title: '스토리 작성',
    desc: '순서에 따라 이미지를 보고\n개소리같은 이야기를 작성하세요!',
    image: ruleImg2,
  },
  {
    step: 3,
    title: '릴레이 스토리',
    desc: '팀원들의 이야기를 이어서\n개소리 릴레이를 완성하세요!',
    image: ruleImg3,
  },
  {
    step: 4,
    title: '투표',
    desc: '관객들은 각 팀의 완성된 스토리 중\n더 재미있는 이야기에 투표하세요!',
    image: ruleImg4,
  },
  {
    step: 5,
    title: 'AI 심사',
    desc: 'AI 심사위원들의 평가가 투표에 더해져\n최종 승패가 결정됩니다!',
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

  // 🎨 스타일 (투명 배경 + 도트 네비게이션)
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const, // 세로 배치 (컨텐츠 + 도트)
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      maxWidth: '450px', // 크기 확대 (350 -> 450)
      position: 'relative' as const,
    },
    // 카드 박스 스타일 제거 (투명하게)
    contentBox: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      textAlign: 'center' as const,
      marginBottom: '20px',
    },
    titleBadge: {
      // 뱃지 스타일은 유지하되 배경에 어울리게 조정
      background: 'rgba(255, 255, 255, 0.5)', // 반투명 흰색
      border: '3px solid #333',
      borderRadius: '25px',
      padding: '8px 20px',
      fontSize: '22px', // 폰트 확대 (18 -> 22)
      fontWeight: 'bold',
      marginBottom: '25px',
      color: '#333',
    },
    imageArea: {
      width: '200px', // 이미지 확대 (140 -> 200)
      height: '200px',
      marginBottom: '25px',
      // 이미지 테두리도 조금 더 자연스럽게? 혹은 유지
      border: '4px solid #333',
      borderRadius: '50%', // 원형으로 변경해볼까요? (선택사항, 일단 유지하되 둥글게)
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'white', // 이미지는 잘 보여야 하니 흰 배경 유지
      boxShadow: '4px 4px 0px rgba(0,0,0,0.1)',
    },
    ruleImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
    },
    desc: {
      fontSize: '20px', // 글자 확대 (17 -> 20)
      lineHeight: '1.6',
      color: '#333', // 배경이 밝으므로 진한 글씨
      whiteSpace: 'pre-line' as const,
      wordBreak: 'keep-all' as const, // 단어 단위 줄바꿈 유지
      fontWeight: 'bold',
      textShadow: '1px 1px 0px rgba(255,255,255,0.5)', // 가독성 확보
      minHeight: '80px',
    },
    // 도트 네비게이션 컨테이너
    dotsContainer: {
      display: 'flex',
      gap: '0px',
      marginTop: '15px',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.contentBox}>
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
      </div>

      {/* 도트 네비게이션 */}
      <div style={styles.dotsContainer}>
        {RULE_DATA.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIdx(idx)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '12px', // 히트 영역 대폭 확대 (터치/클릭 용이)
              outline: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={`${idx + 1}단계`}
          >
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: '3px solid #333',
                background: currentIdx === idx ? '#333' : 'white',
                transform: currentIdx === idx ? 'scale(1.2)' : 'scale(1)',
                transition: 'all 0.2s',
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
