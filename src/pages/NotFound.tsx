// src/pages/NotFound.tsx
import { useNavigate } from 'react-router-dom';
import { Background } from '@/components/common/background';
import dogCry from '@/assets/dog/dog23.png';

const NotFound = () => {
  const navigate = useNavigate();

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: '20px',
      textAlign: 'center' as const,
    },
    title: {
      fontSize: '3rem',
      fontWeight: '900',
      color: '#333',
      textShadow: '3px 3px 0px rgba(0,0,0,0.1)',
      marginBottom: '-10px',
    },
    subTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#555',
    },
    imageBox: {
      width: '200px',
      height: '200px',
      borderRadius: '50%',
      border: '5px solid #333',
      overflow: 'hidden',
      backgroundColor: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '6px 6px 0px rgba(0,0,0,0.2)',
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
    },
    desc: {
      fontSize: '1.2rem',
      lineHeight: '1.6',
      color: '#444',
      whiteSpace: 'pre-line' as const,
    },
    homeBtn: {
      marginTop: '20px',
      padding: '12px 30px',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: '#000',
      backgroundColor: '#FFD93D', // 메인 컬러 (노랑)
      border: '3px solid #000',
      borderRadius: '15px',
      cursor: 'pointer',
      boxShadow: '4px 4px 0px #000',
      transition: 'all 0.2s',
    },
  };

  return (
    <Background>
      <div style={styles.container}>
        <div style={styles.title}>404 ERROR</div>
        <div style={styles.imageBox}>
          <img src={dogCry} alt="길 잃은 강아지" style={styles.image} />
        </div>

        <div style={styles.subTitle}>왈왈? (여기가 어디개?)</div>

        <p style={styles.desc}>
          길을 잃어버렸나 봐요!<br />
          맛있는 뼈다귀가 있는 집으로 돌아갈까요?
        </p>

        <button
          style={styles.homeBtn}
          onClick={() => navigate('/')}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translate(2px, 2px)';
            e.currentTarget.style.boxShadow = '2px 2px 0px #000';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)';
            e.currentTarget.style.boxShadow = '4px 4px 0px #000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)';
            e.currentTarget.style.boxShadow = '4px 4px 0px #000';
          }}
        >
          🏠 집으로 돌아가기
        </button>
      </div>
    </Background>
  );
};

export default NotFound;
