import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useUserStore } from '@/store/useUserStore';
import { socket } from '@/lib/socket';
import { useAudioStore } from '@/store/useAudioStore';
import { TeamSlot } from '@/components/game/TeamSlot';
// import { TeamBoard } from '@/components/game/TeamBoard'; // 사용 안 함
import { AudienceList } from '@/components/game/AudienceList';
import { Background } from '@/components/common/background';
import SoundButton from '@/components/common/SoundButton';
import { MessageSquare, X } from 'lucide-react'; // 아이콘 추가

import Modal from '@/components/common/Modal';
import styles from '@/components/game/phases/LobbyPhase.module.css';
import { animationStyles } from '@/pages/create/createAnimations';
import ChatArea from '../ChatArea';

// 나가기 버튼
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoOut from '@/assets/logo/logo_out.png';
import logoSetting from '@/assets/logo/logo_setting.png';
import lobbyLogo from '@/assets/logo/lobby_logo.png';
import { getAvatarSrc } from '@/lib/avatarMapper';

// 🆕 통합 보드 및 로고
import boardImg from '@/assets/board.png';
import logoA from '@/assets/logo/A.png';
import logoB from '@/assets/logo/B.png';

export type RoomConfig = {
  maxPlayers: number;
  storytellerCount: number;
  roundTime: number;
  voteTime: number;
};

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

const LobbyPhase = ({
  users: rawUsers,
  isHost,
  maxStorytellers,
  TEST_MODE,
  setUsers,
  roomId,
}: LobbyProps) => {
  // 🐶 Avatar ID -> Image 변환
  // 이제 전역 Mapper를 사용합니다.
  const { isMuted, toggleMute } = useAudioStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleToggleMute = () => {
    toggleMute();
  };

  const users = rawUsers.map((user) => ({
    ...user,
    avatar: getAvatarSrc(user.avatarId) || user.avatar,
  }));

  // console.log('🔍 유저 데이터 구조 확인:', users);
  const {
    nickname: myNickname,
    avatarId: myAvatarId,
    userToken: myUserToken,
    publicUserId: myPublicUserId,
  } = useUserStore();
  const isSameUser = (user?: any) => {
    if (!user) return false;
    if (myPublicUserId !== null && myPublicUserId !== undefined) {
      if (user.publicUserId !== null && user.publicUserId !== undefined) {
        return user.publicUserId === myPublicUserId;
      }
    }
    if (myUserToken && user.userToken) return user.userToken === myUserToken;
    return !!myNickname && user.nickname === myNickname;
  };
  const myUser = users.find((u: any) => isSameUser(u));
  const isMyRolePlayer = myUser?.role === 'PLAYER';

  const { roomConfig, roomTitle, setRoomConfig, setRoomTitle } = useGameStore();

  // 로비 전용 UI 상태 (모달 등)는 여기서 관리해도 OK
  const [targetSlot, setTargetSlot] = useState<{ team: 'A' | 'B'; index: number } | null>(null);
  const [selectedAudience, setSelectedAudience] = useState<any | null>(null);
  const [isAudienceBarOpen, setIsAudienceBarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isSettingOpen, setIsSettingOpen] = useState(false);

  // =========================================================
  // 📡 [추가] 소켓 이벤트 리스너 (설정 동기화의 핵심!)
  // =========================================================
  useEffect(() => {
    // 서버로부터 설정 변경 알림이 오면 실행될 함수
    const handleConfigUpdate = (data: { config: RoomConfig; title?: string }) => {
      // console.log('📢 방 설정이 업데이트되었습니다:', data);

      // 1. 전역 스토어(Store) 업데이트
      if (data.config && setRoomConfig) {
        setRoomConfig(data.config);
      }
      if (data.title && setRoomTitle) {
        setRoomTitle(data.title);
      }
    };

    // 이벤트 구독
    socket.on('room_config_updated', handleConfigUpdate);

    // 클린업 (언마운트 시 구독 해제)
    return () => {
      socket.off('room_config_updated', handleConfigUpdate);
    };
  }, [setRoomConfig, setRoomTitle]);

  // =========================================================
  // 🔄 [수정] 모달 열 때 & 스토어 변경 시 로컬 상태 동기화
  // =========================================================

  useEffect(() => {
    // 모달이 열려있거나, 방금 소켓으로 인해 roomConfig가 바뀌었다면
    // 로컬 편집용 state(editConfig)도 최신값으로 덮어씌웁니다.
    if (roomConfig) {
      setEditConfig(roomConfig);
    }
    if (roomTitle) {
      setEditTitle(roomTitle);
    }
  }, [isSettingOpen, roomConfig, roomTitle]);
  // 👆 dependency에 roomConfig가 있어야 소켓으로 스토어가 변했을 때 모달 내용도 즉시 바뀝니다.

  // =========================================================
  // ⚙️ [추가] 설정 변경을 위한 로컬 State 및 핸들러
  // =========================================================

  // 1. 모달 내부에서 임시로 수정할 설정값 (저장 누르기 전까지 전역 상태를 건드리지 않음)
  const [editTitle, setEditTitle] = useState(roomTitle);
  const [editConfig, setEditConfig] = useState<RoomConfig>(
    roomConfig || {
      maxPlayers: 10,
      storytellerCount: 3,
      roundTime: 60,
      voteTime: 30,
    }
  );
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const displayTitle =
    (isSettingOpen ? editTitle : roomTitle) ||
    (isHost ? '내가 만든 방 👑' : '남의 방 구경 중 👀');

  // 컨펌창을 여는 헬퍼 함수
  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(null);
      },
    });
  };

  // 2. 모달이 열릴 때마다 현재 전역 설정값으로 초기화 (동기화)
  useEffect(() => {
    if (isSettingOpen) {
      setEditTitle(roomTitle);
      setEditConfig(roomConfig);
    }
  }, [isSettingOpen, roomTitle, roomConfig]);

  // 3. 설정 저장 및 소켓 전송 핸들러
  const handleSaveSettings = () => {
    if (!isHost) return;
    if (!editTitle.trim()) return alert('방 제목을 입력해주세요!');

    // 소켓 요청 전송
    socket.emit('update_room_config', { config: editConfig, title: editTitle });

    setRoomTitle(editTitle);
    setRoomConfig(editConfig);

    setIsSettingOpen(false);
    // (선택) 저장되었다는 토스트 메시지 등을 띄울 수 있음
  };

  // 4. 설정값 변경 헬퍼 함수 (최소/최대값 제한)
  const updateConfig = (key: keyof RoomConfig, value: number, min: number, max: number) => {
    const newValue = Math.max(min, Math.min(max, value));
    setEditConfig((prev) => ({ ...prev, [key]: newValue }));
  };

  // =========================================================
  // 🎮 액션 핸들러 (users는 props.users를 사용!)
  // =========================================================

  const handleRandomAssign = () => {
    if (!isHost) return;

    if (TEST_MODE) {
      const newUsers = [...users];
      const audience = newUsers.filter((u) => u.role === 'AUDIENCE');

      const fillTeam = (team: string) => {
        for (let i = 0; i < maxStorytellers; i++) {
          if (
            !newUsers.find((u) => u.role === 'PLAYER' && u.team === team && u.slotIndex === i) &&
            audience.length
          ) {
            const target = audience.pop();
            if (target) {
              target.role = 'PLAYER';
              target.team = team;
              target.slotIndex = i;
            }
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
    const userInSlot = users.find(
      (u) => u.role === 'PLAYER' && u.team === teamType && u.slotIndex === slotIndex
    );

    // [방장]
    // [CASE 1: 방장이 클릭]
    if (isHost) {
      if (userInSlot) {
        openConfirm('관전석 이동', `${userInSlot.nickname}님을 관전석으로 보낼까요?`, () => {
          if (TEST_MODE) {
            setUsers(
              users.map((u) =>
                u.userToken === userInSlot.userToken
                  ? { ...u, role: 'AUDIENCE', team: null, slotIndex: null }
                  : u
              )
            );
          } else {
            socket.emit('leave_team', {
              public_user_id: userInSlot.publicUserId,
              team: teamType,
              slot_index: slotIndex,
            });
          }
        });
        return;
      }
      setTargetSlot({ team: teamType, index: slotIndex });
      return;
    }

    // [게스트]
    if (!isHost) {
      const isMe = isSameUser(userInSlot);

      if (isMe) {
        // 내가 내 자리를 눌렀다면 퇴장(관전) 확인
        openConfirm('팀 퇴장', '팀에서 나가 관전석으로 돌아가시겠습니까?', () => {
          if (TEST_MODE) {
            setUsers(
              users.map((u) =>
                isSameUser(u)
                  ? { ...u, role: 'AUDIENCE', team: null, slotIndex: null }
                  : u
              )
            );
          } else {
            const me = users.find((u) => isSameUser(u));
            socket.emit('leave_team', {
              public_user_id: me.publicUserId,
              team: teamType,
              slot_index: slotIndex,
            });
          }
        });
        return; // 퇴장 처리 후 종료
      }

      if (userInSlot) return;
      openConfirm('팀 참가', `${teamType}팀 ${slotIndex + 1}번 자리에 참가하시겠습니까?`, () => {
        if (TEST_MODE) {
          // 테스트용: Guest인 나를 생성해서 넣음
          const myToken = 'me_guest_token';
          const amIAlreadyIn = users.find((u) => u.userToken === myToken);

          if (amIAlreadyIn) {
            setUsers(
              users.map((u) =>
                u.userToken === myToken
                  ? { ...u, role: 'PLAYER', team: teamType, slotIndex: slotIndex }
                  : u
              )
            );
          } else {
            const me = {
              userToken: myToken,
              nickname: myNickname || '나(게스트)',
              role: 'PLAYER',
              team: teamType,
              slotIndex: slotIndex,
              isHost: false,
              avatarId: myAvatarId || 1,
              avatar: '🐣',
            };
            setUsers([...users, me]);
          }
        } else {
          const me = users.find((u) => isSameUser(u));
          if (me) {
            // ✅ [수정] join_team 이벤트 전송
            socket.emit('join_team', {
              public_user_id: me.publicUserId,
              team: teamType,
              slot_index: slotIndex,
            });
          } else {
            console.error('내 정보를 찾을 수 없습니다.');
          }
        }
      }); // openConfirm
    } // !ishost
  }; // handleSlotClick

  const moveUserToTeam = (teamType: 'A' | 'B') => {
    if (!selectedAudience || !isHost) return;

    let emptyIndex = -1;
    for (let i = 0; i < maxStorytellers; i++) {
      if (!users.find((u) => u.role === 'PLAYER' && u.team === teamType && u.slotIndex === i)) {
        emptyIndex = i;
        break;
      }
    }
    if (emptyIndex === -1) return alert('빈 자리가 없어요!');

    if (TEST_MODE) {
      setUsers(
        users.map((u) =>
          u.userToken === selectedAudience.userToken
            ? { ...u, role: 'PLAYER', team: teamType, slotIndex: emptyIndex }
            : u
        )
      );
    } else {
      // ✅ [수정] join_team 전송
      socket.emit('join_team', {
        public_user_id: selectedAudience.publicUserId, // 선택된 사람의 ID
        team: teamType,
        slot_index: emptyIndex,
      });
    }
    setSelectedAudience(null);
  };

  const handleKickUser = () => {
    if (!selectedAudience || !isHost) return;
    openConfirm('강제 퇴장', `${selectedAudience.nickname}님을 강퇴하시겠습니까?`, () => {
      if (TEST_MODE) {
        setUsers(users.filter((u) => u.userToken !== selectedAudience.userToken));
      } else {
        socket.emit('kick_user', { public_user_id: selectedAudience.publicUserId });
      }
      setSelectedAudience(null);
    }); // openConfirm
  };

  const handleSelectPlayer = (user: any) => {
    if (!targetSlot || !isHost) return;
    const { team, index } = targetSlot;

    if (TEST_MODE) {
      setUsers(
        users.map((u) =>
          u.userToken === user.userToken
            ? { ...u, role: 'PLAYER', team: team, slotIndex: index }
            : u
        )
      );
    } else {
      // ✅ [수정] join_team 전송
      socket.emit('join_team', {
        public_user_id: user.publicUserId,
        team: team,
        slot_index: index,
      });
    }
    setTargetSlot(null);
  };

  const renderSlots = (teamType: 'A' | 'B') => {
    return Array.from({ length: maxStorytellers }).map((_, i) => {
      const user = users.find(
        (u) => u.role === 'PLAYER' && u.team === teamType && u.slotIndex === i
      );
      return (
        <TeamSlot
          key={i}
          status={user ? 'FILLED' : 'EMPTY'}
          user={user}
          onClick={() => handleSlotClick(teamType, i)}
        />
      );
    });
  };

  const audienceList = users.filter((u) => u.role === 'AUDIENCE');

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
    // console.log('🚀 게임 시작 버튼 클릭됨');
    if (!isHost) return;

    // (선택) 인원 수 체크 등을 여기서 미리 막아도 됨
    // const playerCnt = users.filter(u => u.role === 'PLAYER').length;
    // if (playerCnt < 4) return alert("플레이어가 부족합니다!");

    if (TEST_MODE) {
      // 테스트 모드면 바로 다음 페이즈로 강제 이동
      // (부모 GameRoom의 devSwitchPhase 등을 호출해야 하는데, 여기선 socket만 보냄)
      alert('테스트 모드: 개발자 컨트롤 패널을 이용하세요.');
    } else {
      // 📡 백엔드에 시작 신호 전송
      socket.emit('start_game', { roomId });
    }
  };

  // 나가기 처리
  const navigate = useNavigate();

  const handleExit = () => {
    openConfirm('방 나가기', '정말 방에서 나가시겠어요? 🐾', () => {
      socket.emit('leave_room');
      navigate('/');
    });
  };

  const handleReturnToAudience = () => {
    if (!myUser) return;
    if (TEST_MODE) {
      setUsers(
        users.map((u: any) =>
          isSameUser(u) ? { ...u, role: 'AUDIENCE', team: null, slotIndex: null } : u
        )
      );
    } else {
      socket.emit('leave_team', {
        public_user_id: myUser.publicUserId,
        team: myUser.team,
        slot_index: myUser.slotIndex,
      });
    }
  };

  return (
    <Background>
      <div className={styles.container}>
        {/* 🔇 뮤트 버튼 */}

        {/* 메인 콘텐츠 */}
        <div className={styles.contentWrapper}>
          <aside
            className={`${styles.audienceBar} ${isAudienceBarOpen ? styles.open : styles.closed}`}
          >
            <AudienceList
              list={audienceList}
              isHost={isHost}
              onSelect={setSelectedAudience}
              onClose={() => setIsAudienceBarOpen(false)}
            />
          </aside>

          <SoundButton
            sfx="CLICK"
            onClick={() => {
              setIsAudienceBarOpen(!isAudienceBarOpen);
            }}
            className={styles.sidebarToggle}
            title={isAudienceBarOpen ? '닫기' : '관전자 목록'}
            style={{
              border: '4px solid #333',
              borderLeft: 'none',
            }}
          >
            {isAudienceBarOpen ? '◀' : '▶'}
          </SoundButton>

          <main className={styles.mainBoard}>
            {/* 상단 헤더 */}
            <style>{animationStyles}</style>
            <header className={styles.header}>
              {/* 1층: 유틸리티 라인 (로고, 코드, 나가기) */}
              <div className={styles.topRow}>
                <div className={styles.topLeft}>
                  <img src={lobbyLogo} alt="Logo" className={styles.headerLogo} />

                  {/* 1. 방 코드 */}
                  <div
                    className={styles.codeContainer}
                    onClick={() => {
                      handleCopyCode();
                    }}
                  >
                    <div className={styles.tape}></div>
                    <div className={styles.codeBox}>
                      <span className={styles.codeLabel}>ROOM CODE</span>
                      <span className={styles.codeNumber}>{roomId}</span>
                      {copied && <div className={styles.copyTooltip}>복사 완료! ✨</div>}
                    </div>
                  </div>

                  {/* 2. 방 제목 (가장 큼) */}
                  <div className={styles.titleContainer}>
                    <span className={styles.titleLabel}>방 이름 :</span>
                    <h1 className={styles.roomTitle}>{displayTitle}</h1>
                  </div>
                </div>

                <div className={styles.topRight}>
                  {/* 🔇 뮤트 버튼 (설정 버튼 왼쪽) */}
                  <SoundButton
                    sfx="CLICK"
                    onClick={() => {
                      handleToggleMute();
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '50px',
                      height: '50px',
                      fontSize: '30px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '15px', // 설정 버튼과의 간격
                    }}
                    title={isMuted ? '소리 켜기' : '소리 끄기'}
                  >
                    {isMuted ? '🔇' : '🔊'}
                  </SoundButton>
                  {/* 내 정보 버튼 제거됨 */}
                  {isHost && (
                    <motion.button
                      className={styles.exitButton}
                      onClick={() => {
                        setIsSettingOpen(true);
                      }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <img src={logoSetting} alt="Setting" className={styles.exitImg} />
                      <span className={styles.exitText}>설정</span>
                    </motion.button>
                  )}
                  <motion.button
                    className={styles.exitButton}
                    onClick={() => {
                      handleExit();
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <img src={logoOut} alt="Exit" className={styles.exitImg} />
                    <span className={styles.exitText}>나가기</span>
                  </motion.button>
                </div>
              </div>

              {/* 2층: 방 제목 라인 삭제 (위로 통합) */}

              {/* 🏠 설정 수정 모달 (구현 완료) */}
              <Modal isOpen={isSettingOpen} onClose={() => setIsSettingOpen(false)}>
                <div className={styles.settingModalContent}>
                  <h2 className={styles.modalTitle}>방 설정 변경</h2>

                  {/* 1. 방 제목 */}
                  <div className={styles.settingField}>
                    <label>방 제목</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className={styles.settingInput}
                    />
                  </div>

                  {/* 2. 최대 인원 */}
                  <div className={styles.settingField}>
                    <label>최대 인원 (전체)</label>
                    <div className={styles.counter}>
                      <SoundButton
                        sfx="CLICK"
                        className={styles.countBtn}
                        onClick={() => updateConfig('maxPlayers', editConfig.maxPlayers - 1, 2, 20)}
                      >
                        -
                      </SoundButton>
                      <span className={styles.countNum}>{editConfig.maxPlayers}명</span>
                      <SoundButton
                        sfx="CLICK"
                        className={styles.countBtn}
                        onClick={() => updateConfig('maxPlayers', editConfig.maxPlayers + 1, 2, 20)}
                      >
                        +
                      </SoundButton>
                    </div>
                  </div>

                  {/* 5. 라운드 시간 / 투표 시간 */}
                  <div className={styles.settingField}>
                    <label>시간 설정 (초)</label>
                    <div className={styles.timeGroup}>
                      <div className={styles.timeControl}>
                        <span>작성</span>
                        <div className={styles.counterSmall}>
                          <SoundButton
                            sfx="CLICK"
                            className={styles.countBtn}
                            onClick={() =>
                              updateConfig('roundTime', editConfig.roundTime - 5, 15, 45)
                            }
                          >
                            -
                          </SoundButton>
                          <span className={styles.countNum}>{editConfig.roundTime}s</span>
                          <SoundButton
                            sfx="CLICK"
                            className={styles.countBtn}
                            onClick={() =>
                              updateConfig('roundTime', editConfig.roundTime + 5, 15, 45)
                            }
                          >
                            +
                          </SoundButton>
                        </div>
                      </div>
                      <div className={styles.timeControl}>
                        <span>투표</span>
                        <div className={styles.counterSmall}>
                          <SoundButton
                            sfx="CLICK"
                            className={styles.countBtn}
                            onClick={() => updateConfig('voteTime', editConfig.voteTime - 5, 5, 15)}
                          >
                            -
                          </SoundButton>
                          <span className={styles.countNum}>{editConfig.voteTime}s</span>
                          <SoundButton
                            sfx="CLICK"
                            className={styles.countBtn}
                            onClick={() => updateConfig('voteTime', editConfig.voteTime + 5, 5, 15)}
                          >
                            +
                          </SoundButton>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.modalActions}>
                    <SoundButton
                      sfx="CLICK"
                      className={styles.saveButton}
                      onClick={() => {
                        handleSaveSettings();
                      }}
                    >
                      설정 저장하기
                    </SoundButton>
                  </div>
                </div>
              </Modal>
            </header>

            {/* 🆕 통합 보드 영역 */}
            <div
              className={`${styles.unifiedBoard} ${styles['board' + maxStorytellers]}`}
              style={{ backgroundImage: `url(${boardImg})` }}
            >
              {/* 왼쪽: A팀 */}
              <div className={styles.teamSection}>
                <img src={logoA} alt="Team A" className={styles.teamLogo} />
                <div className={`${styles.slotsGrid} ${styles['slots' + maxStorytellers]}`}>
                  {Array.from({ length: maxStorytellers }).map((_, i) => {
                    const user = users.find(
                      (u) => u.role === 'PLAYER' && u.team === 'A' && u.slotIndex === i
                    );
                    return (
                      <TeamSlot
                        key={`A-${i}`}
                        status={user ? 'FILLED' : 'EMPTY'}
                        user={user}
                        onClick={() => handleSlotClick('A', i)}
                      />
                    );
                  })}
                </div>
              </div>

              {/* 오른쪽: B팀 */}
              <div className={styles.teamSection}>
                <img src={logoB} alt="Team B" className={styles.teamLogo} />
                <div className={`${styles.slotsGrid} ${styles['slots' + maxStorytellers]}`}>
                  {Array.from({ length: maxStorytellers }).map((_, i) => {
                    const user = users.find(
                      (u) => u.role === 'PLAYER' && u.team === 'B' && u.slotIndex === i
                    );
                    return (
                      <TeamSlot
                        key={`B-${i}`}
                        status={user ? 'FILLED' : 'EMPTY'}
                        user={user}
                        onClick={() => handleSlotClick('B', i)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
            {(isHost || isMyRolePlayer) && (
              <footer className={`${styles.footerArea} ${styles['footer' + maxStorytellers]}`}>
                <div className={styles.buttonGroup}>
                  {isMyRolePlayer && (
                    <SoundButton
                      sfx="CLICK"
                      onClick={() => {
                        handleReturnToAudience();
                      }}
                      className={styles.randomButton}
                      style={{
                        backgroundColor: '#a7f3d0',
                        marginRight: 'auto',
                        marginLeft: '80px',
                      }}
                    >
                      관전으로 이동
                    </SoundButton>
                  )}

                  {isHost && (
                    <>
                      <SoundButton
                        onClick={() => {
                          handleRandomAssign();
                        }}
                        className={styles.randomButton}
                      >
                        랜덤 팀 배정
                      </SoundButton>
                      <SoundButton
                        sfx="CLICK"
                        onClick={() => {
                          handleStartGame();
                        }}
                        className={`${styles.randomButton} ${styles.startButton}`}
                      >
                        게임 시작!
                      </SoundButton>
                    </>
                  )}
                </div>
              </footer>
            )}
          </main>

          {/* 💬 플로팅 채팅 버튼 */}
          <SoundButton
            sfx="CLICK"
            className={styles.floatingChatBtn}
            onClick={() => setIsChatOpen(!isChatOpen)}
            title={isChatOpen ? '채팅 닫기' : '채팅 열기'}
          >
            {isChatOpen ? <X size={28} /> : <MessageSquare size={28} />}
          </SoundButton>

          {/* 💬 플로팅 채팅창 (오버레이) */}
          <div className={`${styles.floatingChatContainer} ${isChatOpen ? styles.open : styles.closed}`}>
            <ChatArea />
          </div>
        </div>
      </div>

      {/* 모달들 (방장만 보임) */}
      {isHost && (
        <>
          <Modal isOpen={!!selectedAudience} onClose={() => setSelectedAudience(null)}>
            <div className={styles.modalContent}>
              <img
                src={selectedAudience?.avatar}
                alt={selectedAudience?.nickname}
                className={styles.modalAvatar}
              />
              <h2 className={styles.modalTitle}>
                <span className={styles.modalTitleHighlight}>{selectedAudience?.nickname}</span>님을
                <br />
                어떻게 할까요?
              </h2>
              <div className={styles.modalButtonGrid}>
                <SoundButton
                  sfx="CLICK"
                  onClick={() => {
                    moveUserToTeam('A');
                  }}
                  className={`${styles.modalButton} ${styles.buttonTeamA}`}
                >
                  A팀 배정
                </SoundButton>
                <SoundButton
                  sfx="CLICK"
                  onClick={() => {
                    moveUserToTeam('B');
                  }}
                  className={`${styles.modalButton} ${styles.buttonTeamB}`}
                >
                  B팀 배정
                </SoundButton>
                {!selectedAudience?.isHost && !isSameUser(selectedAudience) && (
                  <SoundButton
                    sfx="CLICK"
                    onClick={() => {
                      handleKickUser();
                    }}
                    className={`${styles.modalButton} ${styles.buttonKick}`}
                  >
                    🚪 강퇴하기
                  </SoundButton>
                )}
              </div>
            </div>
          </Modal>

          <Modal isOpen={!!targetSlot} onClose={() => setTargetSlot(null)}>
            <div className={styles.targetSlotContent}>
              <h2 className={styles.targetSlotTitle}>
                <span className={styles.targetSlotTeamHighlight}>{targetSlot?.team}팀</span>
                <span className={styles.targetSlotIndexHighlight}>
                  {targetSlot ? targetSlot.index + 1 : 0}번 자리
                </span>
                에<br />
                누구를 앉힐까요?
              </h2>
              <div className={styles.playerGrid}>
                {users
                  .filter((u) => u.role === 'AUDIENCE')
                  .map((user) => (
                    <SoundButton
                      sfx="CLICK"
                      key={user.userToken}
                      onClick={() => {
                        handleSelectPlayer(user);
                      }}
                      className={styles.playerButton}
                    >
                      <img src={user.avatar} alt={user.nickname} className={styles.playerAvatar} />
                      <span className={styles.playerNickname}>{user.nickname}</span>
                    </SoundButton>
                  ))}
                {users.filter((u) => u.role === 'AUDIENCE').length === 0 && (
                  <div className={styles.emptyMessage}>대기 중인 사람이 없습니다 텅~ 🍃</div>
                )}
              </div>
            </div>
          </Modal>
        </>
      )}
      {/* ⚠️ 공통 확인 모달 */}
      <Modal isOpen={!!confirmModal?.isOpen} onClose={() => setConfirmModal(null)}>
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle} style={{ marginBottom: '10px' }}>
            {confirmModal?.title}
          </h2>
          <p
            style={{ fontSize: '1.2rem', color: '#666', marginBottom: '30px', textAlign: 'center' }}
          >
            {confirmModal?.message}
          </p>
          <div
            className={styles.modalActions}
            style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}
          >
            <SoundButton
              sfx="CLICK"
              className={styles.saveButton}
              style={{ backgroundColor: '#ccc' }}
              onClick={() => setConfirmModal(null)}
            >
              취소
            </SoundButton>
            <SoundButton
              sfx="CLICK"
              className={styles.saveButton}
              onClick={confirmModal?.onConfirm || (() => { })}
            >
              확인
            </SoundButton>
          </div>
        </div>
      </Modal>
    </Background>
  );
};
export default LobbyPhase;
