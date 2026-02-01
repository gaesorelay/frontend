import React from 'react';

interface WritingAreaProps {
    teamName: string;
    teamColor: string;
    activeNickname?: string;
    content: string; // 현재까지 작성된 전체 스토리
    children: React.ReactNode; // 아바타 리스트 등을 넣을 자리
}

const WritingArea = ({ teamName, teamColor, activeNickname, content, children }: WritingAreaProps) => {
    return (
        <div style={{ ...styles.teamSection, borderLeft: `8px solid ${teamColor}` }}>
            <div style={styles.teamHeader}>
                <div style={{ ...styles.teamIndicator, backgroundColor: teamColor }} />
                <span style={{ ...styles.teamNameText, color: teamColor }}>{teamName}팀</span>
                {activeNickname && (
                    <span style={styles.activeUserHint}>
                        ✍️ <span style={{ fontWeight: '900' }}>{activeNickname}</span> 작성 중...
                    </span>
                )}
            </div>

            {/* 아바타 리스트 렌더링 영역 (children) */}
            <div style={styles.storytellersWrapper}>
                {children}
            </div>

            {/* 실제 소설지가 놓인 듯한 영역 */}
            <div style={styles.paperContainer}>
                <div style={styles.paperLine}>
                    <div style={styles.storyContent}>
                        {content || (
                            <span style={styles.emptyText}>
                                심사위원의 심금을 울릴 개소리를 입력해주세요...
                            </span>
                        )}
                        {/* 작성 중일 때 깜빡이는 커서 효과 (선택 사항) */}
                        {activeNickname && <span style={styles.cursor}>|</span>}
                    </div>
                </div>
                {/* 원고지 느낌의 하단 장식 */}
                <div style={styles.paperFooter}>OFFICIAL DOG-SORI RECORD</div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    teamSection: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        border: '3px solid #333',
        boxShadow: '6px 6px 0px rgba(0,0,0,0.1)',
        borderRadius: '15px',
        padding: '15px',
        minHeight: 0,
        overflow: 'hidden',
    },
    teamHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '10px',
    },
    teamIndicator: {
        width: '14px',
        height: '14px',
        borderRadius: '50%',
        border: '2px solid #333',
    },
    teamNameText: {
        fontSize: '1.2rem',
        fontWeight: '900',
    },
    activeUserHint: {
        fontSize: '0.85rem',
        color: '#666',
        marginLeft: 'auto',
        backgroundColor: '#eee',
        padding: '2px 8px',
        borderRadius: '20px',
    },
    storytellersWrapper: {
        display: 'flex',
        gap: '8px',
        marginBottom: '12px',
    },
    paperContainer: {
        flex: 1,
        backgroundColor: '#fdfcf0', // 미색 종이 느낌
        border: '2px solid #ddd',
        borderRadius: '8px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.05)',
    },
    paperLine: {
        flex: 1,
        padding: '15px',
        backgroundImage: 'linear-gradient(#e1e1e1 1px, transparent 1px)', // 줄노트 느낌
        backgroundSize: '100% 1.6rem',
        lineHeight: '1.6rem',
    },
    storyContent: {
        fontSize: '1rem',
        color: '#2d3436',
        fontWeight: '500',
        wordBreak: 'break-all',
        whiteSpace: 'pre-wrap',
    },
    emptyText: {
        color: '#ccc',
        fontStyle: 'italic',
    },
    cursor: {
        fontWeight: 'bold',
        color: '#333',
        marginLeft: '2px',
        animation: 'blink 1s step-end infinite',
    },
    paperFooter: {
        fontSize: '0.6rem',
        textAlign: 'right',
        padding: '4px 10px',
        color: '#bbb',
        fontWeight: 'bold',
        letterSpacing: '1px',
        borderTop: '1px solid #eee',
    }
};

export default WritingArea;