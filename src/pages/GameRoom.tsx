import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';
import { useUserStore } from '@/store/useUserStore';
import { socket } from '@/lib/socket';
import type { GamePhase } from '@/types/game';

// 페이즈 컴포넌트들 Import
import LobbyPhase from '@/components/game/phases/LobbyPhase';
import CardShufflePhase from '@/components/game/phases/CardShufflePhase';
import JudgeShufflePhase from '@/components/game/phases/JudgeShufflePhase';
import WritingPhase from '@/components/game/phases/WritingPhase';
import VotingPhase from '@/components/game/phases/VotingPhase';
import JudgeResultPhase from '@/components/game/phases/JudgeResultPhase';
import FinalResultPhase from '@/components/game/phases/FinalResultPhase';

// 더미 데이터 프로필 이미지
import dog1 from '@/assets/dog/dog1.png';
import styles from './GameRoom.module.css';

// 🛠️ [중요] 배포/실전 테스트 시에는 반드시 false로 설정!
const TEST_MODE = false;



const GameRoom = () => {
  const { roomId } = useParams();

  // 1. 스토어 데이터
  // ⭐️ [수정] useUserStore에서 isHost 정보를 정확하게 가져옵니다.
  const { nickname: myNickname, avatarId: myAvatarId, isHost: isMyHost } = useUserStore();
  const { roomConfig, gamePhase, setGamePhase, setRoundData, setRoomInfo, players, setPlayers, setRoomActions } = useGameStore();
  const [isVerifying, setIsVerifying] = useState(true);

  // ⭐️ 권한 체크: 테스트 모드이거나, 내 스토어에 저장된 신분이 Host일 때
  const isHost = TEST_MODE || isMyHost;

  // 게스트는 roomConfig가 아직 없을 수 있으므로 기본값(4) 처리
  const maxStorytellers = roomConfig?.storytellerCount || 4;

  // =========================================================
  // 🧪 [테스트 데이터 생성기]
  // =========================================================
  const generateMockUsers = () => {
    const baseUsers = [
      { userToken: 'u1', nickname: '멍멍이1', role: 'AUDIENCE', isHost: false, avatarId: 2, avatar: dog1 },
      { userToken: 'u2', nickname: '멍멍이2', role: 'AUDIENCE', isHost: false, avatarId: 3, avatar: dog1 },
      { userToken: 'u3', nickname: '멍멍이3', role: 'AUDIENCE', isHost: false, avatarId: 4, avatar: dog1 },
      // 이미 자리를 차지한 다른 플레이어들
      { userToken: 'p2', nickname: '고인물', role: 'PLAYER', team: 'A', slotIndex: 1, isHost: false, avatarId: 5, avatar: dog1 },
      { userToken: 'p3', nickname: '뉴비', role: 'PLAYER', team: 'B', slotIndex: 0, isHost: false, avatarId: 3, avatar: dog1 },
    ];

    if (isHost) {
      baseUsers.push({
        userToken: 'me_host_token',
        nickname: myNickname || '나(방장)',
        role: 'PLAYER', team: 'A', slotIndex: 0,
        isHost: true, avatarId: myAvatarId || 1, avatar: '🦁'
      });
    }
    return baseUsers;
  };

  // ⭐️ 유저 상태 관리
  // TEST_MODE가 꺼져있으면 빈 배열([])로 시작해서 소켓 데이터를 기다립니다.
  // const [users, setUsers] = useState<any[]>(TEST_MODE ? generateMockUsers() : []);  삭제 : 로컬 state 더이상 쓰지 않음

  // 📡 소켓 리스너
  useEffect(() => {
    setGamePhase('LOBBY');
    if (TEST_MODE) return;

    console.log(`🔌 GameRoom 소켓 리스너 연결 (Room: ${roomId})`);

    // 1. 방 정보 요청 (게스트는 들어오자마자 이게 필요함)
    socket.emit('request_room_info', { roomId });

    // 2. ⭐️ [복구] 여기서 초기 명단을 받아야 합니다!
    // 백엔드는 입장 시 'lobby_updated' 대신 이걸 보내고 있습니다.
    // 1. ⭐️ [수정] 방 정보 요청 (콜백으로 바로 받기!)
    // 백엔드가 return { status: 'success', data: ... } 해주는 걸 여기서 받습니다.
    socket.emit('request_room_info', { roomId }, (response: any) => {
      console.log("📦 방 정보(Ack) 도착:", response);

      if (response.status === 'success') {
        const data = response.data;

        // A. 방 설정/제목 저장
        setRoomActions(data.title, data.config);

        // B. 유저 명단 업데이트
        setPlayers(data.users);

        // C. 로딩 끝
        setIsVerifying(false);
      } else {
        console.error("방 정보 로드 실패:", response.message);
        // 에러 처리 (alert 등)
      }
    });

    // 2. [수신] 유저 리스트 업데이트 (입장/퇴장/팀변경 시)
    socket.on('lobby_updated', (data) => {
      console.log("👥 로비 업데이트:", data);
      setPlayers(data.users);
      // 만약 data.roomConfig 등 방 정보도 같이 온다면 여기서 setRoomInfo 업데이트
    });


    // 4. ⭐️ [신규] 게임 시작 데이터 수신 (이게 없으면 카드가 안 보임!)
    socket.on('game_started', (data) => {
      console.log("🎮 게임 데이터 도착:", data);
      // imageIds, judges 등을 스토어에 저장
      setRoundData({
        cardIds: data.imageIds,
        judgeIds: data.judges,
        // 필요한 다른 데이터 초기화
      });
    });

    // 3. [수신] 페이즈 변경
    socket.on('change_phase', (response) => {
      console.log("🎬 페이즈 변경:", response.phase); // 👈 로그 확인 필수
      const { phase, data } = response;
      if (data) setRoundData(data);
      setGamePhase(phase as GamePhase);
    });

    return () => {
      socket.off('lobby_updated');
      socket.off('game_started');
      socket.off('change_phase');
    };
  }, [roomId]);

  // 🛠️ [개발용] 페이즈 순서 정의
  const PHASE_ORDER: GamePhase[] = [
      'LOBBY',
      'CARD_SHUFFLE',
      'JUDGE_SHUFFLE',
      'TURN1', 'TURN2', 'TURN3', 'TURN4', 
      'TURN5', 'TURN6', 'TURN7', 'TURN8',
      'STORY', 
      'VOTING', 
      'JUDGE_RESULT', 
      'FINAL_RESULT'
    ];

  // 🛠️ [개발용] 제어 상태
  const [isAutoPlay, setIsAutoPlay] = useState(false); // 기본값: 수동 (일시정지 상태)
  const [isDevExpanded, setIsDevExpanded] = useState(true); // 개발자 바 펼침 여부

  const handleNextPhase = () => {
    const currentIndex = PHASE_ORDER.indexOf(gamePhase as GamePhase);
    const nextIndex = (currentIndex + 1) % PHASE_ORDER.length;
    setGamePhase(PHASE_ORDER[nextIndex]);
  };

  const handlePrevPhase = () => {
    const currentIndex = PHASE_ORDER.indexOf(gamePhase as GamePhase);
    const prevIndex = (currentIndex - 1 + PHASE_ORDER.length) % PHASE_ORDER.length;
    setGamePhase(PHASE_ORDER[prevIndex]);
  };

  
  
  // 📺 페이즈 렌더러
  const renderPhase = () => {
    const commonProps = {
      users: players,
      isHost,
      maxStorytellers,
      TEST_MODE,
      setUsers: setPlayers,
      roomId
    };

   // ⭐️ 1. 턴(글쓰기) 페이즈 처리
    // TURN1 ~ TURN8은 모두 WritingPhase를 사용하되, prop으로 몇 턴인지 넘겨줌
    if (gamePhase.startsWith('TURN')) {
        return <WritingPhase currentRound={gamePhase} />;
    }

    // ⭐️ 2. 나머지 페이즈 처리
    switch (gamePhase) {
      case 'LOBBY': 
        return <LobbyPhase {...commonProps} />;
      
      case 'CARD_SHUFFLE': 
        // onFinish 삭제! (시간 지나면 서버가 바꿔줌)
        return <CardShufflePhase />; 
      
      case 'JUDGE_SHUFFLE': 
        // onFinish 삭제!
        return <JudgeShufflePhase />;
      
      // case 'WRITING': (이제 안 씀. 위 if문에서 처리됨)

      case 'STORY':
         // TODO: 스토리 낭독 컴포넌트 추가 필요
         return <div className="text-white text-3xl font-bold flex justify-center items-center h-full">📖 스토리 낭독 시간 (개발중)</div>;

      case 'VOTING': return <VotingPhase />;
      case 'JUDGE_RESULT': return <JudgeResultPhase />;
      case 'FINAL_RESULT': return <FinalResultPhase />;
      
      default: return <div className="text-white flex items-center justify-center h-full">로딩 중... ({gamePhase})</div>;
    }
  };

  return (
    // 🏟️ [전체 컨테이너]
    <div className={styles.container}>

      {/* 1️⃣ 상단 정보 바 (Header) + 🛠️ Dev Controls */}
      {/* 개발자 바가 켜져있을 때만 렌더링 */}
      {isDevExpanded ? (
        <header className={styles.header}>
          {/* 1. 좌측 로고 영역 */}
          <div className={styles.headerLeft}>
            <span className={styles.logo}>✨ STORY GAME</span>
          </div>

          {/* 2. 중앙 닫기 핸들 (헤더 상단에 붙음) */}
          <button
            onClick={() => setIsDevExpanded(false)}
            className={styles.closeHandleBtn}
            title="접기"
          >
            ▲
          </button>

          {/* 3. 중앙 개발자 컨트롤 패널 */}
          <div className={styles.devControlPanel}>
            <button
              onClick={handlePrevPhase}
              className={`${styles.btnBase} ${styles.navBtn}`}
              title="이전 단계"
            >
              ⏮ Prev
            </button>

            <div className={styles.statusDisplay}>
              <span className={styles.statusLabel}>CURRENT</span>
              <span className={styles.statusValue}>{gamePhase}</span>
            </div>

            <button
              onClick={handleNextPhase}
              className={`${styles.btnBase} ${styles.nextBtn}`}
              title="다음 단계"
            >
              Next ⏭
            </button>

            <div className={styles.divider}></div>

            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`${styles.btnBase} ${styles.autoBtn} ${isAutoPlay ? styles.autoOn : styles.autoOff}`}
              title={isAutoPlay ? "자동 진행 ON (끝나면 넘어감)" : "자동 진행 OFF (일시정지)"}
            >
              {isAutoPlay ? "▶ Auto" : "⏸ Pause"}
            </button>
          </div>
        </header>
      ) : (
        /* 개발자 바가 꺼져있을 때: 중앙 상단 플로팅 핸들만 표시 */
        <button
          onClick={() => setIsDevExpanded(true)}
          className={styles.floatingToggleBtn}
          title="개발자 도구 (펼치기)"
        >
          🛠️ DEV
        </button>
      )}

      {/* 2️⃣ ⭐️ [핵심] 게임 메인 무대 (Main Stage) */}
      <main className={styles.main}>
        {renderPhase()}
      </main>
    </div>
  );
};

export default GameRoom;
