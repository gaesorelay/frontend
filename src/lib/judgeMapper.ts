const rawImages = import.meta.glob('@/assets/judge/profile/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

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

// --- ✨ [신규] 결과 화면용 로직 추가 ---
const rawResultImages = import.meta.glob('@/assets/judge/result/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

const sortedResultUrls = Object.entries(rawResultImages)
    // 경로에서 숫자만 추출 (예: "1.png" -> "1")
    .sort((a, b) => {
        const numA = parseInt(a[0].match(/(\d+)\./)?.[1] || '0', 10);
        const numB = parseInt(b[0].match(/(\d+)\./)?.[1] || '0', 10);
        return numA - numB;
    })
    .map(([_, url]) => url);

export const getResultJudgeImage = (judgeId: number): string => {
    // 1.png가 ID 1번이라면 -1 인덱스 사용
    return sortedResultUrls[judgeId - 1] || '';
};