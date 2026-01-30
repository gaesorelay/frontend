const rawImages = import.meta.glob('@/assets/judge/profile/*.{png,jpg,jpeg}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

const sortedImageUrls = Object.entries(rawImages)
    .filter(([path]) => /judge\d+\.(png|jpg|jpeg)$/i.test(path))
    .sort(([pathA], [pathB]) => {
        const numA = parseInt(pathA.match(/judge(\d+)/)?.[1] || '0', 10);
        const numB = parseInt(pathB.match(/judge(\d+)/)?.[1] || '0', 10);
        return numA - numB;
    })
    .map(([_, url]) => url);

export const getJudgeImage = (judgeId: number): string => {
    // judgeId가 1부터 시작한다고 가정 (0번 인덱스 = ID 1)
    return sortedImageUrls[judgeId - 1] || ''; 
};