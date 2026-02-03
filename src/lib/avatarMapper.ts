
// 🐶 강아지 이미지 로딩 및 매핑 로직 (전역 사용)
// Setup.tsx와 LobbyPhase.tsx 등에서 동일한 ID <-> 이미지 매핑을 보장하기 위함입니다.

const rawImages = import.meta.glob('@/assets/dog/*.{png,jpg,jpeg}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

// 1. ID -> URL 매핑 생성 (파일명의 숫자 기반)
const avatarMap = new Map<number, string>();
const avatarList: { id: number; icon: string; name: string; desc: string }[] = [];

Object.entries(rawImages).forEach(([path, url]) => {
    // dog1.png, dog10.png 등에서 숫자 추출
    const match = path.match(/dog(\d+)\.(png|jpg|jpeg)$/i);
    if (match) {
        const id = parseInt(match[1], 10);
        avatarMap.set(id, url);

        avatarList.push({
            id,
            icon: url,
            name: `멍멍이 ${id}`,
            desc: '준비 완료!',
        });
    }
});

// ID 순으로 리스트 정렬
avatarList.sort((a, b) => a.id - b.id);

export const AVATAR_LIST = avatarList;

export const getAvatarSrc = (avatarId?: number): string => {
    if (typeof avatarId === 'number' && avatarMap.has(avatarId)) {
        return avatarMap.get(avatarId)!;
    }
    // Fallback: 1번 강아지 or 리스트의 첫 번째
    if (avatarMap.has(1)) return avatarMap.get(1)!;
    return AVATAR_LIST[0]?.icon || '';
};

export const getTotalAvatars = () => AVATAR_LIST.length;
