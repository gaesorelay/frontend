import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// 📡 [로직] 필요한 기능 Import
import { useGameStore } from '@/store/useGameStore';
import { useUserStore } from '@/store/useUserStore';
import { createRoomApi } from '@/api/roomApi';
import { socket } from '@/lib/socket';

// 🎨 배경 및 로고 이미지
import paperBg from '@/assets/background.png';
import logoTitle from '@/assets/logo/charactersettinglogo.png';
import leftArrowImg from '@/assets/logo/leftarrow.png';
import rightArrowImg from '@/assets/logo/rightarrow.png';
import SetupDecorations from './components/SetupDecorations';

// 🐶 강아지 이미지 로딩
import { AVATAR_LIST } from '@/lib/avatarMapper';

export default function Setup() {
  const navigate = useNavigate();
  const { roomId: paramRoomId } = useParams(); // URL의 방 번호 (Guest일 때 존재)

  // 1. GameStore
  const { roomConfig, roomTitle, setRoomInfo, setHasEntered, reset } = useGameStore(); // 👈 reset 추가

  // 2. UserStore
  const {
    setNickname: setStoreNickname,
    setAvatarId: setStoreAvatarId,
    setUserStatus,
    setRoomId
  } = useUserStore();

  const [nickname, setNickname] = useState("");
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const selectedDog = AVATAR_LIST[avatarIdx] || { id: 1, name: '?', icon: '' };
  const totalDogs = AVATAR_LIST.length;

  // 기본 설정
  const defaultConfig = {
    maxPlayers: 8,
    storytellerCount: 4,
    rounds: 3,
    roundTime: 60,
    voteTime: 30,
  };

  // ⭐️ [수정 1] 방장 판별 로직 강화
  // "설정값이 있고(AND) URL에 방번호가 없어야" 진짜 방장입니다.
  // URL에 방번호가 있으면 스토어에 뭐가 있든 무조건 게스트입니다.
  const isHost = !paramRoomId && !!roomConfig;

  // ⭐️ [수정 2] 게스트 입장 시: 좀비 데이터 정리용
  // 방 유효성 검사는 RouteGuard가 처리합니다.
  useEffect(() => {
    if (paramRoomId && roomConfig) {
      console.log("🧹 게스트 입장: 이전 방장 데이터 초기화");
      reset();
    }
  }, [paramRoomId, roomConfig, reset]);

  const handlePrev = () => {
    if (totalDogs === 0) return;
    setAvatarIdx((prev) => (prev === 0 ? totalDogs - 1 : prev - 1));
  };

  const handleNext = () => {
    if (totalDogs === 0) return;
    setAvatarIdx((prev) => (prev === totalDogs - 1 ? 0 : prev + 1));
  };

  // ⭐️ 완료 버튼 핸들러
  const handleComplete = async () => {
    if (!nickname.trim()) return alert("닉네임을 입력해주세요!");

    setIsLoading(true);

    try {
      // 게스트는 URL에서 가져온 방 번호 사용
      let currentRoomId = paramRoomId || '';
      let myToken = '';

      // ----------------------------------------------------
      // 1. [방장] 방 생성 API 호출 (HTTP)
      // ----------------------------------------------------
      // ⭐️ isHost가 false면 이 블록은 절대 실행되지 않음!
      if (isHost) {
        if (!roomConfig) return;

        console.log("📡 [Host] 방 생성 요청 중...");
        const res = await createRoomApi({
          title: roomTitle || "즐거운 게임",
          config: roomConfig,
          nickname: nickname,
          avatarId: selectedDog.id,
        });

        currentRoomId = res.roomId;
        // myToken = res.token;
        console.log("✅ 방 생성 완료:", currentRoomId);
      } else {
        console.log(`📡 [Guest] 기존 방(${currentRoomId}) 입장 시도...`);
      }

      // ----------------------------------------------------
      // 2. 소켓 연결 및 입장 (공통)
      // ----------------------------------------------------
      if (socket.connected) {
        console.log("♻️ 기존 소켓 연결 정리");
        socket.disconnect();
      }

      console.log("🔌 소켓 연결 시도...", { currentRoomId, myToken });

      socket.auth = { token: myToken };
      socket.connect();

      socket.emit('join_room', {
        roomId: currentRoomId,
        nickname: nickname,
        avatarId: selectedDog.id,
        userToken: myToken || undefined,
      }, (response: any) => {
        console.log("📩 Gateway 응답:", response);
        setIsLoading(false);

        if (response.status === 'success') {
          const user = response.data;

          setStoreNickname(user.nickname);
          setStoreAvatarId(user.avatarId);
          setRoomId(currentRoomId);
          setHasEntered(true);
          setUserStatus(user.role, user.isHost);

          if (isHost) {
            setRoomInfo({
              roomUuid: currentRoomId,
              title: roomTitle || "즐거운 게임",
              status: 'WAITING',
              config: roomConfig || defaultConfig,
              ownerUserToken: myToken,
              createdAt: new Date().toISOString()
            });
          }

          if (!isHost && user.userToken) {
            console.log("🔑 게스트 토큰 저장:", user.userToken);
            socket.auth = { token: user.userToken };
          }

          console.log("🚀 게임방으로 이동!");
          navigate(`/gameroom/${currentRoomId}`);
        } else {
          alert(`입장 실패: ${response.message}`);
          socket.disconnect();
        }
      });

    } catch (error) {
      console.error("❌ 에러 발생:", error);
      alert("오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  const styles = {
    // ... (스타일 기존 유지)
    container: { position: 'fixed' as const, inset: 0, display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'center', backgroundImage: `url(${paperBg})`, backgroundSize: 'cover', backgroundPosition: 'center', fontFamily: 'inherit', overflow: 'hidden' },
    logo: { width: '600px', maxWidth: '90%', zIndex: 11, marginBottom: '20px', filter: 'drop-shadow(6px 6px 0px rgba(0,0,0,0.1))', objectFit: 'contain' as const },
    centerRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', marginBottom: '20px', position: 'relative' as const, zIndex: 10 },
    cardBox: { position: 'relative' as const, zIndex: 10, background: 'white', padding: '40px 45px 30px 45px', width: '450px', maxWidth: '85%', boxSizing: 'border-box' as const, boxShadow: '10px 10px 0px rgba(0,0,0,0.08)', border: '3px solid #333', borderRadius: '20px 225px 15px 255px / 255px 15px 225px 15px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center' },
    imageContainer: { width: '180px', height: '180px', marginBottom: '20px', position: 'relative' as const, border: '3px solid #333', borderRadius: '20px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    dogImage: { width: '90%', height: '90%', objectFit: 'contain' as const },
    bubble: { position: 'absolute' as const, top: '-40px', right: '-40px', background: 'white', border: '2px solid #333', borderRadius: '50%', padding: '10px 15px', fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap' as const, boxShadow: '2px 2px 0px rgba(0,0,0,0.1)', transform: 'rotate(10deg)', zIndex: 15 },
    label: { fontSize: '22px', fontWeight: 'bold', marginBottom: '10px', alignSelf: 'flex-start', color: '#333' },
    input: { width: '100%', padding: '14px 22px', fontSize: '20px', textAlign: 'center' as const, border: '2.5px solid #333', borderRadius: '40px 10px 45px 8px / 8px 45px 10px 40px', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit' },
    buttonGroup: { display: 'flex', gap: '15px', width: '450px', maxWidth: '90%', zIndex: 10, position: 'relative' as const },
    button: { flex: 1, padding: '14px', fontSize: '20px', fontWeight: 'bold', border: '2.5px solid #333', borderRadius: '15px', cursor: 'pointer', background: 'white', boxShadow: '4px 4px 0px rgba(0,0,0,0.15)', fontFamily: 'inherit', transition: 'transform 0.1s' },
    arrowBtn: { background: 'none', border: 'none', outline: 'none', cursor: 'pointer', padding: '5px', transition: 'transform 0.1s' },
    arrowIcon: { width: '100px', height: '100px', objectFit: 'contain' as const, filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.2))' }
  };

  return (
    <div style={styles.container}>
      <SetupDecorations selectedDogIcon={selectedDog.icon} />
      <img src={logoTitle} alt="방 만들기" style={styles.logo} />
      <div style={styles.centerRow}>
        <button onClick={handlePrev} style={styles.arrowBtn} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          <img src={leftArrowImg} alt="이전" style={styles.arrowIcon} />
        </button>
        <div style={styles.cardBox}>
          <div style={styles.imageContainer}>
            <div style={styles.bubble}>멍멍!<br />나 어때?</div>
            {totalDogs > 0 ? <img src={selectedDog.icon} alt={selectedDog.name} style={styles.dogImage} /> : <span style={{ fontSize: '12px', color: 'red' }}>이미지 없음</span>}
          </div>
          <label style={styles.label}>닉네임 입력</label>
          <input style={styles.input} value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="닉네임을 적어줘!" maxLength={8} />
        </div>
        <button onClick={handleNext} style={styles.arrowBtn} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          <img src={rightArrowImg} alt="다음" style={styles.arrowIcon} />
        </button>
      </div>
      <div style={styles.buttonGroup}>
        <button onClick={() => navigate(-1)} style={{ ...styles.button, background: '#f5f5f5' }} onMouseDown={(e) => e.currentTarget.style.transform = 'translate(2px, 2px)'} onMouseUp={(e) => e.currentTarget.style.transform = 'translate(0, 0)'}>돌아가기</button>
        <button onClick={handleComplete} disabled={isLoading} style={{ ...styles.button, background: isLoading ? '#ccc' : '#FFD700', cursor: isLoading ? 'not-allowed' : 'pointer' }} onMouseDown={(e) => !isLoading && (e.currentTarget.style.transform = 'translate(2px, 2px)')} onMouseUp={(e) => !isLoading && (e.currentTarget.style.transform = 'translate(0, 0)')}>
          {isLoading ? "로딩 중..." : (isHost ? "설정 완료!" : "입장하기")}
        </button>
      </div>
    </div>
  );
}
