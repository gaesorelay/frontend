import React from 'react';
import styles from './TeamBoard.module.css';

interface TeamBoardProps {
  teamName: 'A' | 'B';
  maxStorytellers: number;
  renderSlots: (team: 'A' | 'B') => React.ReactNode;
}

export const TeamBoard = ({ teamName, renderSlots }: TeamBoardProps) => {
  const isTeamA = teamName === 'A';
  
  // 팀에 따른 동적 클래스 할당
  const teamStyle = isTeamA ? styles.teamA : styles.teamB;

  return (
    <div className={`${styles.boardContainer} ${teamStyle}`}>
      <h2 className={styles.teamTitle}>
        TEAM {teamName}
      </h2>
      <div className={styles.slotGrid}>
        {renderSlots(teamName)}
      </div>
    </div>
  );
};