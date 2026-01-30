
// 🐶 강아지 이미지 로딩 및 매핑 로직 (전역 사용)
// Setup.tsx와 LobbyPhase.tsx 등에서 동일한 ID <-> 이미지 매핑을 보장하기 위함입니다.

const rawImages = import.meta.glob('@/assets/dog/*.{png,jpg,jpeg}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

// 이미지 정렬 로직 (Setup.tsx와 동일)
// 파일명에 숫자가 있으면 그 숫자로 정렬하고, 없으면(0) 맨 앞으로 오게 됩니다.
const sortedImageUrls = Object.entries(rawImages)
    .filter(([path]) => {
        // "dog" 뒤에 숫자가 붙은 파일만 허용 (예: dog1.png)
        // shiba.png 등은 제외됨
        return /dog\D?\d+\.(png|jpg|jpeg)$/i.test(path);
    })
    .sort(([pathA], [pathB]) => {
        const numA = parseInt(pathA.match(/dog\D?(\d+)/)?.[1] || '0', 10);
        const numB = parseInt(pathB.match(/dog\D?(\d+)/)?.[1] || '0', 10);

        // 숫자가 같으면(둘 다 0이거나 같은 번호) 문자열 정렬로 순서 보장 (Determinism)
        if (numA === numB) {
            return pathA.localeCompare(pathB);
        }
        return numA - numB;
    })
    .map(([_, url]) => url);

export const AVATAR_LIST = sortedImageUrls.map((imgSrc, index) => ({
    id: index + 1,
    name: `멍멍이 ${index + 1}`,
    desc: '준비 완료!',
    icon: imgSrc,
}));

export const getAvatarSrc = (avatarId: number): string => {
    const avatar = AVATAR_LIST.find(a => a.id === avatarId);
    return avatar ? avatar.icon : '';
};

export const getTotalAvatars = () => AVATAR_LIST.length;
