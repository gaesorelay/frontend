import { io, Socket } from 'socket.io-client';

// .env 파일에서 백엔드 주소를 가져옵니다 (없으면 로컬호스트)
const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 소켓 인스턴스를 하나만 생성합니다.
export const socket: Socket = io(`${SERVER_URL}/game`, {
  autoConnect: false, // 처음부터 바로 연결하지 않고, 필요할 때 connect() 호출
  withCredentials: true, // 쿠키/인증 헤더 허용
  transports: ['websocket'], // polling 방지 (즉시 웹소켓 사용)
});

// 디버깅용 로그
socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('❌ Socket disconnected');
});