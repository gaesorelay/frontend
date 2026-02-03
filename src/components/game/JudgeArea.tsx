import React, { useState, useEffect } from 'react';
import { getJudgeImage } from '@/lib/judgeMapper';

interface JudgeAreaProps {
  judges: (number | { id: number; name: string; persona?: string })[];
}

// 심사위원별 고유 대사 (ID 1~12)
const JUDGE_SPECIFIC_MESSAGES: { [key: number]: string[] } = {
  1: ["익힘 정도가...", "의도가 뭐죠?", "보류하겠습니다", "채소가 덜 익었어", "이븐하지 않아요", "기대해보겠습니다"], // 멍성재
  2: ["음... 킹받네", "오히려 좋아", "이건 억까야", "침착하게 해", "꺼드럭거리네", "알다가도 모르겠네"], // 성급맨
  3: ["너무 슬퍼 ㅠㅠ", "눈물 나...", "감동이야...", "마음이 아파", "휴지 좀...", "어떡해 ㅠㅠ"], // 공감이
  4: ["논리적 오류", "팩트 체크 중", "감점 10점", "알빠노?", "데이터 부족", "시스템 오류"], // 알빠노
  5: ["지루해", "스킵", "도파민 부족", "더 자극적인 거!", "못 참겠다", "샤갈!"], // 쇼츠왕
  6: ["사랑스러워...", "심쿵!", "낭만 합격!", "너무 예쁘다", "사랑이 부족해", "로맨틱해..."], // 줄리엣
  7: ["이건 음모야", "삼각형이 보여", "그들이 보고 있어", "진실은 저 너머에", "외계인의 신호?", "수상해..."], // 일루미
  8: ["Not bad", "Chill 하네", "굳이?", "그냥 즐겨", "너무 애쓰지 마", "신경 안 써"], // 칠 가이
  9: ["예의가 없어!", "밥은 먹었니?", "유교 드래곤!", "K-예절 준수", "라떼는 말이야", "정신 차려!"], // 조나단
  10: ["Too 퍽퍽해", "매끈하지 않아", "I want smooth", "필(Feel)이 없어", "리듬이 깨져", "No No No"], // 카니
  11: ["그래서 뭐?", "현실성 제로", "꿈 깨세요", "납득 불가", "근거 가져와", "말이 안 돼"], // 독설가 조
  12: ["운동 많이 된다", "대화가 된다!", "스트레스!", "예술이다 예술", "좋은 스트레스야", "나이스!"], // 운동현
};

// 기본 공통 대사 (매핑 없는 경우)
const DEFAULT_MESSAGES = ["멍멍!", "왈왈!", "크르르...", "킁킁"];

const JudgeArea = ({ judges }: JudgeAreaProps) => {
  return (
    <div style={styles.judgeSection}>
      <div style={styles.titleContainer}>
        <span style={styles.titleText}>개소리 판결단</span>
      </div>

      <div style={styles.avatarList}>
        {judges && judges.length > 0 ? (
          judges.map((judge, index) => (
            <JudgeCard key={index} judge={judge} index={index} />
          ))
        ) : (
          <p style={styles.loadingText}>댕댕이 판사님들이 출근 중입니다...</p>
        )}
      </div>
    </div>
  );
};

// ⭐️ 심사위원 카드 개별 컴포넌트
const JudgeCard = ({ judge, index }: { judge: any, index: number }) => {
  const judgeId = typeof judge === 'number' ? judge : judge.id;
  const judgeName = typeof judge === 'object' ? judge.name : `심사위원 ${judgeId}`;

  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. 대사 풀(Pool) 가져오기
    const pool = JUDGE_SPECIFIC_MESSAGES[judgeId] || DEFAULT_MESSAGES;
    const getRandomMsg = () => pool[Math.floor(Math.random() * pool.length)];

    let timeoutId: ReturnType<typeof setTimeout>;

    const showMessageCycle = () => {
      // 1. 메시지 선택 및 표시
      setMessage(getRandomMsg());
      setIsVisible(true);

      // 2. 일정 시간(3~4초) 후 숨김
      timeoutId = setTimeout(() => {
        setIsVisible(false);

        // 3. 숨겨진 상태 유지 (2~5초) 후 다시 시작
        const hiddenDuration = 2000 + Math.random() * 3000;
        timeoutId = setTimeout(() => {
          showMessageCycle();
        }, hiddenDuration);

      }, 3000 + Math.random() * 1000); // 떠있는 시간
    };

    // 4. 최초 실행 딜레이 (0~3초)
    const initialDelay = Math.random() * 3000;
    const initialTimeout = setTimeout(() => {
      showMessageCycle();
    }, initialDelay);

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(timeoutId);
    };
  }, [judgeId]);

  return (
    <div
      style={{
        ...styles.avatarCard,
        transform: `rotate(${index % 2 === 0 ? -3 : 3}deg)`
      }}
    >
      <div style={styles.imageWrapper}>
        <img
          src={getJudgeImage(judgeId)}
          style={styles.judgeAvatar}
          alt={judgeName}
        />
        {/* isVisible 상태에 따라 투명도/크기 조절 */}
        <div style={{
          ...styles.speechBubble,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0.5)',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}>
          {message}
        </div>
      </div>
      <div style={styles.judgeBadge}>{judgeName}</div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  judgeSection: {
    borderRadius: '20px',
    padding: '20px 15px',
    position: 'relative',
    overflow: 'hidden',
  },
  titleContainer: {
    backgroundColor: '#FF5722', // 튀는 주황색
    padding: '5px 15px',
    border: '3px solid #000',
  },
  titleText: {
    fontWeight: '900',
    fontSize: '1.1rem',
    color: '#fff',
    textShadow: '2px 2px 0px #000',
  },
  avatarList: {
    display: 'flex',
    justifyContent: 'space-around',
    gap: '20px',
    marginTop: '30px',
  },
  avatarCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer',
  },
  imageWrapper: {
    position: 'relative',
    backgroundColor: '#fff',
    border: '3px solid #000',
    borderRadius: '15px',
    padding: '0 5px',
    marginBottom: '8px',
  },
  judgeAvatar: {
    height: '110px',
    width: '110px',
    objectFit: 'contain',
    display: 'block',
  },
  speechBubble: {
    position: 'absolute',
    top: '-30px',
    right: '-10px',
    backgroundColor: '#000',
    border: '2px solid #000',
    color: '#fff',
    fontSize: '0.75rem',
    padding: '6px 10px',
    borderRadius: '15px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    boxShadow: '2px 2px 0px rgba(0,0,0,0.2)',
    zIndex: 10,
    animation: 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  judgeBadge: {
    backgroundColor: '#fff',
    border: '2px solid #000',
    padding: '2px 8px',
    fontSize: '0.8rem',
    fontWeight: '800',
    boxShadow: '3px 3px 0px #000',
  },
  loadingText: {
    fontWeight: 'bold',
    fontStyle: 'italic',
    animation: 'blink 1s infinite',
  }
};

export default JudgeArea;