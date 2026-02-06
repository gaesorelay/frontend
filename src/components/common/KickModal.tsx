import { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';

const KickModal = () => {
  const { kickReason, kickTitle, setKickReason, setKickTitle } = useGameStore();

  useEffect(() => {
    if (kickReason) return;
    try {
      const storedReason = sessionStorage.getItem('kickModalReason');
      if (storedReason) {
        const storedTitle = sessionStorage.getItem('kickModalTitle');
        if (storedTitle) {
          setKickTitle(storedTitle);
        }
        setKickReason(storedReason);
      }
    } catch {
      // Ignore storage errors.
    }
  }, [kickReason, setKickReason, setKickTitle]);

  if (!kickReason) return null;

  const handleConfirm = () => {
    setKickReason(null);
    setKickTitle(null);
    try {
      sessionStorage.removeItem('kickModalReason');
      sessionStorage.removeItem('kickModalTitle');
    } catch {
      // Ignore storage errors.
    }
    window.location.href = '/';
  };

  const title = kickTitle || '강퇴되었습니다.';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '30px',
          borderRadius: '15px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>!</div>
        <h2 style={{ margin: '0 0 10px 0', color: '#e11d48', fontWeight: 'bold' }}>{title}</h2>
        <p style={{ margin: '0 0 20px 0', color: '#333', lineHeight: '1.5' }}>{kickReason}</p>
        <button
          onClick={handleConfirm}
          style={{
            background: '#e11d48',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            fontSize: '16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default KickModal;
