import axios from 'axios';

// 📡 백엔드 API 기본 주소 설정
// .env 파일에서 백엔드 주소를 가져옵니다 (없으면 로컬호스트)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const client = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // 쿠키 등 인증 정보 포함
    headers: {
        'Content-Type': 'application/json',
    },
});

export default client;
