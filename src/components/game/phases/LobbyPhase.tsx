import { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useUserStore } from '@/store/useUserStore'; // 내 닉네임 가져오기용
import { socket } from '@/lib/socket'; 
import { TeamSlot } from '@/components/game/TeamSlot';
import { TeamBoard } from '@/components/game/TeamBoard';
import { AudienceList } from '@/components/game/AudienceList';
import { Background } from '@/components/common/background';

import Modal from '@/components/common/Modal';
import styles from '@/components/game/phases/LobbyPhase.module.css';
import { animationStyles } from '@/pages/create/createAnimations';

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
  
  const { nickname: myNickname, avatarId: myAvatarId } = useUserStore(); // Guest 입장 테스트용

  const { roomConfig, roomTitle } = useGameStore(); // 1. roomTitle을 스토어에서 직접 가져옴

  // 로비 전용 UI 상태 (모달 등)는 여기서 관리해도 OK
  const [targetSlot, setTargetSlot] = useState<{ team: 'A' | 'B', index: number } | null>(null);
  const [selectedAudience, setSelectedAudience] = useState<any | null>(null);
  const displayTitle = roomTitle || (isHost ? "내가 만든 방 👑" : "남의 방 구경 중 👀");
  const [isAudienceBarOpen, setIsAudienceBarOpen] = useState(true);

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
<Background>
      <div className={styles.container}>

        {/* 메인 콘텐츠 */}
        <div className={styles.contentWrapper}>
          <aside className={`${styles.audienceBar} ${isAudienceBarOpen ? styles.open : styles.closed}`}>
            <AudienceList 
              list={audienceList} 
              isHost={isHost} 
              onSelect={setSelectedAudience}
              onClose={() => setIsAudienceBarOpen(false)}
              />
          </aside>

          <button 
            onClick={() => setIsAudienceBarOpen(!isAudienceBarOpen)}
            className={styles.sidebarToggle}
            title={isAudienceBarOpen ? '닫기' : '관전자 목록'}
            >
            {isAudienceBarOpen ? '◀' : '▶'}
          </button>

          <main className={styles.mainBoard}>
            {/* 상단 헤더 */}
            <style>{animationStyles}</style>
            <header className={styles.header}>
              <img src="/src/assets/logo/lobby_logo.png" alt="Lobby Logo" className={styles.headerLogo} 
                style={{
                  animation: 'logoJitter 0.3s linear infinite'
                }}/>
              <div className={styles.headerLeft}>
                <h1 className={styles.roomTitle}>{roomTitle}</h1>
                <span className={isHost ? styles.badgeHost : styles.badgeGuest}>
                  {isHost ? 'HOST' : 'GUEST'}
                </span>
              </div>
              {/* {TEST_MODE && <div className={styles.testIndicator}>DESIGN TEST MODE</div>} */}
            </header>
            <div className={styles.gameArea}>
              <TeamBoard 
                teamName="A" 
                maxStorytellers={maxStorytellers} 
                renderSlots={(team) => Array.from({ length: maxStorytellers }).map((_, i) => {
                  const user = users.find(u => u.role === 'PLAYER' && u.team === team && u.slotIndex === i);
                  return <TeamSlot key={i} status={user ? "FILLED" : "EMPTY"} user={user} onClick={() => handleSlotClick(team, i)} />;
                })}
              />

              <div className={styles.vsText}>VS</div>

              <TeamBoard 
                teamName="B" 
                maxStorytellers={maxStorytellers} 
                renderSlots={(team) => Array.from({ length: maxStorytellers }).map((_, i) => {
                  const user = users.find(u => u.role === 'PLAYER' && u.team === team && u.slotIndex === i);
                  return <TeamSlot key={i} status={user ? "FILLED" : "EMPTY"} user={user} onClick={() => handleSlotClick(team, i)} />;
                })}
              />
            </div>
            {isHost && (
              <button onClick={handleRandomAssign} className={styles.randomButton}>
                🎲 랜덤 팀 배정
              </button>
            )}
          </main>
        </div>
      </div>

      {/* 모달들 (방장만 보임) */}
      {isHost && (
        <>
          <Modal isOpen={!!selectedAudience} onClose={() => setSelectedAudience(null)}>
            <div className={styles.modalContent}>
              <div className={styles.modalAvatar}>{selectedAudience?.avatar}</div>
              <h2 className={styles.modalTitle}>
                <span className={styles.modalTitleHighlight}>{selectedAudience?.nickname}</span>님을<br/>어떻게 할까요?
              </h2>
              <div className={styles.modalButtonGrid}>
                <button onClick={() => moveUserToTeam('A')} className={`${styles.modalButton} ${styles.buttonTeamA}`}>🟦 A팀 배정</button>
                <button onClick={() => moveUserToTeam('B')} className={`${styles.modalButton} ${styles.buttonTeamB}`}>🟥 B팀 배정</button>
                <button onClick={handleKickUser} className={`${styles.modalButton} ${styles.buttonKick}`}>🚪 강퇴하기</button>
              </div>
            </div>
          </Modal>

          <Modal isOpen={!!targetSlot} onClose={() => setTargetSlot(null)}>
            <div className={styles.targetSlotContent}>
              <h2 className={styles.targetSlotTitle}>
                <span className={styles.targetSlotTeamHighlight}>{targetSlot?.team}팀</span> 
                <span className={styles.targetSlotIndexHighlight}>{targetSlot ? targetSlot.index + 1 : 0}번 자리</span>에<br/>누구를 앉힐까요?
              </h2>
              <div className={styles.playerGrid}>
                {users.filter(u => u.role === 'AUDIENCE').map((user) => (
                  <button key={user.userToken} onClick={() => handleSelectPlayer(user)} className={styles.playerButton}>
                    <div className={styles.playerAvatar}>{user.avatar}</div>
                    <span className={styles.playerNickname}>{user.nickname}</span>
                  </button>
                ))}
                {users.filter(u => u.role === 'AUDIENCE').length === 0 && <div className={styles.emptyMessage}>대기 중인 사람이 없습니다 텅~ 🍃</div>}
              </div>
            </div>
          </Modal>
        </>
      )}
    </Background>
  );
};

export default LobbyPhase;