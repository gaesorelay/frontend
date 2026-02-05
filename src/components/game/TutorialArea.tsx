import React, { useState } from 'react';

import tutorial1 from '@/assets/tutorial/tutorial1.jpg'
import tutorial2 from '@/assets/tutorial/tutorial2.jpg'
import tutorial3 from '@/assets/tutorial/tutorial3.jpg'

const TutorialModal = ({ isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 가이드 이미지 배열 (3장)
  const images = [
    tutorial1,
    tutorial2,
    tutorial3,
  ];

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose(); // 마지막 페이지에서 누르면 닫기 (혹은 처음으로)
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.container} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>×</button>

        <div style={styles.imageWrapper}>
          <img src={images[currentIndex]} style={styles.image} alt="tutorial" />
        </div>

        <div style={styles.controls}>
          {/* 💡 조건부 스타일링: currentIndex가 0이면 disabledBtn 스타일 추가 적용 */}
          <button
            style={{
              ...styles.navBtn,
              ...(currentIndex === 0 ? styles.disabledBtn : {})
            }}
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            이전
          </button>

          <span>{currentIndex + 1} / {images.length}</span>

          <button
            style={styles.navBtn}
            onClick={handleNext}
          >
            {currentIndex === images.length - 1 ? '시작하기' : '다음'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  container: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '20px',
    position: 'relative',
    width: '700px',
    textAlign: 'center' as const, // TS 타입 추론을 위해 as const 사용
  },
  imageWrapper: {
    marginBottom: '1rem',
  },
  image: {
    width: '100%',
    height: 'auto',
    borderRadius: '10px',
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#ffec44',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  // disabled 전용 스타일 별도 분리
  disabledBtn: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  closeBtn: {
    position: 'absolute',
    top: '10px',
    right: '15px',
    fontSize: '24px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
  },
};
export default TutorialModal;