import { useGameStore } from '@/store/useGameStore';


export default function KickModal() {
    const { kickReason, setKickReason } = useGameStore();

    if (!kickReason) return null;

    const handleConfirm = () => {
        // 확인 버튼 누르면 -> 킥 사유 초기화 및 홈으로 이동
        setKickReason(null);
        window.location.href = '/';
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '15px',
                textAlign: 'center',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🚨</div>
                <h2 style={{ margin: '0 0 10px 0', color: '#e11d48', fontWeight: 'bold' }}>강퇴되었습니다</h2>
                <p style={{ margin: '0 0 20px 0', color: '#333', lineHeight: '1.5' }}>
                    {kickReason}
                </p>
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
}
