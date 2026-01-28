import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';
import { useUserStore } from '@/store/useUserStore';
import { socket } from '@/lib/socket';

// 페이즈 컴포넌트들 Import
import LobbyPhase from '@/components/game/phases/LobbyPhase';
import CardShufflePhase from '@/components/game/phases/CardShufflePhase';
import JudgeShufflePhase from '@/components/game/phases/JudgeShufflePhase';
import WritingPhase from '@/components/game/phases/WritingPhase';
import VotingPhase from '@/components/game/phases/VotingPhase';
import JudgeResultPhase from '@/components/game/phases/JudgeResultPhase';
import FinalResultPhase from '@/components/game/phases/FinalResultPhase';

// 🛠️ [중요] 배포/실전 테스트 시에는 반드시 false로 설정!
const TEST_MODE = false; 

export type GamePhase = 'LOBBY' | 'CARD_SHUFFLE' | 'JUDGE_SHUFFLE' | 'WRITING' | 'VOTING' | 'JUDGE_RESULT' | 'FINAL_RESULT';

const GameRoom = () => {
  const { roomId } = useParams();
  
  // 1. 스토어 데이터
  // ⭐️ [수정] useUserStore에서 isHost 정보를 정확하게 가져옵니다.
  const { nickname: myNickname, avatarId: myAvatarId, isHost: isMyHost } = useUserStore();
  const { roomConfig, gamePhase, setGamePhase, setRoundData, setRoomInfo, setPlayers } = useGameStore();

  // ⭐️ 권한 체크: 테스트 모드이거나, 내 스토어에 저장된 신분이 Host일 때
  const isHost = TEST_MODE || isMyHost;
  
  // 게스트는 roomConfig가 아직 없을 수 있으므로 기본값(4) 처리
  const maxStorytellers = roomConfig?.storytellerCount || 4;

  // =========================================================
  // 🧪 [테스트 데이터 생성기]
  // =========================================================
  const generateMockUsers = () => {
    // ... (기존 mock 데이터 로직 유지 - 테스트할 때만 쓰임)
    return [];
  };

  // ⭐️ 유저 상태 관리
  // TEST_MODE가 꺼져있으면 빈 배열([])로 시작해서 소켓 데이터를 기다립니다.
  const [users, setUsers] = useState<any[]>(TEST_MODE ? generateMockUsers() : []);

  // 📡 소켓 리스너
  useEffect(() => {
    if (TEST_MODE) return;

    console.log(`🔌 GameRoom 소켓 리스너 연결 (Room: ${roomId})`);

    // 1. 방 정보 요청 (게스트는 들어오자마자 이게 필요함)
    socket.emit('request_room_info', { roomId });

    // 2. [수신] 유저 리스트 업데이트 (입장/퇴장/팀변경 시)
    socket.on('lobby_updated', (data) => {
      console.log("👥 로비 업데이트:", data);
      setUsers(data.users); 
      // 만약 data.roomConfig 등 방 정보도 같이 온다면 여기서 setRoomInfo 업데이트
    });
    
    // (구버전 호환)
    socket.on('user_joined', (_data) => {
        // user_joined만 오면 전체 리스트를 모르니, 다시 리스트 요청
        socket.emit('request_room_info', { roomId });
    });

    // 3. [수신] 페이즈 변경
    socket.on('change_phase', (response) => {
      const { phase, data } = response;
      if (data) setRoundData(data);
      setGamePhase(phase);
    });

    return () => {
      socket.off('lobby_updated');
      socket.off('user_joined');
      socket.off('change_phase');
    };
  }, [roomId]);

  // 🛠️ [개발용] 화면 강제 전환
  const devSwitchPhase = (phase: GamePhase) => {
    setGamePhase(phase);
  };

  // 📺 페이즈 렌더러
  const renderPhase = () => {
    const commonProps = {
      users,
      isHost, 
      maxStorytellers,
      TEST_MODE,
      setUsers,
      roomId
    };

    switch (gamePhase) {
      case 'LOBBY': return <LobbyPhase {...commonProps} />;
      case 'CARD_SHUFFLE': return <CardShufflePhase onFinish={() => setGamePhase('JUDGE_SHUFFLE')} />;
      case 'JUDGE_SHUFFLE': return <JudgeShufflePhase onFinish={() => setGamePhase('WRITING')} />;
      case 'WRITING': return <WritingPhase />;
      case 'VOTING': return <VotingPhase />;
      case 'JUDGE_RESULT': return <JudgeResultPhase />;
      case 'FINAL_RESULT': return <FinalResultPhase />;
      default: return <div className="text-white">로딩 중... ({gamePhase})</div>;
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-green-800 relative">
      <div className="absolute top-0 left-0 bg-black/50 text-white text-xs p-2 z-50">
         {isHost ? "👑 HOST" : "🏃 GUEST"} | Room: {roomId} | Users: {users.length}
      </div>

      {renderPhase()}

      {/* 개발자 리모콘 (TEST_MODE일 때만 보이거나, 필요할 때만 주석 해제) */}
      {/* <div className="fixed bottom-4 right-4 ..."> ... </div> */}
    </div>
  );
};

export default GameRoom;