import React, { useState, useEffect } from 'react';
import { getCardImage } from '@/lib/cardMapper';

interface CardAreaProps {
  cardIds: number[];
  currentTurn: number;
}

const CardArea = ({ cardIds, currentTurn }: CardAreaProps) => {
  const [viewIndex, setViewIndex] = useState(currentTurn - 1);

  useEffect(() => {
    setViewIndex(currentTurn - 1);
  }, [currentTurn]);

  const goToPrev = () => setViewIndex((prev) => Math.max(0, prev - 1));
  const goToNext = () => setViewIndex((prev) => Math.min(currentTurn - 1, prev + 1));

  const currentCardId = cardIds[viewIndex] || 0;

  return (
    <div style={styles.container}>
      <div style={styles.mainWrapper}>
        {/* 왼쪽 손글씨 화살표 */}
        <button
          onClick={goToPrev}
          disabled={viewIndex === 0}
          style={{ ...styles.handArrow, left: '-50px', opacity: viewIndex === 0 ? 0.2 : 1 }}
        >
          &lt;
        </button>

        {/* 더 커진 카드 프레임 */}
        <div style={styles.cardFrame}>
          {currentCardId > 0 ? (
            <img
              src={getCardImage(currentCardId)}
              alt={`Card ${currentCardId}`}
              style={styles.image}
            />
          ) : (
            <div style={styles.placeholder}>?</div>
          )}

          {/* 하단 페이지 표시 (1/8) */}
          <div style={styles.pageIndicator}>
            {viewIndex + 1} / {currentTurn}
          </div>
        </div>

        {/* 오른쪽 손글씨 화살표 */}
        <button
          onClick={goToNext}
          disabled={viewIndex === currentTurn - 1}
          style={{ ...styles.handArrow, right: '-50px', opacity: viewIndex === currentTurn - 1 ? 0.2 : 1 }}
        >
          &gt;
        </button>
      </div>

      <div style={styles.cardFooter}>
        <span style={styles.footerText}>{viewIndex + 1}번째 개껌</span>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    padding: '15px',
  },
  mainWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxWidth: '400px', // 전체적으로 더 크게 키움
  },
  handArrow: {
    position: 'absolute',
    background: 'none',
    border: 'none',
    fontSize: '3rem',
    fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif', // 손글씨 느낌 폰트
    fontWeight: '900',
    cursor: 'pointer',
    color: '#333',
    padding: '10px',
    userSelect: 'none',
    transition: 'transform 0.1s',
  },
  cardFrame: {
    width: '100%',
    backgroundColor: '#fff',
    border: '3px solid #333',
    boxShadow: '6px 6px 0px rgba(0,0,0,0.8)',
    borderRadius: '4px', // 폴라로이드 느낌을 위해 둥글기를 줄임
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover', // 사진을 꽉 채움 (contain보다 임팩트가 큼)
    borderRadius: '2px',
  },
  pageIndicator: {
    position: 'absolute',
    bottom: '5px',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    color: '#888',
    fontFamily: 'monospace',
  },
  cardFooter: {
    marginTop: '12px',
    borderBottom: '2px dashed #333',
  },
  footerText: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#333',
    fontStyle: 'italic',
  },
  placeholder: {
    fontSize: '4rem',
    color: '#eee',
  }
};

export default CardArea;