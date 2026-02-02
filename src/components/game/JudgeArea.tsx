import React from 'react';
import { getJudgeImage } from '@/lib/judgeMapper';

interface JudgeAreaProps {
  judges: (number | { id: number; name: string; persona?: string })[];
}

const JudgeArea = ({ judges }: JudgeAreaProps) => {
  return (
    <div style={styles.judgeSection}>
      <div style={styles.titleContainer}>
        <span style={styles.titleText}>개소리 판결단</span>
      </div>

      <div style={styles.avatarList}>
        {judges && judges.length > 0 ? (
          judges.map((judge, index) => {
            const judgeId = typeof judge === 'number' ? judge : judge.id;
            const judgeName = typeof judge === 'object' ? judge.name : `심사위원 ${judgeId}`;

            return (
              <div
                key={judgeId || index}
                style={{
                  ...styles.avatarCard,
                  // 홀수/짝수별로 미세하게 회전시켜서 "엉망진창" 느낌 부여
                  transform: `rotate(${index % 2 === 0 ? -3 : 3}deg)`
                }}
              >
                <div style={styles.imageWrapper}>
                  <img
                    src={getJudgeImage(judgeId)}
                    style={styles.judgeAvatar}
                    alt={judgeName}
                  />
                  <div style={styles.speechBubble}>판결 대기중..</div>
                </div>
                <div style={styles.judgeBadge}>{judgeName}</div>
              </div>
            );
          })
        ) : (
          <p style={styles.loadingText}>댕댕이 판사님들이 출근 중입니다...</p>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  judgeSection: {
    // backgroundColor: '#FFEB3B', // 강렬한 노란색
    // border: '4px solid #000',
    // boxShadow: '5px 10px 0px #000', // 뉴브루탈리즘 스타일 그림자
    borderRadius: '20px',
    padding: '20px 15px',
    position: 'relative',
    overflow: 'hidden',
    marginTop: '20px',
  },
  titleContainer: {
    // position: 'absolute',
    // top: '-4px',
    // left: '20px',
    backgroundColor: '#FF5722', // 튀는 주황색
    padding: '5px 15px',
    border: '3px solid #000',
    // transform: 'rotate(-2deg)',
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
    padding: '5px',
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
    top: '-15px',
    right: '-20px',
    backgroundColor: '#000',
    color: '#fff',
    fontSize: '0.6rem',
    padding: '4px 8px',
    borderRadius: '10px',
    fontWeight: 'bold',
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