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

// 🛠️ [디자인용] 테스트 모드 (여기서 관리)
const TEST_MODE = true;

export type GamePhase = 'LOBBY' | 'CARD_SHUFFLE' | 'JUDGE_SHUFFLE' | 'WRITING' | 'VOTING' | 'JUDGE_RESULT' | 'FINAL_RESULT';

const GameRoom = () => {
  const { roomId } = useParams();
  
  // 1. 스토어 데이터
  const { nickname: myNickname, avatarId: myAvatarId } = useUserStore();
  const { roomConfig, gamePhase, setGamePhase, setRoundData } = useGameStore();

  // ⭐️ 권한 체크 (여기서 한 번만 해서 내려줌)
  const isHost = TEST_MODE || !!roomConfig;
  const maxStorytellers = roomConfig?.storytellerCount || 4;

  // =========================================================
  // 🧪 [테스트 데이터 생성기] (GameRoom으로 이사 옴)
  // =========================================================
  const generateMockUsers = () => {
    const baseUsers = [
      { userToken: 'u1', nickname: '멍멍이1', role: 'AUDIENCE', isHost: false, avatarId: 2, avatar: '🐕' },
      { userToken: 'u2', nickname: '멍멍이2', role: 'AUDIENCE', isHost: false, avatarId: 3, avatar: '🐩' },
      { userToken: 'u3', nickname: '멍멍이3', role: 'AUDIENCE', isHost: false, avatarId: 4, avatar: '🌭' },
      { userToken: 'p2', nickname: '고인물', role: 'PLAYER', team: 'A', slotIndex: 1, isHost: false, avatarId: 5, avatar: '🐯' },
      { userToken: 'p3', nickname: '뉴비', role: 'PLAYER', team: 'B', slotIndex: 0, isHost: false, avatarId: 3, avatar: '🐻' },
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

  // ⭐️ 유저 상태 관리 (Global State 성격)
  const [users, setUsers] = useState<any[]>(TEST_MODE ? generateMockUsers() : []);

  // 📡 소켓 리스너 (여기서 받아야 페이즈가 바뀌어도 유지됨!)
  useEffect(() => {
    if (TEST_MODE) return;

    // 유저 리스트 업데이트
    socket.on('user_list_update', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    // 페이즈 변경 신호
    socket.on('change_phase', (response) => {
      const { phase, data } = response;
      if (data) setRoundData(data);
      setGamePhase(phase);
    });

    return () => {
      socket.off('user_list_update');
      socket.off('change_phase');
    };
  }, []);

  // 🛠️ [개발용] 화면 강제 전환
  const devSwitchPhase = (phase: GamePhase) => {
    setGamePhase(phase);
  };

  // 📺 페이즈 렌더러 (Props로 데이터 내려주기!)
  const renderPhase = () => {
    // ⭐️ 모든 페이즈가 공유할 데이터 패키지
    const commonProps = {
      users,           // 유저 리스트 (가장 중요)
      isHost,          // 방장 권한
      maxStorytellers, // 설정값
      TEST_MODE,       // 테스트 모드 여부
      setUsers,        // (테스트용) 상태 변경 함수
      roomId           // 방 ID
    };

    switch (gamePhase) {
      case 'LOBBY':
        return <LobbyPhase {...commonProps} />; // 👈 Props 전달

      case 'CARD_SHUFFLE':
        return <CardShufflePhase onFinish={() => setGamePhase('JUDGE_SHUFFLE')} />;
      
      case 'JUDGE_SHUFFLE':
        return <JudgeShufflePhase onFinish={() => setGamePhase('WRITING')} />;
      
      case 'WRITING':
        return <WritingPhase />;
        
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

      {/* 개발자 리모콘 */}
      <div className="fixed bottom-4 right-4 bg-black/70 p-4 rounded-xl z-50 flex flex-col gap-2">
        <p className="text-white text-xs font-bold text-center mb-2">🚧 Dev Controls</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => devSwitchPhase('LOBBY')} className="px-2 py-1 bg-gray-600 text-white text-xs rounded">Lobby</button>
          <button onClick={() => devSwitchPhase('CARD_SHUFFLE')} className="px-2 py-1 bg-blue-600 text-white text-xs rounded">Card Shuffle</button>
          <button onClick={() => devSwitchPhase('JUDGE_SHUFFLE')} className="px-2 py-1 bg-blue-600 text-white text-xs rounded">Judge Shuffle</button>
          <button onClick={() => devSwitchPhase('WRITING')} className="px-2 py-1 bg-green-600 text-white text-xs rounded">Writing</button>
          <button onClick={() => devSwitchPhase('VOTING')} className="px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-500">Voting</button>
          <button onClick={() => devSwitchPhase('JUDGE_RESULT')} className="px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-500">Round Result</button>
          <button onClick={() => devSwitchPhase('FINAL_RESULT')} className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-500">Final Result</button> 
        </div>
      </div>
    </div>
  );
};

export default GameRoom;