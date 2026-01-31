// 🃏 카드 이미지 로딩 및 매핑 로직
// CardShufflePhase 등에서 ID <-> 이미지 매핑을 보장하기 위함입니다.

const rawImages = import.meta.glob('@/assets/cards/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

// 이미지 정렬 로직
// 파일명 card001.png -> 1번
const sortedImageUrls = Object.entries(rawImages)
    .filter(([path]) => {
        return /card\d+\.(png|jpg|jpeg|webp)$/i.test(path);
    })
    .sort(([pathA], [pathB]) => {
        const numA = parseInt(pathA.match(/card(\d+)/)?.[1] || '0', 10);
        const numB = parseInt(pathB.match(/card(\d+)/)?.[1] || '0', 10);
        return numA - numB;
    })
    .map(([_, url]) => url);

export const CARD_LIST = sortedImageUrls.map((imgSrc, index) => ({
    id: index + 1,
    image: imgSrc,
}));

export const getCardImage = (cardId: number): string => {
    // cardId가 1부터 시작한다고 가정
    // CARD_LIST는 0번 인덱스에 ID 1번 카드가 있음
    // 안전하게 find 사용
    const card = CARD_LIST.find(c => c.id === cardId);
    return card ? card.image : '';
};
