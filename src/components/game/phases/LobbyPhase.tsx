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

// 나가기 버튼
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoOut from '@/assets/logo/logo_out.png';
import logoSetting from '@/assets/logo/logo_setting.png';

// ⭐️ 부모(GameRoom)에게 받을 데이터 타입 정의
interface LobbyProps {
  users: any[];
  isHost: boolean;
  maxStorytellers: number;
  TEST_MODE: boolean;
  setUsers: (users: any[]) => void;
  roomId: string | undefined;
  // onStartGame?: () => void;
}

const LobbyPhase = ({ users, isHost, maxStorytellers, TEST_MODE, setUsers, roomId }: LobbyProps) => {
  console.log("🔍 유저 데이터 구조 확인:", users);
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
    socket.emit('auto_fill', { roomId });
  };

  const handleSlotClick = (teamType: 'A' | 'B', slotIndex: number) => {
    const userInSlot = users.find(u => u.role === 'PLAYER' && u.team === teamType && u.slotIndex === slotIndex);

    // [방장]
    // [CASE 1: 방장이 클릭]
    if (isHost) {
      if (userInSlot) {
        // 이미 사람이 있으면 -> 관전석으로 보내기 (Leave Team)
        if (!window.confirm(`${userInSlot.nickname}님을 관전석으로 보낼까요?`)) return;

        if (TEST_MODE) {
          setUsers(users.map(u => u.userToken === userInSlot.userToken ? { ...u, role: 'AUDIENCE', team: null, slotIndex: null } : u));
        } else {
          // ✅ [수정] leave_team 이벤트 전송
          socket.emit('leave_team', {
            public_user_id: userInSlot.publicUserId, // userToken 아님!
            team: teamType,
            slot_index: slotIndex
          });
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
        const me = users.find(u => u.nickname === myNickname);
        if (me) {
          // ✅ [수정] join_team 이벤트 전송
          socket.emit('join_team', {
            public_user_id: me.publicUserId,
            team: teamType,
            slot_index: slotIndex
          });
        } else {
          console.error("내 정보를 찾을 수 없습니다.");
        }
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
      // ✅ [수정] join_team 전송
      socket.emit('join_team', {
        public_user_id: selectedAudience.publicUserId, // 선택된 사람의 ID
        team: teamType,
        slot_index: emptyIndex
      });
    }
    setSelectedAudience(null);
  };

  const handleKickUser = () => {
    if (!selectedAudience || !isHost) return;
    if (!window.confirm(`${selectedAudience.nickname}님을 강퇴하시겠습니까?`)) return;

    if (TEST_MODE) {
      setUsers(users.filter(u => u.userToken !== selectedAudience.userToken));
    } else {
      socket.emit('kick_user', { targetUserToken: selectedAudience.publicUserId });
    }
    setSelectedAudience(null);
  };

  const handleSelectPlayer = (user: any) => {
    if (!targetSlot || !isHost) return;
    const { team, index } = targetSlot;

    if (TEST_MODE) {
      setUsers(users.map(u => u.userToken === user.userToken ? { ...u, role: 'PLAYER', team: team, slotIndex: index } : u));
    } else {
      // ✅ [수정] join_team 전송
      socket.emit('join_team', {
        public_user_id: user.publicUserId,
        team: team,
        slot_index: index
      });
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
  const [copied, setCopied] = useState(false);

  // 방 코드 복사
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(
        // `말이 되든 말든 이어가라! 개소릴레이 \n${roomTitle} 에서 너를 기다리고 있을개. 🐶 \n참여 코드 : ${roomId}`
        roomId
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // 2초 후 메시지 사라짐
    } catch (err) {
      console.error('복사 실패!', err);
    }
  };

  // 게임시작
  const handleStartGame = () => {
    console.log("🚀 게임 시작 버튼 클릭됨");
    if (!isHost) return;
    
    // (선택) 인원 수 체크 등을 여기서 미리 막아도 됨
    // const playerCnt = users.filter(u => u.role === 'PLAYER').length;
    // if (playerCnt < 4) return alert("플레이어가 부족합니다!");

    if (TEST_MODE) {
       // 테스트 모드면 바로 다음 페이즈로 강제 이동
       // (부모 GameRoom의 devSwitchPhase 등을 호출해야 하는데, 여기선 socket만 보냄)
       alert("테스트 모드: 개발자 컨트롤 패널을 이용하세요.");
    } else {
       // 📡 백엔드에 시작 신호 전송
       socket.emit('start_game', { roomId });
    }
  };


  // 나가기 처리
  const navigate = useNavigate();

  const handleExit = () => {
    if (window.confirm("정말 방에서 나가시겠어요? 🐾")) {
      navigate('/');
    }
  };

  const [isSettingOpen, setIsSettingOpen] = useState(false);

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
              {/* 1층: 유틸리티 라인 (로고, 코드, 나가기) */}
              <div className={styles.topRow}>
                <div className={styles.topLeft}>
                  <img src="/src/assets/logo/lobby_logo.png" alt="Logo" className={styles.headerLogo} />

                  <div className={styles.codeContainer} onClick={handleCopyCode}>
                    <div className={styles.tape}></div>
                    <div className={styles.codeBox}>
                      <span className={styles.codeLabel}>ROOM CODE</span>
                      <span className={styles.codeNumber}>{roomId}</span>
                      {copied && <div className={styles.copyTooltip}>복사 완료! ✨</div>}
                    </div>
                  </div>
                </div>

                <div className={styles.topRight}>
                  {isHost && (
                    <motion.button
                      className={styles.exitButton}
                      onClick={() => setIsSettingOpen(true)}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <img src={logoSetting} alt="Exit" className={styles.exitImg} />
                      <span className={styles.exitText}>설정</span>
                    </motion.button>
                  )}
                  <motion.button
                    className={styles.exitButton}
                    onClick={handleExit}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <img src={logoOut} alt="Exit" className={styles.exitImg} />
                    <span className={styles.exitText}>나가기</span>
                  </motion.button>
                </div>
              </div>

              {/* 2층: 방 제목 라인 (중앙 정렬) */}
              <div className={styles.bottomRow}>
                <div className={styles.titleWrapper}>
                  <h1 className={styles.roomTitle}>{roomTitle}</h1>
                </div>
              </div>

              {/* 🏠 설정 수정 모달 */}
              <Modal isOpen={isSettingOpen} onClose={() => setIsSettingOpen(false)}>
                <div className={styles.settingModalContent}>
                  <h2 className={styles.modalTitle}>방 설정 변경</h2>

                  <div className={styles.settingField}>
                    <label>방 제목</label>
                    <input
                      type="text"
                      defaultValue={roomTitle}
                      className={styles.settingInput}
                    />
                  </div>

                  <div className={styles.settingField}>
                    <label>최대 인원 (팀당)</label>
                    <div className={styles.counter}>
                      <button className={styles.countBtn}>-</button>
                      <span className={styles.countNum}>{maxStorytellers}명</span>
                      <button className={styles.countBtn}>+</button>
                    </div>
                  </div>

                  <div className={styles.modalActions}>
                    <button className={styles.saveButton} onClick={() => setIsSettingOpen(false)}>
                      변경사항 저장
                    </button>
                  </div>
                </div>
              </Modal>
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

              <div className={styles.vsContainer}>
                <div className={styles.vsCircle}></div> {/* 뒤에 깔리는 노란 광광 효과 */}
                <div className={styles.vsText}>VS</div>
              </div>

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
              <footer className={styles.footerArea}>
                <div className={styles.buttonGroup}>
                  <button onClick={handleRandomAssign} className={styles.randomButton}>
                    랜덤 팀 배정
                  </button>
                  <button onClick={handleStartGame} className={`${styles.randomButton} ${styles.startButton}`}>
                    게임 시작!
                  </button>
                </div>
              </footer>
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
                <span className={styles.modalTitleHighlight}>{selectedAudience?.nickname}</span>님을<br />어떻게 할까요?
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
                <span className={styles.targetSlotIndexHighlight}>{targetSlot ? targetSlot.index + 1 : 0}번 자리</span>에<br />누구를 앉힐까요?
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
