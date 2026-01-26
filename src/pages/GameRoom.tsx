import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { useUserStore } from '../store/useUserStore';
import { socket } from '@/lib/socket'; 
import { TeamSlot } from '../components/game/TeamSlot';
import Modal from '../components/common/Modal';

// 🛠️ [디자인용] 테스트 모드
const TEST_MODE = true; 

const GameRoom = () => {
  const { roomId } = useParams();
  
  // 1. 내 정보 가져오기 (Setup에서 설정한 값)
  const { nickname: myNickname, avatarId: myAvatarId } = useUserStore();
  const { roomConfig } = useGameStore();
  
  // ⭐️ [핵심] 방장 여부 판별
  // CreatePage를 거쳐서 roomConfig가 있으면 방장, 아니면(새로고침 등) 참가자
  const isHost = !!roomConfig; 

  const maxStorytellers = roomConfig?.storytellerCount || 4; 
  const roomTitle = roomConfig?.title || (isHost ? "내가 만든 방 👑" : "남의 방 구경 중 👀");

  // =========================================================
  // 🧪 [가짜 데이터 생성기]
  // =========================================================
  const generateMockUsers = () => {
    const baseUsers = [
      { userToken: 'u1', nickname: '멍멍이1', role: 'AUDIENCE', isHost: false, avatarId: 2, avatar: '🐕' },
      { userToken: 'u2', nickname: '멍멍이2', role: 'AUDIENCE', isHost: false, avatarId: 3, avatar: '🐩' },
      { userToken: 'u3', nickname: '멍멍이3', role: 'AUDIENCE', isHost: false, avatarId: 4, avatar: '🌭' },
      // 이미 자리를 차지한 다른 플레이어들
      { userToken: 'p2', nickname: '고인물', role: 'PLAYER', team: 'A', slotIndex: 1, isHost: false, avatarId: 5, avatar: '🐯' },
      { userToken: 'p3', nickname: '뉴비', role: 'PLAYER', team: 'B', slotIndex: 0, isHost: false, avatarId: 3, avatar: '🐻' },
    ];

    // ⭐️ 만약 내가 방장이라면, 나를 리스트에 포함시켜야 함! (안 그러면 내가 누군지 모름)
    if (isHost) {
      baseUsers.push({
        userToken: 'me_host_token',
        nickname: myNickname || '나(방장)',
        role: 'PLAYER', // 방장은 일단 플레이어로 시작한다고 가정
        team: 'A',
        slotIndex: 0,   // A팀 0번 자리에 착석
        isHost: true,
        avatarId: myAvatarId,
        avatar: '🦁'
      });
    }

    return baseUsers;
  };

  // 유저 리스트 상태
  const [users, setUsers] = useState<any[]>(TEST_MODE ? generateMockUsers() : []); 
  const [targetSlot, setTargetSlot] = useState<{ team: 'A' | 'B', index: number } | null>(null);
  const [selectedAudience, setSelectedAudience] = useState<any | null>(null);

  useEffect(() => {
    if (TEST_MODE) return; 

    // 실제 소켓 모드일 때
    socket.on('user_list_update', (updatedUsers) => {
      setUsers(updatedUsers);
    });
    return () => {
      socket.off('user_list_update');
    };
  }, []);

  // =========================================================
  // 🎮 액션 핸들러
  // =========================================================

  // [방장 전용] 랜덤 배정
  const handleRandomAssign = () => {
    if (!isHost) return; // 방장 아니면 동작 안 함

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
      setUsers(newUsers);
      return;
    }
    socket.emit('shuffle_teams', { roomId });
  };

  // [공통] 슬롯 클릭 핸들러
  const handleSlotClick = (teamType: 'A' | 'B', slotIndex: number) => {
    const userInSlot = users.find(u => u.role === 'PLAYER' && u.team === teamType && u.slotIndex === slotIndex);

    // ------------------------------------------
    // 👑 Case 1: 방장이 클릭했을 때
    // ------------------------------------------
    if (isHost) {
      // 1-1. 사람이 있으면 -> 내보내기/강퇴 팝업
      if (userInSlot) {
        if (!window.confirm(`${userInSlot.nickname}님을 관전석으로 보낼까요?`)) return;
        
        if (TEST_MODE) {
          setUsers(users.map(u => u.userToken === userInSlot.userToken ? { ...u, role: 'AUDIENCE', team: null, slotIndex: null } : u));
        } else {
          socket.emit('change_role', { targetUserToken: userInSlot.userToken, role: 'AUDIENCE' });
        }
        return;
      }
      
      // 1-2. 빈 자리면 -> 선수 선발 모달 열기
      setTargetSlot({ team: teamType, index: slotIndex });
      return;
    }

    // ------------------------------------------
    // 🏃 Case 2: 참가자(Guest)가 클릭했을 때
    // ------------------------------------------
    if (!isHost) {
      // 2-1. 이미 누가 있으면 -> 아무것도 못함 (혹은 정보보기)
      if (userInSlot) {
        // 내 자리라면 나갈지 물어볼 수도 있음 (생략)
        return; 
      }

      // 2-2. 빈 자리면 -> "내가 들어갈까?" 물어보기 ⭐️
      if (!window.confirm(`${teamType}팀 ${slotIndex + 1}번 자리에 참가하시겠습니까?`)) return;

      if (TEST_MODE) {
        // [테스트용] 나를 만들어서 그 자리에 넣음
        // 이미 내가 리스트에 있다면(관전자였다면) 위치만 이동
        const myToken = 'me_guest_token';
        const amIAlreadyIn = users.find(u => u.userToken === myToken);

        if (amIAlreadyIn) {
          // 이미 있는데 자리만 옮김
          setUsers(users.map(u => u.userToken === myToken ? { ...u, role: 'PLAYER', team: teamType, slotIndex: slotIndex } : u));
        } else {
          // 리스트에 없으면 새로 추가 (입장)
          const me = {
            userToken: myToken,
            nickname: myNickname || "나(게스트)",
            role: 'PLAYER',
            team: teamType,
            slotIndex: slotIndex,
            isHost: false,
            avatarId: myAvatarId || 1,
            avatar: '🐣'
          };
          setUsers([...users, me]);
        }
      } else {
        // 실제 서버 요청
        socket.emit('change_role', { role: 'PLAYER', team: teamType, slotIndex: slotIndex });
      }
    }
  };

  // [방장 전용] 관전자 이동
  const moveUserToTeam = (teamType: 'A' | 'B') => {
    if (!selectedAudience || !isHost) return;

    let emptyIndex = -1;
    for (let i = 0; i < maxStorytellers; i++) {
      if (!users.find(u => u.role === 'PLAYER' && u.team === teamType && u.slotIndex === i)) {
        emptyIndex = i;
        break;
      }
    }
    if (emptyIndex === -1) return alert("빈 자리가 없어요!");

    if (TEST_MODE) {
      setUsers(users.map(u => u.userToken === selectedAudience.userToken ? { ...u, role: 'PLAYER', team: teamType, slotIndex: emptyIndex } : u));
      setSelectedAudience(null);
      return;
    }
    socket.emit('change_role', { targetUserToken: selectedAudience.userToken, role: 'PLAYER', team: teamType, slotIndex: emptyIndex });
    setSelectedAudience(null);
  };

  // [방장 전용] 강퇴
  const handleKickUser = () => {
    if (!selectedAudience || !isHost) return;
    if (!window.confirm(`${selectedAudience.nickname}님을 강퇴하시겠습니까?`)) return;

    if (TEST_MODE) {
      setUsers(users.filter(u => u.userToken !== selectedAudience.userToken));
      setSelectedAudience(null);
    } else {
      socket.emit('kick_user', { targetUserToken: selectedAudience.userToken });
    }
  };

  // [방장 전용] 모달에서 선수 선발
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

  // 🖥️ 렌더링 헬퍼
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
        {/* 방장일 때만 랜덤 버튼 표시 */}
        {isHost && (
          <div className="absolute left-1/2 top-10 transform -translate-x-1/2 z-20">
            <button onClick={handleRandomAssign} className="bg-amber-500 hover:bg-amber-600 text-white font-black text-xl px-8 py-3 rounded-full shadow-[0_4px_0_#b45309] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2">
              🎲 랜덤 배정
            </button>
          </div>
        )}

        {/* TEAM A */}
        <div className="bg-white/10 p-6 rounded-3xl border-4 border-blue-400 flex flex-col items-center gap-4 w-1/2 h-[500px]">
          <h2 className="text-4xl font-black text-blue-200 drop-shadow-md">TEAM A</h2>
          <div className="grid grid-cols-4 gap-4 w-full place-items-center">{renderSlots('A')}</div>
        </div>

        <div className="text-6xl font-black text-white italic drop-shadow-lg">VS</div>

        {/* TEAM B */}
        <div className="bg-white/10 p-6 rounded-3xl border-4 border-red-400 flex flex-col items-center gap-4 w-1/2 h-[500px]">
          <h2 className="text-4xl font-black text-red-200 drop-shadow-md">TEAM B</h2>
          <div className="grid grid-cols-4 gap-4 w-full place-items-center">{renderSlots('B')}</div>
        </div>
      </div>

      {/* 하단 관전자 리스트 */}
      <div className="w-full h-48 bg-black/40 backdrop-blur-md border-t-4 border-amber-600 flex flex-col p-4">
        <h3 className="text-white font-bold mb-2 ml-2">Waiting List ({audienceList.length}명)</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2 items-center h-full">
          {audienceList.map((user) => (
            <button
              key={user.userToken}
              // 방장만 클릭해서 관리 가능
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

      {/* 모달들 (방장만 보임) */}
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

export default GameRoom;