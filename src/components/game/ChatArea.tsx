import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { useUserStore } from '@/store/useUserStore';
import { useAudioStore } from '@/store/useAudioStore'; // 오디오 스토어 추가
import { socket } from '@/lib/socket';
import type { ChatMessage } from '@/types/game';

// 이미지 로드 로직 유지
import { getAvatarSrc } from '@/lib/avatarMapper';

// Reaction Images
// Reaction Images
import boneImg from '@/assets/decorations/bone.png';
import heartImg from '@/assets/decorations/heart.png';
import starImg from '@/assets/decorations/star.png';
import footImg from '@/assets/decorations/foot.png';
import bigHeartImg from '@/assets/decorations/big_heart.png';
import shibaImg from '@/assets/dog/shiba.png';
import gaesoImg from '@/assets/gaesorelay.png';
import sadgeImg from '@/assets/decorations/emoji/sadge.png';
import hangImg from '@/assets/decorations/emoji/hang.png';
import jihyunClapImg from '@/assets/decorations/emoji/jihyun_clap.gif';
import catDdabongImg from '@/assets/decorations/emoji/cat_ddabong.png';
import gloomyCatImg from '@/assets/decorations/emoji/gloomy_cat.png';
import goodCommImg from '@/assets/decorations/emoji/good_communication.png';
import hmmImg from '@/assets/decorations/emoji/hmm.gif';
import jerryThanksImg from '@/assets/decorations/emoji/jerry_thanks.gif';
import jihyunCharImg from '@/assets/decorations/emoji/jihyun_character.png';
import kkkImg from '@/assets/decorations/emoji/kkk.gif';
import questionImg from '@/assets/decorations/emoji/question_mark.png';
import sojungImg from '@/assets/decorations/emoji/sojung_princess.gif';
import taeheeConImg from '@/assets/decorations/emoji/taehee_con.png';
import taeheeLoveImg from '@/assets/decorations/emoji/taehee_lovebeam.gif';
import yejinClapImg from '@/assets/decorations/emoji/yejin_clap.gif';

//new
import junyoungImg from '@/assets/decorations/emoji/junyoung.png';
import hamzziImg from '@/assets/decorations/emoji/hamzzi.png';
import penguinDanceImg from '@/assets/decorations/emoji/penguin_dance.gif';
import hypeHyunjiImg from '@/assets/decorations/emoji/hype_hyunji.gif';
import signMinjunImg from '@/assets/decorations/emoji/sign_minjun.gif';
import sparkleTaekwooImg from '@/assets/decorations/emoji/sparkle_taekwoo.gif';
import zoomHajunImg from '@/assets/decorations/emoji/zoom_hajun.gif';


// avatarId (1-based) -> Image URL (Alias for consistency with internal usage)
const getAvatarUrl = getAvatarSrc;

// 🐶 이모지 대신 이미지 매핑 (Key -> Image Source)
const REACTION_MAP: Record<string, string> = {
  'bone': boneImg,
  'heart': heartImg,
  'star': starImg,
  'foot': footImg,
  'big_heart': bigHeartImg,
  'shiba': shibaImg,
  'gaeso': gaesoImg,
  'sadge': sadgeImg,
  'hang': hangImg,
  'jihyun_clap': jihyunClapImg,
  'cat_ddabong': catDdabongImg,
  'gloomy_cat': gloomyCatImg,
  'good_comm': goodCommImg,
  'hmm': hmmImg,
  'jerry_thanks': jerryThanksImg,
  'jihyun_char': jihyunCharImg,
  'kkk': kkkImg,
  'question': questionImg,
  'sojung': sojungImg,
  'taehee_con': taeheeConImg,
  'taehee_love': taeheeLoveImg,
  'yejin_clap': yejinClapImg,
  //new
  'junyoung': junyoungImg,
  'hamzzi': hamzziImg,
  'penguin_dance': penguinDanceImg,
  'hype_hyunji': hypeHyunjiImg,
  'sign_minjun': signMinjunImg,
  'sparkle_taekwoo': sparkleTaekwooImg,
  'zoom_hajun': zoomHajunImg,
};

const REACTION_KEYS = Object.keys(REACTION_MAP);

const ChatArea = () => {
  const { messages, addMessage, players, isSabotageMode, toggleSabotageMode } = useGameStore();
  const { nickname, avatarId: myAvatarId, userToken: myToken, publicUserId: myPublicUserId } = useUserStore();
  const [chatInput, setChatInput] = useState('');
  const chatListRef = useRef<HTMLDivElement>(null);

  const isSameUser = (user?: { publicUserId?: string | number; userToken?: string; nickname?: string }) => {
    if (!user) return false;
    const userPublicId = (user as any).publicUserId ?? (user as any).public_user_id;
    if (myPublicUserId !== null && myPublicUserId !== undefined) {
      if (userPublicId !== null && userPublicId !== undefined) {
        return String(userPublicId) === String(myPublicUserId);
      }
      if (user.userToken !== null && user.userToken !== undefined) {
        return String(user.userToken) === String(myPublicUserId);
      }
    }
    if (myToken && user.userToken) return user.userToken === myToken;
    return !!nickname && user.nickname === nickname;
  };

  // 리액션 관련
  const [showReactions, setShowReactions] = useState(false);
  // emoji string 대신 image key를 저장
  const [floatingReactions, setFloatingReactions] = useState<
    { id: number; reactionKey: string; x: number; size: number }[]
  >([]);

  // 1. 소켓 이벤트 리스너 설정
  useEffect(() => {
    const handleChatMessage = (data: any) => {
      console.log('[chat_message]', data);
      const rawPublicUserId = data.publicUserId ?? data.public_user_id ?? null;
      const senderToken = data.senderId ?? data.sender_id ?? data.userToken ?? data.user_token ?? 'unknown';
      let resolvedPublicUserId: string | number | null = rawPublicUserId ?? null;
      let resolvedTeam: 'A' | 'B' | null = data.team ?? null;

      let senderInfo = players.find((p) => {
        const playerPublicId = (p as any).publicUserId ?? (p as any).public_user_id;
        if (rawPublicUserId !== null && rawPublicUserId !== undefined) {
          if (playerPublicId !== null && playerPublicId !== undefined) {
            return String(playerPublicId) === String(rawPublicUserId);
          }
        }
        if (senderToken && p.userToken) return p.userToken === senderToken;
        if (senderToken && p.currentSocketId) return p.currentSocketId === senderToken;
        if (senderToken && p.socketId) return p.socketId === senderToken;
        if (senderToken && playerPublicId !== null && playerPublicId !== undefined) {
          return String(playerPublicId) === String(senderToken);
        }
        return false;
      });

      if (!senderInfo && data.nickname) {
        const sameNickname = players.filter((p) => p.nickname === data.nickname);
        if (sameNickname.length === 1) senderInfo = sameNickname[0];
      }

      const senderPublicId = (senderInfo as any)?.publicUserId ?? (senderInfo as any)?.public_user_id ?? null;
      if (resolvedPublicUserId === null && senderPublicId !== null && senderPublicId !== undefined) {
        resolvedPublicUserId = senderPublicId;
      }
      if (resolvedTeam === null && senderInfo?.team) {
        resolvedTeam = senderInfo.team;
      }

      const newMessage: ChatMessage = {
        id: Date.now().toString() + Math.random(),
        userToken: senderToken,
        publicUserId: resolvedPublicUserId ?? undefined,
        nickname: data.nickname,
        text: data.message,
        createdAt: new Date().toISOString(),
        avatarId: data.avatarId,
        team: resolvedTeam ?? undefined,
      };
      addMessage(newMessage);
    };

    // 서버에서는 { emoji: 'bone' } 형태로 보내줌 (기존 emoji 필드 재사용)
    const handleReaction = (data: { emoji: string }) => {
      if (data.emoji.includes('|')) return; // 구분자(|)가 있으면 방해 공작이므로 무시
      // 🐶 이모지 효과음 재생 (모든 사용자)
      useAudioStore.getState().playSFX('BUTTON_BEEP');
      triggerFloatingReaction(data.emoji);
    };

    socket.on('chat_message', handleChatMessage);
    socket.on('receive_reaction', handleReaction);

    return () => {
      socket.off('chat_message', handleChatMessage);
      socket.off('receive_reaction', handleReaction);
    };
  }, [addMessage, players]);

  // 2. 스크롤 자동 내리기
  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [messages]);

  // 3. 메시지 전송 핸들러
  const handleSend = () => {
    if (!chatInput.trim()) return;
    socket.emit('send_chat', { message: chatInput });
    setChatInput('');
  };

  // 리액션 발사 로직
  const triggerFloatingReaction = (reactionKey: string) => {
    // 없는 키면 무시
    if (!REACTION_MAP[reactionKey]) return;

    const id = Date.now() + Math.random();
    // ⭐️ X값 랜덤 범위 대폭 확대 (5% ~ 95%) -> 더 정신없게!
    const x = Math.floor(Math.random() * 90) + 5;
    // 사이즈도 약간 랜덤 (0.8 ~ 1.5배)
    const size = 0.7 + Math.random() * 0.5;

    setFloatingReactions((prev) => [...prev, { id, reactionKey, x, size }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 1200);
  };

  const handleSendReaction = (reactionKey: string) => {
    // emoji 필드에 키값을 담아서 보냄
    socket.emit('send_reaction', { emoji: reactionKey, nickname });
    // 내 화면에도 즉시 표시 (선택사항, 소켓으로 돌아오면 중복될 수 있으니 주석처리된 대로 둠 or 즉시반응 원하면 주석해제)
    // triggerFloatingReaction(reactionKey);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // 1. 루프 밖에서 '나의 팀'이 무엇인지 딱 한 번만 정의 (Zustand players 활용)
  const myInfo = players.find((p) => isSameUser(p) || (socket.id && (p.currentSocketId === socket.id || p.socketId === socket.id)));
  const isAudience = !myInfo || myInfo.role === 'AUDIENCE';

  return (
    <div
      className="sketch-box-container chat-area-container"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        paddingLeft: '10px',
        maxWidth: '25rem',
      }}
    >
      <style>{`
        /* 🐶 멍멍이 스타일: 쫀득하고 촐싹거리는 애니메이션 */
        @keyframes tail-wag {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(2deg); }
            50% { transform: rotate(0deg); }
            75% { transform: rotate(-2deg); }
            100% { transform: rotate(0deg); }
        }

        @keyframes bubble-pop {
            0% { transform: scale(0); opacity: 0; }
            70% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); }
        }

        .sketch-box-container { 
            border: 5px solid #111 !important; 
            border-radius: 10px 30px 10px 30px / 30px 10px 30px 10px !important; 
            box-shadow: 10px 10px 0 rgba(0,0,0,0.2) !important;
            background: #fffdf0 !important; 
            position: relative;
            transform: rotate(1deg);
            animation: tail-wag 5s infinite ease-in-out;
        }
        .sketch-box-container::before {
            content: ""; position: absolute; left: 10px; top: 0; bottom: 0; width: 20px;
            background-image: radial-gradient(circle at 10px 10px, #333 4px, transparent 5px);
            background-size: 20px 30px; background-repeat: repeat-y;
            pointer-events: none;
        }

        .chat-bubble { 
            padding: 5px; border: 1px solid #111; 
            border-radius: 20px 5px 25px 10px / 10px 25px 5px 20px; 
            box-shadow: 3px 3px 0 rgba(0,0,0,0.2); 
            font-size: 0.8rem; word-break: break-all; 
            transition: all 0.3s;
            animation: bubble-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
            position: relative;
        }
      `}</style>

      {/* 솟아오르는 리액션 레이어 (Portal을 사용하여 화면 전체에 표시) */}
      {createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 99999,
            overflow: 'hidden',
          }}
        >
          <AnimatePresence>
            {floatingReactions.map((r) => (
              <motion.div
                key={r.id}
                initial={{ y: 150, opacity: 0, scale: 0.5, rotate: 0 }}
                animate={{
                  y: -window.innerHeight - 200, // 화면 전체 높이만큼 위로 이동 + 여유분
                  opacity: [0, 1, 1, 0],
                  scale: [0.5, r.size, r.size, r.size * 0.8],
                  rotate: [0, -20, 20, -10, 0],
                }}
                transition={{ duration: 4, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  left: `${r.x}%`,
                  bottom: '-50px',
                }}
              >
                <img
                  src={REACTION_MAP[r.reactionKey]}
                  alt="reaction"
                  style={{
                    width: '55px',
                    height: '55px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(4px 4px 2px rgba(0,0,0,0.3))',
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}

      <div
        style={{
          padding: '15px',
          background: 'transparent',
          borderBottom: '4px dashed #111',
          fontWeight: '900',
          textAlign: 'center',
          fontSize: '1.8rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
        }}
      >
        <MessageSquare size={24} color="#111" />
        <span>실시간 개소리판</span>
      </div>

      <div
        ref={chatListRef}
        style={{
          flex: 1,
          padding: '15px',
          overflowY: 'auto',
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {messages.map((msg) => {
          // 1. 메세지 작성자의 실시간 정보 찾기
          let senderInfo = players.find((p) => {
            const playerPublicId = (p as any).publicUserId ?? (p as any).public_user_id;
            if (msg.publicUserId !== null && msg.publicUserId !== undefined) {
              if (playerPublicId !== null && playerPublicId !== undefined) {
                return String(playerPublicId) === String(msg.publicUserId);
              }
            }
            if (msg.userToken && p.userToken) return p.userToken === msg.userToken;
            if (msg.userToken && p.currentSocketId) return p.currentSocketId === msg.userToken;
            if (msg.userToken && p.socketId) return p.socketId === msg.userToken;
            if (msg.userToken && playerPublicId !== null && playerPublicId !== undefined) {
              return String(playerPublicId) === String(msg.userToken);
            }
            return false;
          });

          if (!senderInfo && msg.nickname) {
            const sameNickname = players.filter((p) => p.nickname === msg.nickname);
            if (sameNickname.length === 1) senderInfo = sameNickname[0];
          }

          const msgPublicId = (msg as any).publicUserId ?? (msg as any).public_user_id;
          const isMe =
            (myPublicUserId !== null &&
              myPublicUserId !== undefined &&
              msgPublicId !== null &&
              msgPublicId !== undefined &&
              String(msgPublicId) === String(myPublicUserId)) ||
            (myToken && msg.userToken === myToken) ||
            (socket.id && msg.userToken === socket.id) ||
            (senderInfo ? isSameUser(senderInfo) : false);
          const isSystem = msg.nickname === 'SYSTEM';

          // 2. 팀 판별 (스토어 데이터가 없으면 'NONE'으로 간주)
          const userTeam = msg.team ?? senderInfo?.team ?? 'NONE';
          // 3. 🎨 요청하신 4가지 색상 규칙 적용
          let currentConfig = { bg: '#ffffff', border: '#9ca3af' }; // 기본값 (관중/하얀색)

          if (isMe) {
            // ??? ????? (?????
            currentConfig = { bg: '#facc15', border: '#111' };
          } else if (userTeam === 'A') {
            // A?? (?????
            currentConfig = { bg: '#fee2e2', border: '#ef4444' };
          } else if (userTeam === 'B') {
            // B?? (?????
            currentConfig = { bg: '#dbeafe', border: '#3b82f6' };
          } else {
            // ????(?????
            currentConfig = { bg: '#ffffff', border: '#9ca3af' };
          }

          // 4. 라벨 판별
          let teamLabel = '';
          if (isMe) {
            teamLabel = '(나)';
          } else if (userTeam === 'A') {
            teamLabel = '(A팀)';
          } else if (userTeam === 'B') {
            teamLabel = '(B팀)';
          } else {
            teamLabel = '(관전자)';
          }
          if (isSystem) {
            return (
              <div
                key={msg.id}
                style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}
              >
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: '#888',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    padding: '5px',
                    borderRadius: '15px',
                  }}
                >
                  📢 {msg.text}
                </span>
              </div>
            );
          }

          // 아바타 URL 가져오기
          // const avatarUrl = getAvatarUrl(msg.avatarId); // 사용안함

          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
              <div style={{ flexShrink: 0 }}>
                <img
                  src={getAvatarUrl(senderInfo?.avatarId || msg.avatarId)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: `2px solid ${currentConfig.border}`,
                  }}
                  alt="avatar"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div
                  style={{
                    fontSize: '0.8rem',
                    marginBottom: '2px',
                    color: currentConfig.border,
                    fontWeight: 'bold',
                  }}
                >
                  {senderInfo?.nickname || msg.nickname} {teamLabel}
                </div>

                <div
                  className="chat-bubble"
                  style={{
                    background: currentConfig.bg,
                    borderColor: currentConfig.border,
                    transform: `rotate(${((parseInt(String(msg.id).slice(-1)) || 0) % 4) - 2}deg)`,
                    padding: '3px',
                  }}
                >
                  <div style={{ color: '#111', fontWeight: 600, fontSize: '1rem' }}>{msg.text}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 입력 영역 */}
      <div
        style={{
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          padding: '10px',
          background: 'transparent',
          borderTop: '4px dashed #111',
          alignItems: 'center',
        }}
      >
        {/* 2. 리액션 버튼 팝업창 */}
        <div
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
          style={{ position: 'relative', margin: '0 5px', display: 'flex', alignItems: 'center' }}
        >
          <AnimatePresence>
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -45, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '-15px',
                  backgroundColor: '#fff',
                  border: '3px solid #111',
                  borderRadius: '15px',
                  padding: '8px',
                  // ⭐️ 그리드 레이아웃 적용 (5열)
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '5px',
                  boxShadow: '4px 4px 0px rgba(0,0,0,0.2)',
                  zIndex: 100,
                  width: '240px', // 5개 * (35px + gap) 정도 고려해서 넓힘
                  alignItems: 'center',
                  placeItems: 'center' // 그리드 아이템 중앙 정렬
                }}
              >
                {/* ⭐️ 방해 모드 토글 (관중 전용) - 팝업 내부에 배치 */}
                {isAudience && (
                  <button
                    onClick={toggleSabotageMode}
                    style={{
                      gridColumn: '1 / -1', // 전체 너비 사용
                      width: '100%',
                      padding: '8px',
                      marginBottom: '5px',
                      background: isSabotageMode ? '#ff7675' : '#74b9ff',
                      border: '2px solid #111',
                      borderRadius: '8px',
                      color: '#fff',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      fontSize: '0.9rem',
                    }}
                  >
                    <span>{isSabotageMode ? '방해모드 ON 😈' : '방해모드 OFF 😇'}</span>
                  </button>
                )}

                {REACTION_KEYS.map((key) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSendReaction(key)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <img
                      src={REACTION_MAP[key]}
                      alt={key}
                      style={{ width: '35px', height: '35px', objectFit: 'contain' }}
                    />
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 리액션 트리거 아이콘 (스마일로 변경) */}
          <div
            style={{
              fontSize: '1.8rem',
              cursor: 'pointer',
              filter: 'grayscale(0.0)',
              transition: '0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Smile size={32} color="#111" strokeWidth={2.5} />
          </div>
        </div>

        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            minWidth: 0,
            flex: 1,
            padding: '12px',
            border: '3px solid #111',
            borderRadius: '15px',
            outline: 'none',
            fontSize: '1.1rem',
            background: '#fffdf0',
            marginLeft: '5px' // 간격 추가
          }}
          placeholder="멍멍! 짖어봐!"
        />
      </div>
    </div>
  );
};

export default ChatArea;
