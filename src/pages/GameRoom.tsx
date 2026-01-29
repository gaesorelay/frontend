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

// 더미 데이터 프로필 이미지
import dog1 from '@/assets/dog/dog1.png';

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
  const [users, setUsers] = useState<any[]>(TEST_MODE ? generateMockUsers() : []);

  // 📡 소켓 리스너
  useEffect(() => {
    setGamePhase('LOBBY');
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
      default: return <div className="text-white flex items-center justify-center h-full">로딩 중... ({gamePhase})</div>;
    }
  };

  return (
    // 🏟️ [전체 컨테이너] flex-col 적용 (세로 배치)
    <div className="w-full h-screen bg-gray-900 flex flex-col overflow-hidden relative">

      {/* 1️⃣ 상단 정보 바 (Header) */}
      {/* shrink-0: 공간이 부족해도 찌그러지지 않음 */}
      <header className="w-full h-12 bg-black/60 flex items-center justify-between px-4 text-white text-xs z-50 shrink-0 border-b border-white/10 backdrop-blur-sm">
        <span className="font-bold text-lg">✨ STORY GAME</span>
        <span>{isHost ? "👑 HOST" : "🏃 GUEST"} | Room: {roomId} | Users: {users.length}</span>
      </header>

      {/* 2️⃣ ⭐️ [핵심] 게임 메인 무대 (Main Stage) */}
      {/* flex-1: 남은 공간을 꽉 채움 */}
      {/* relative: 자식 컴포넌트가 absolute를 쓸 때 기준점이 됨 */}
      <main className="flex-1 w-full relative overflow-hidden bg-green-800 z-0">
        {renderPhase()}
      </main>

      {/* 3️⃣ 개발자 리모콘 (Overlay) */}
      <div className="fixed bottom-4 right-4 bg-black/70 p-4 rounded-xl z-[100] flex flex-col gap-2 border border-white/10 backdrop-blur-md shadow-2xl">
        <p className="text-white text-xs font-bold text-center mb-2">🚧 Dev Controls</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => devSwitchPhase('LOBBY')} className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-500 transition">Lobby</button>
          <button onClick={() => devSwitchPhase('CARD_SHUFFLE')} className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-500 transition">Card Shuffle</button>
          <button onClick={() => devSwitchPhase('JUDGE_SHUFFLE')} className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-500 transition">Judge Shuffle</button>
          <button onClick={() => devSwitchPhase('WRITING')} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-500 transition">Writing</button>
          <button onClick={() => devSwitchPhase('VOTING')} className="px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-500 transition">Voting</button>
          <button onClick={() => devSwitchPhase('JUDGE_RESULT')} className="px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-500 transition">Round Result</button>
          <button onClick={() => devSwitchPhase('FINAL_RESULT')} className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-500 transition">Final Result</button>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;