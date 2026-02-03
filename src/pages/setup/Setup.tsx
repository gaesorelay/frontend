import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// 📡 [로직] 필요한 기능 Import
import { useGameStore } from '@/store/useGameStore';
import { useUserStore } from '@/store/useUserStore';
import { createRoomApi } from '@/api/roomApi';
import { socket } from '@/lib/socket';
import { useAudioStore } from '@/store/useAudioStore';

// 🎨 배경 및 로고 이미지
import paperBg from '@/assets/background.png';
import logoTitle from '@/assets/logo/charactersettinglogo.png';
import leftArrowImg from '@/assets/logo/leftarrow.png';
import rightArrowImg from '@/assets/logo/rightarrow.png';
import SetupDecorations from './components/SetupDecorations';
import refreshIcon from '@/assets/refresh.svg';
import clickMp3 from '@/assets/sound/click.mp3';
import RuleGuide from '@/components/common/RuleGuide';

// 🐶 강아지 이미지 로딩
import { AVATAR_LIST } from '@/lib/avatarMapper';

export default function Setup() {
  const navigate = useNavigate();
  const { roomId: paramRoomId } = useParams(); // URL의 방 번호 (Guest일 때 존재)

  // 오디오 상태 (전역 Store 사용)
  const { isMuted, toggleMute } = useAudioStore();

  const handleToggleMute = () => {
    toggleMute();
    playClick();
  };

  const playClick = () => {
    const audio = new Audio(clickMp3);
    audio.volume = 0.8;
    audio.play().catch(() => {});
  };

  // 1. GameStore
  const { roomConfig, roomTitle, setRoomInfo, setHasEntered, reset } = useGameStore();

  // 2. UserStore
  const {
    setNickname: setStoreNickname,
    setAvatarId: setStoreAvatarId,
    setUserStatus,
    setRoomId,
    setUserToken,
  } = useUserStore();

  const [nickname, setNickname] = useState('');
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const selectedDog = AVATAR_LIST[avatarIdx] || { id: 1, name: '?', icon: '' };
  const totalDogs = AVATAR_LIST.length;

  // 기본 설정
  const defaultConfig = {
    maxPlayers: 8,
    storytellerCount: 4,
    rounds: 3,
    roundTime: 10,
    voteTime: 30,
  };

  // ⭐️ [수정 1] 방장 판별 로직 강화
  const isHost = !paramRoomId && !!roomConfig;

  // ⭐️ [수정 2] 게스트 입장 시: 좀비 데이터 정리용
  useEffect(() => {
    if (paramRoomId && roomConfig) {
      console.log('🧹 게스트 입장: 이전 방장 데이터 초기화');
      reset();
    }
  }, [paramRoomId, roomConfig, reset]);

  const handlePrev = () => {
    if (totalDogs === 0) return;
    playClick();
    setAvatarIdx((prev) => (prev === 0 ? totalDogs - 1 : prev - 1));
  };

  const handleNext = () => {
    if (totalDogs === 0) return;
    playClick();
    setAvatarIdx((prev) => (prev === totalDogs - 1 ? 0 : prev + 1));
  };

  const handleRandomAvatar = () => {
    playClick();
    if (totalDogs > 0) {
      // 현재와 다른 랜덤 인덱스 선택
      let newIdx = Math.floor(Math.random() * totalDogs);
      while (newIdx === avatarIdx && totalDogs > 1) {
        newIdx = Math.floor(Math.random() * totalDogs);
      }
      setAvatarIdx(newIdx);
    }
  };

  // ⭐️ 완료 버튼 핸들러
  const handleComplete = async () => {
    playClick();
    if (!nickname.trim()) return alert('닉네임을 입력해주세요!');

    setIsLoading(true);

    try {
      // 게스트는 URL에서 가져온 방 번호 사용
      let currentRoomId = paramRoomId || '';
      let myToken = '';

      // ----------------------------------------------------
      // 1. [방장] 방 생성 API 호출 (HTTP)
      // ----------------------------------------------------
      if (isHost) {
        if (!roomConfig) return;

        console.log('📡 [Host] 방 생성 요청 중...');
        const res = await createRoomApi({
          title: roomTitle || '즐거운 게임',
          config: roomConfig,
          nickname: nickname,
          avatarId: selectedDog.id,
        });

        currentRoomId = res.roomId;
        console.log('✅ 방 생성 완료:', currentRoomId);
      } else {
        console.log(`📡 [Guest] 기존 방(${currentRoomId}) 입장 시도...`);
      }

      // ----------------------------------------------------
      // 2. 소켓 연결 및 입장 (공통)
      // ----------------------------------------------------
      if (socket.connected) {
        console.log('♻️ 기존 소켓 연결 정리');
        socket.disconnect();
      }

      console.log('🔌 소켓 연결 시도...', { currentRoomId, myToken });

      socket.auth = { token: myToken };
      socket.connect();

      socket.emit(
        'join_room',
        {
          roomId: currentRoomId,
          nickname: nickname,
          avatarId: selectedDog.id,
          userToken: myToken || undefined,
        },
        (response: any) => {
          console.log('📩 Gateway 응답:', response);
          setIsLoading(false);

          if (response.status === 'success') {
            const user = response.data;

            setStoreNickname(user.nickname);
            setStoreAvatarId(user.avatarId);
            setRoomId(currentRoomId);
            setHasEntered(true);
            setUserStatus(user.role, user.isHost);

            // 방장, 게스트 공통으로 토큰 저장하도록 변경
            if (user.userToken) {
              console.log('🔑 토큰 저장 완료:', user.userToken);
              setUserToken(user.userToken); // Store 저장
              socket.auth = { token: user.userToken }; // 소켓 재연결 대비
            }

            if (isHost) {
              setRoomInfo({
                roomId: currentRoomId,
                title: roomTitle || '즐거운 게임',
                status: 'WAITING',
                config: roomConfig || defaultConfig,
                ownerUserToken: user.userToken,
                createdAt: new Date().toISOString(),
              });
            }

            console.log('🚀 게임방으로 이동!');
            navigate(`/gameroom/${currentRoomId}`);
          } else {
            alert(`입장 실패: ${response.message}`);
            socket.disconnect();
          }
        }
      );
    } catch (error) {
      console.error('❌ 에러 발생:', error);
      alert('오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

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
    // ✨ [변경] 메인 컨텐츠 영역 (룰 설명 + 캐릭터 설정을 감싸는 Flex 박스)
    mainContentRow: {
      display: 'flex',
      flexWrap: 'wrap' as const, // 화면 작으면 줄바꿈
      alignItems: 'center',
      justifyContent: 'center',
      gap: '40px', // 두 컴포넌트 사이 간격
      width: '100%',
      maxWidth: '1200px',
      marginBottom: '20px',
      zIndex: 10,
      padding: '0 20px',
    },
    // 기존 캐릭터 설정 Row (이제 mainContentRow 안으로 들어감)
    characterSetupSection: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      position: 'relative' as const,
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
    dogImage: { width: '90%', height: '90%', objectFit: 'contain' as const },
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
      color: '#333',
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
      filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.2))',
    },
    randomBtn: {
      position: 'absolute' as const,
      bottom: '-10px',
      right: '-10px',
      background: '#fff',
      border: '3px solid #333',
      borderRadius: '50%',
      width: '50px',
      height: '50px',
      cursor: 'pointer',
      zIndex: 20,
      boxShadow: '3px 3px 0px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.1s',
    },
    randomIcon: {
      width: '24px',
      height: '24px',
      objectFit: 'contain' as const,
    },
  };

  return (
    <div style={styles.container}>
      <button
        onClick={handleToggleMute}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.8)',
          border: '2px solid #333',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          fontSize: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
        }}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      <SetupDecorations selectedDogIcon={selectedDog.icon} />
      <img src={logoTitle} alt="방 만들기" style={styles.logo} />
      {/* ✨ [수정] 메인 컨텐츠 영역: 룰 설명과 캐릭터 설정을 나란히 배치 */}
      <div style={styles.mainContentRow}>
        {/* 1. 왼쪽: 게임 룰 가이드 */}
        <RuleGuide />

        {/* 2. 오른쪽: 캐릭터 설정 (기존 코드) */}
        <div style={styles.characterSetupSection}>
          <button
            onClick={handlePrev}
            style={styles.arrowBtn}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.9)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <img src={leftArrowImg} alt="이전" style={styles.arrowIcon} />
          </button>

          <div style={styles.cardBox}>
            <div style={styles.imageContainer}>
              <div style={styles.bubble}>
                멍멍!
                <br />나 어때?
              </div>
              {totalDogs > 0 ? (
                <img src={selectedDog.icon} alt={selectedDog.name} style={styles.dogImage} />
              ) : (
                <span style={{ fontSize: '12px', color: 'red' }}>이미지 없음</span>
              )}
              <button
                onClick={handleRandomAvatar}
                style={styles.randomBtn}
                title="랜덤 변경"
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.9) rotate(-15deg)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1) rotate(0deg)')}
              >
                <img src={refreshIcon} alt="랜덤" style={styles.randomIcon} />
              </button>
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
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.9)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <img src={rightArrowImg} alt="다음" style={styles.arrowIcon} />
          </button>
        </div>
      </div>
      <div style={styles.buttonGroup}>
        <button
          onClick={() => {
            playClick();
            navigate(-1);
          }}
          style={{ ...styles.button, background: '#f5f5f5' }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'translate(2px, 2px)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'translate(0, 0)')}
        >
          돌아가기
        </button>
        <button
          onClick={handleComplete}
          disabled={isLoading}
          style={{
            ...styles.button,
            background: isLoading ? '#ccc' : '#FFD700',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
          onMouseDown={(e) =>
            !isLoading && (e.currentTarget.style.transform = 'translate(2px, 2px)')
          }
          onMouseUp={(e) => !isLoading && (e.currentTarget.style.transform = 'translate(0, 0)')}
        >
          {isLoading ? '로딩 중...' : isHost ? '설정 완료!' : '입장하기'}
        </button>
      </div>
    </div>
  );
}
