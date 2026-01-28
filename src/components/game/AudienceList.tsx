import React from 'react';
import styles from './AudienceList.module.css';

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
          관전자 ({list.length})
        </h3>
      </div>
      
      <ul className={styles.scrollArea}>
        {list.map((user) => (
          <li key={user.userToken}>
            <button
              onClick={() => isHost && onSelect(user)}
              disabled={!isHost}
              className={`${styles.userButton} ${isHost ? styles.hostInteract : ''}`}
            >
              <div className={styles.avatarWrapper}>
                <img src={user.avatar} alt="" className={styles.avatarImg}/>
              </div>
              <span className={styles.nickname}>{user.nickname}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};