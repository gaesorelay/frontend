import { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useUserStore } from '@/store/useUserStore'; // 내 닉네임 가져오기용
import { socket } from '@/lib/socket'; 
import { TeamSlot } from '@/components/game/TeamSlot';
import Modal from '@/components/common/Modal';

// ⭐️ 부모(GameRoom)에게 받을 데이터 타입 정의
interface LobbyProps {
  users: any[];
  isHost: boolean;
  maxStorytellers: number;
  TEST_MODE: boolean;
  setUsers: (users: any[]) => void; // 테스트용 상태 변경
  roomId: string | undefined;
}

const LobbyPhase = ({ users, isHost, maxStorytellers, TEST_MODE, setUsers, roomId }: LobbyProps) => {
  const { roomConfig } = useGameStore();
  const { nickname: myNickname, avatarId: myAvatarId } = useUserStore(); // Guest 입장 테스트용

  const roomTitle = roomConfig?.title || (isHost ? "내가 만든 방 👑" : "남의 방 구경 중 👀");

  // 로비 전용 UI 상태 (모달 등)는 여기서 관리해도 OK
  const [targetSlot, setTargetSlot] = useState<{ team: 'A' | 'B', index: number } | null>(null);
  const [selectedAudience, setSelectedAudience] = useState<any | null>(null);

  // =========================================================
  // 🎮 액션 핸들러 (users는 props.users를 사용!)
  // =========================================================

  const handleRandomAssign = () => {
    if (!isHost) return;

    if (TEST_MODE) {
      const newUsers = [...users];
      const audience = newUsers.filter(u => u.role === 'AUDIENCE');
      
      const fillTeam = (team: string) => {
        for (let i = 0; i < maxStorytellers; i++) {
          if (!newUsers.find(u => u.role === 'PLAYER' && u.team === team && u.slotIndex === i) && audience.length) {
            const target = audience.pop();
            if (target) { target.role = 'PLAYER'; target.team = team; target.slotIndex = i; }
          }
        }
      };
      fillTeam('A');
      fillTeam('B');
      setUsers(newUsers); // 부모의 state를 변경
      return;
    }
    socket.emit('shuffle_teams', { roomId });
  };

  const handleSlotClick = (teamType: 'A' | 'B', slotIndex: number) => {
    const userInSlot = users.find(u => u.role === 'PLAYER' && u.team === teamType && u.slotIndex === slotIndex);

    // [방장]
    if (isHost) {
      if (userInSlot) {
        if (!window.confirm(`${userInSlot.nickname}님을 관전석으로 보낼까요?`)) return;
        if (TEST_MODE) {
          setUsers(users.map(u => u.userToken === userInSlot.userToken ? { ...u, role: 'AUDIENCE', team: null, slotIndex: null } : u));
        } else {
          socket.emit('change_role', { targetUserToken: userInSlot.userToken, role: 'AUDIENCE' });
        }
        return;
      }
      setTargetSlot({ team: teamType, index: slotIndex });
      return;
    }

    // [게스트]
    if (!isHost) {
      if (userInSlot) return; 
      if (!window.confirm(`${teamType}팀 ${slotIndex + 1}번 자리에 참가하시겠습니까?`)) return;

      if (TEST_MODE) {
        // 테스트용: Guest인 나를 생성해서 넣음
        const myToken = 'me_guest_token';
        const amIAlreadyIn = users.find(u => u.userToken === myToken);

        if (amIAlreadyIn) {
          setUsers(users.map(u => u.userToken === myToken ? { ...u, role: 'PLAYER', team: teamType, slotIndex: slotIndex } : u));
        } else {
          const me = {
            userToken: myToken,
            nickname: myNickname || "나(게스트)",
            role: 'PLAYER', team: teamType, slotIndex: slotIndex,
            isHost: false, avatarId: myAvatarId || 1, avatar: '🐣'
          };
          setUsers([...users, me]);
        }
      } else {
        socket.emit('change_role', { role: 'PLAYER', team: teamType, slotIndex: slotIndex });
      }
    }
  };

  const moveUserToTeam = (teamType: 'A' | 'B') => {
    if (!selectedAudience || !isHost) return;
    let emptyIndex = -1;
    for (let i = 0; i < maxStorytellers; i++) {
      if (!users.find(u => u.role === 'PLAYER' && u.team === teamType && u.slotIndex === i)) {
        emptyIndex = i; break;
      }
    }
    if (emptyIndex === -1) return alert("빈 자리가 없어요!");

    if (TEST_MODE) {
      setUsers(users.map(u => u.userToken === selectedAudience.userToken ? { ...u, role: 'PLAYER', team: teamType, slotIndex: emptyIndex } : u));
    } else {
      socket.emit('change_role', { targetUserToken: selectedAudience.userToken, role: 'PLAYER', team: teamType, slotIndex: emptyIndex });
    }
    setSelectedAudience(null);
  };

  const handleKickUser = () => {
    if (!selectedAudience || !isHost) return;
    if (!window.confirm(`${selectedAudience.nickname}님을 강퇴하시겠습니까?`)) return;

    if (TEST_MODE) {
      setUsers(users.filter(u => u.userToken !== selectedAudience.userToken));
    } else {
      socket.emit('kick_user', { targetUserToken: selectedAudience.userToken });
    }
    setSelectedAudience(null);
  };

  const handleSelectPlayer = (user: any) => {
    if (!targetSlot || !isHost) return;
    const { team, index } = targetSlot;

    if (TEST_MODE) {
      setUsers(users.map(u => u.userToken === user.userToken ? { ...u, role: 'PLAYER', team: team, slotIndex: index } : u));
    } else {
      socket.emit('change_role', { targetUserToken: user.userToken, role: 'PLAYER', team: team, slotIndex: index });
    }
    setTargetSlot(null);
  };

  const renderSlots = (teamType: 'A' | 'B') => {
    return Array.from({ length: maxStorytellers }).map((_, i) => {
      const user = users.find(u => u.role === 'PLAYER' && u.team === teamType && u.slotIndex === i);
      return <TeamSlot key={i} status={user ? "FILLED" : "EMPTY"} user={user} onClick={() => handleSlotClick(teamType, i)} />;
    });
  };

  const audienceList = users.filter(u => u.role === 'AUDIENCE');

  return (
    <div className="min-h-screen bg-green-800 flex flex-col items-center overflow-hidden relative">
      <div className="w-full bg-black/30 p-4 text-white flex justify-between items-center backdrop-blur-sm z-10">
        <h1 className="text-2xl font-bold font-jua">{roomTitle}</h1>
        {TEST_MODE && <span className="text-yellow-300 text-sm font-bold animate-pulse">🚧 디자인 테스트 모드 🚧</span>}
        {isHost ? (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">HOST</span>
        ) : (
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded font-bold">GUEST</span>
        )}
      </div>

      <div className="flex-1 w-full max-w-6xl flex justify-between items-center px-10 gap-10 relative">
        {isHost && (
          <div className="absolute left-1/2 top-10 transform -translate-x-1/2 z-20">
            <button onClick={handleRandomAssign} className="bg-amber-500 hover:bg-amber-600 text-white font-black text-xl px-8 py-3 rounded-full shadow-[0_4px_0_#b45309] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2">
              🎲 랜덤 배정
            </button>
          </div>
        )}

        <div className="bg-white/10 p-6 rounded-3xl border-4 border-blue-400 flex flex-col items-center gap-4 w-1/2 h-[500px]">
          <h2 className="text-4xl font-black text-blue-200 drop-shadow-md">TEAM A</h2>
          <div className="grid grid-cols-4 gap-4 w-full place-items-center">{renderSlots('A')}</div>
        </div>

        <div className="text-6xl font-black text-white italic drop-shadow-lg">VS</div>

        <div className="bg-white/10 p-6 rounded-3xl border-4 border-red-400 flex flex-col items-center gap-4 w-1/2 h-[500px]">
          <h2 className="text-4xl font-black text-red-200 drop-shadow-md">TEAM B</h2>
          <div className="grid grid-cols-4 gap-4 w-full place-items-center">{renderSlots('B')}</div>
        </div>
      </div>

      <div className="w-full h-48 bg-black/40 backdrop-blur-md border-t-4 border-amber-600 flex flex-col p-4">
        <h3 className="text-white font-bold mb-2 ml-2">Waiting List ({audienceList.length}명)</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2 items-center h-full">
          {audienceList.map((user) => (
            <button
              key={user.userToken}
              onClick={() => isHost && setSelectedAudience(user)}
              disabled={!isHost}
              className={`flex flex-col items-center min-w-[70px] transition group relative ${isHost ? 'cursor-pointer hover:-translate-y-2' : 'cursor-default'}`}
            >
              <div className="w-16 h-16 bg-white rounded-full border-4 border-gray-400 flex items-center justify-center text-3xl shadow-lg group-hover:border-amber-400">
                {user.avatar}
              </div>
              <span className="text-white text-xs mt-2 font-bold bg-black/50 px-2 py-1 rounded-full truncate max-w-[80px]">{user.nickname}</span>
            </button>
          ))}
        </div>
      </div>

      {isHost && (
        <>
          <Modal isOpen={!!selectedAudience} onClose={() => setSelectedAudience(null)}>
            <div className="text-center space-y-4">
              <div className="text-6xl mb-2">{selectedAudience?.avatar}</div>
              <h2 className="text-2xl font-bold text-gray-800">
                <span className="text-amber-600">{selectedAudience?.nickname}</span>님을<br/>어떻게 할까요?
              </h2>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={() => moveUserToTeam('A')} className="py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 shadow-md">🟦 A팀 배정</button>
                <button onClick={() => moveUserToTeam('B')} className="py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 shadow-md">🟥 B팀 배정</button>
                <button onClick={handleKickUser} className="col-span-2 py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-black border-2 border-red-500 shadow-md transition-colors">🚪 강퇴하기</button>
              </div>
            </div>
          </Modal>

          <Modal isOpen={!!targetSlot} onClose={() => setTargetSlot(null)}>
            <div className="text-center w-full max-w-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                <span className="text-blue-600">{targetSlot?.team}팀</span> 
                <span className="text-amber-600 mx-2">{targetSlot ? targetSlot.index + 1 : 0}번 자리</span>에<br/>누구를 앉힐까요?
              </h2>
              <div className="grid grid-cols-4 gap-4 max-h-60 overflow-y-auto p-2">
                {users.filter(u => u.role === 'AUDIENCE').map((user) => (
                  <button key={user.userToken} onClick={() => handleSelectPlayer(user)} className="flex flex-col items-center group hover:bg-gray-100 p-2 rounded-xl transition">
                    <div className="text-4xl mb-1 group-hover:scale-110 transition-transform">{user.avatar}</div>
                    <span className="text-xs font-bold text-gray-600 bg-gray-200 px-2 py-1 rounded-full truncate w-full">{user.nickname}</span>
                  </button>
                ))}
                {users.filter(u => u.role === 'AUDIENCE').length === 0 && <div className="col-span-4 text-gray-400 py-4">대기 중인 사람이 없습니다 텅~ 🍃</div>}
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default LobbyPhase;