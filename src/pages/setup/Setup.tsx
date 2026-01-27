import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // 👈 useParams 추가

// 📡 [로직] 필요한 기능 Import
import { useGameStore } from '@/store/useGameStore';
import { useUserStore } from '@/store/useUserStore';
import { createRoomApi, joinRoomApi } from '@/api/roomApi';
import { socket } from '@/lib/socket';

// 🎨 배경 및 로고 이미지
import paperBg from '@/assets/background.png';
import logoTitle from '@/assets/logo/charactersettinglogo.png';

// ⬅️➡️ 화살표 이미지
import leftArrowImg from '@/assets/logo/leftarrow.png';
import rightArrowImg from '@/assets/logo/rightarrow.png';

// ✨ 꾸미기 컴포넌트 import
import SetupDecorations from './components/SetupDecorations';

// ------------------------------------------------------------------
// 🐶 강아지 이미지 자동 로딩 (팀원 코드 유지)
// ------------------------------------------------------------------
const rawImages = import.meta.glob('@/assets/dog/*.{png,jpg,jpeg}', { eager: true, as: 'url' });

const sortedImageUrls = Object.entries(rawImages)
  .sort(([pathA], [pathB]) => {
    const numA = parseInt(pathA.match(/dog(\d+)/)?.[1] || '0', 10);
    const numB = parseInt(pathB.match(/dog(\d+)/)?.[1] || '0', 10);
    return numA - numB;
  })
  .map(([_, url]) => url);

const AVATARS = sortedImageUrls.map((imgSrc, index) => ({
  id: index + 1,
  name: `멍멍이 ${index + 1}`,
  desc: '준비 완료!',
  icon: imgSrc,
}));
// ------------------------------------------------------------------

export default function Setup() { // 컴포넌트 이름 CreatePage -> Setup으로 변경 권장
  const navigate = useNavigate();
  const { roomId: paramRoomId } = useParams(); // URL로 들어온 경우 (참가자)
  
  // 📡 [로직] 스토어 연결
  const { roomConfig } = useGameStore(); // 설정이 있으면 방장
  const { setProfile } = useUserStore();

  const [nickname, setNickname] = useState("");
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  const selectedDog = AVATARS[avatarIdx] || { id: 0, name: '?', icon: '' };
  const totalDogs = AVATARS.length;
  
  // 👑 방장 여부 판별
  const isHost = !!roomConfig; 

  const handlePrev = () => {
    if (totalDogs === 0) return;
    setAvatarIdx((prev) => (prev === 0 ? totalDogs - 1 : prev - 1));
  };

  const handleNext = () => {
    if (totalDogs === 0) return;
    setAvatarIdx((prev) => (prev === totalDogs - 1 ? 0 : prev + 1));
  };

  // ⭐️ [핵심 로직] 완료 버튼 핸들러
  const handleComplete = async () => {
    if (!nickname.trim()) return alert("닉네임을 입력해주세요!");
    setIsLoading(true);

    try {
      let finalRoomId = paramRoomId;
      let userToken = "";
      const selectedAvatarId = selectedDog.id;

      // 1. API 호출 (방 만들기 or 입장하기)
      if (isHost) {
        console.log("👑 방 생성 시도...", roomConfig);
        const res = await createRoomApi({
          ...roomConfig!, // 저장해둔 설정값
          hostProfile: { nickname, avatarId: selectedAvatarId }
        });
        finalRoomId = res.roomId;
        userToken = res.token;
      } else {
        if (!finalRoomId) throw new Error("방 ID가 없습니다.");
        console.log("🏃 방 입장 시도...", finalRoomId);
        const res = await joinRoomApi({
          roomId: finalRoomId,
          userProfile: { nickname, avatarId: selectedAvatarId }
        });
        userToken = res.token;
      }

      // 2. 스토어 업데이트
      setProfile(nickname, selectedAvatarId);

      // 3. 소켓 연결 및 입장
      if (!socket.connected) socket.connect();
      
      socket.emit('join_room', {
        roomId: finalRoomId,
        nickname,
        userToken,
        avatarId: selectedAvatarId
      }, (response: any) => {
        if (response?.status === 'error') {
          alert("입장 실패: " + response.message);
          setIsLoading(false);
          return;
        }
        
        // 4. 성공 시 게임방으로 이동! 🚀
        console.log("✅ 입장 성공!");
        navigate(`/room/${finalRoomId}`);
      });

    } catch (error) {
      console.error(error);
      // 백엔드 연결 실패 시 (테스트용)
      alert("서버 연결 실패! 🚧 디자인 테스트 모드로 입장합니다.");

      // 1. 내 프로필 스토어에 강제 저장 (이게 없으면 게임방 가서 내 이름이 안 뜸)
      setProfile(nickname, selectedDog.id);

      // 2. 이동할 방 ID 결정
      // (URL에 1234 입력하고 왔으면 그 번호 유지, 방장이면 임시 번호)
      const targetRoomId = paramRoomId || "test-room-1234";

      // 3. 이동!
      navigate(`/game/${targetRoomId}`);
      
      setIsLoading(false);
    }
  };

  // 🎨 스타일 정의 (팀원 코드 그대로 유지)
  const styles = {
    container: {
      position: 'fixed' as const,
      inset: 0,
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundImage: `url(${paperBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: 'inherit',
      overflow: 'hidden',
    },
    logo: {
      width: '600px',
      maxWidth: '90%',
      zIndex: 11,
      marginBottom: '20px',
      filter: 'drop-shadow(6px 6px 0px rgba(0,0,0,0.1))',
      objectFit: 'contain' as const,
    },
    centerRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      width: '100%',
      marginBottom: '20px',
      position: 'relative' as const,
      zIndex: 10,
    },
    cardBox: {
      position: 'relative' as const,
      zIndex: 10,
      background: 'white',
      padding: '40px 45px 30px 45px',
      width: '450px',
      maxWidth: '85%',
      boxSizing: 'border-box' as const,
      boxShadow: '10px 10px 0px rgba(0,0,0,0.08)',
      border: '3px solid #333',
      borderRadius: '20px 225px 15px 255px / 255px 15px 225px 15px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
    },
    imageContainer: {
      width: '180px',
      height: '180px',
      marginBottom: '20px',
      position: 'relative' as const,
      border: '3px solid #333',  
      borderRadius: '20px',      
      backgroundColor: '#fff',    
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dogImage: {
      width: '90%',
      height: '90%',
      objectFit: 'contain' as const,
    },
    bubble: {
      position: 'absolute' as const,
      top: '-40px',
      right: '-40px',
      background: 'white',
      border: '2px solid #333',
      borderRadius: '50%',
      padding: '10px 15px',
      fontSize: '14px',
      fontWeight: 'bold',
      whiteSpace: 'nowrap' as const,
      boxShadow: '2px 2px 0px rgba(0,0,0,0.1)',
      transform: 'rotate(10deg)',
      zIndex: 15,
    },
    label: {
      fontSize: '22px',
      fontWeight: 'bold',
      marginBottom: '10px',
      alignSelf: 'flex-start',
      color: '#333'
    },
    input: {
      width: '100%',
      padding: '14px 22px',
      fontSize: '20px',
      textAlign: 'center' as const,
      border: '2.5px solid #333',
      borderRadius: '40px 10px 45px 8px / 8px 45px 10px 40px',
      outline: 'none',
      boxSizing: 'border-box' as const,
      fontFamily: 'inherit',
    },
    buttonGroup: {
      display: 'flex',
      gap: '15px',
      width: '450px',
      maxWidth: '90%',
      zIndex: 10,
      position: 'relative' as const,
    },
    button: {
      flex: 1,
      padding: '14px',
      fontSize: '20px',
      fontWeight: 'bold',
      border: '2.5px solid #333',
      borderRadius: '15px',
      cursor: 'pointer',
      background: 'white',
      boxShadow: '4px 4px 0px rgba(0,0,0,0.15)',
      fontFamily: 'inherit',
      transition: 'transform 0.1s',
    },
    arrowBtn: {
      background: 'none',
      border: 'none',
      outline: 'none',
      cursor: 'pointer',
      padding: '5px',
      transition: 'transform 0.1s',
    },
    arrowIcon: {
        width: '100px',
        height: '100px',
        objectFit: 'contain' as const,
        filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.2))'
    }
  };

  return (
    <div style={styles.container}>
      
      {/* ✨ 1. 배경 꾸미기 (선택된 강아지 이미지를 넘겨줌!) */}
      <SetupDecorations selectedDogIcon={selectedDog.icon} />

      {/* 2. 로고 */}
      <img src={logoTitle} alt="방 만들기" style={styles.logo} />

      {/* 3. 중앙 영역 */}
      <div style={styles.centerRow}>
        <button
            onClick={handlePrev}
            style={styles.arrowBtn}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
            <img src={leftArrowImg} alt="이전" style={styles.arrowIcon} />
        </button>

        <div style={styles.cardBox}>
            <div style={styles.imageContainer}>
                <div style={styles.bubble}>멍멍!<br/>나 어때?</div>
                {totalDogs > 0 ? (
                    <img src={selectedDog.icon} alt={selectedDog.name} style={styles.dogImage} />
                ) : (
                    <span style={{fontSize:'12px', color:'red'}}>이미지 없음</span>
                )}
            </div>

            <label style={styles.label}>닉네임 입력</label>
            <input
                style={styles.input}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임을 적어줘!"
                maxLength={8}
            />
        </div>

        <button
            onClick={handleNext}
            style={styles.arrowBtn}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
            <img src={rightArrowImg} alt="다음" style={styles.arrowIcon} />
        </button>
      </div>

      {/* 4. 하단 버튼들 */}
      <div style={styles.buttonGroup}>
        <button
            onClick={() => navigate(-1)}
            style={{...styles.button, background: '#f5f5f5'}}
            onMouseDown={(e) => e.currentTarget.style.transform = 'translate(2px, 2px)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'translate(0, 0)'}
        >
            돌아가기
        </button>
        {/* ⭐️ onClick 핸들러 교체 및 disabled 처리 */}
        <button
            onClick={handleComplete}
            disabled={isLoading}
            style={{
              ...styles.button, 
              background: isLoading ? '#ccc' : '#FFD700',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
            onMouseDown={(e) => !isLoading && (e.currentTarget.style.transform = 'translate(2px, 2px)')}
            onMouseUp={(e) => !isLoading && (e.currentTarget.style.transform = 'translate(0, 0)')}
        >
            {isLoading ? "로딩 중..." : (isHost ? "설정 완료!" : "입장하기")}
        </button>
      </div>

    </div>
  );
}