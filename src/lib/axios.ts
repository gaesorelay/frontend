import axios from 'axios';

// 📡 백엔드 API 기본 주소 설정
// (개발 환경에서는 http://localhost:8000/api)
const BASE_URL = 'https://gsrelay.o-r.kr/api';

export const client = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // 쿠키 등 인증 정보 포함
    headers: {
        'Content-Type': 'application/json',
    },
});

export default client;
