import React from 'react';
import styles from './AudienceList.module.css';
import { useUserStore } from '@/store/useUserStore';

interface User {
  userToken: string;
  nickname: string;
  avatar: string;
}

interface AudienceListProps {
  list: User[];
  isHost: boolean;
  onSelect: (user: User) => void;
  onClose?: () => void;
}

export const AudienceList = ({ list, isHost, onSelect, onClose }: AudienceListProps) => {
  const { nickname: myNickname } = useUserStore();
  const sortedList = [...list].sort((a, b) => {
    if (a.nickname === myNickname) return -1; // 내가 앞쪽으로
    if (b.nickname === myNickname) return 1; // 상대방이 뒤쪽으로
    return 0; // 나머지는 순서 유지
  });
  return (
    <div className={styles.audienceContainer}>
      {onClose && (
        <button onClick={onClose} className={styles.closeButton}>
          ✕
        </button>
      )}
      <div className={styles.titleBar}>
        <h3 className={styles.title}>
          <span className={styles.pingDot} />
          관전자 ({sortedList.length})
        </h3>
      </div>

      <ul className={styles.scrollArea}>
        {sortedList.map((user) => {
          // 3. 현재 렌더링 중인 유저가 나인지 체크
          const isMe = user.nickname === myNickname;

          return (
            <li key={user.userToken}>
              <button
                onClick={() => isHost && onSelect(user)}
                disabled={!isHost}
                className={`${styles.userButton} ${isHost ? styles.hostInteract : ''}`}
              >
                <div className={styles.avatarWrapper}>
                  <img src={user.avatar} alt="" className={styles.avatarImg} />
                </div>
                {/* 4. 닉네임 옆에 (나) 조건부 렌더링 */}
                <span className={styles.nickname}>
                  {user.nickname}
                  {isMe && ' (나)'}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
