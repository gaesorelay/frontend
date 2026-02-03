import type { Player } from '@/types/game';

/**
 * 특정 턴과 팀에 해당하는 작성자(플레이어)를 찾습니다.
 * @param players 전체 플레이어 목록
 * @param team 대상 팀 ('A' | 'B')
 * @param turnNumber 현재 턴 번호 (1부터 시작)
 * @returns 해당 턴의 작성자 Player 객체 또는 undefined
 */
export const getStoryteller = (
    players: Player[],
    team: 'A' | 'B',
    turnNumber: number
): Player | undefined => {
    // 1. 해당 팀의 플레이어만 필터링하고 슬롯 인덱스 순으로 정렬
    const teamPlayers = players
        .filter((p) => p.team === team && p.role === 'PLAYER')
        .sort((a, b) => (a.slotIndex || 0) - (b.slotIndex || 0));

    if (teamPlayers.length === 0) return undefined;

    // 2. 턴 번호에 매칭되는 인덱스 계산 (0-based index)
    // 예: 1번 턴 -> index 0, 5번 턴(4명일 때) -> index 0
    const index = (turnNumber - 1) % teamPlayers.length;

    return teamPlayers[index];
};
