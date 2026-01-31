import { socket } from './socket';
import { useGameStore } from '../store/useGameStore';

// 서버로 부터 'test_response' 이벤트를 받으면, handleTestResponse 실행
// 'test_message' 이벤트를 받으면, 'hello from client' 데이터 전송
export function initSocketHandlers() {
  const addMessage = useGameStore.getState().addMessage;

  const handleTestResponse = (payload: string) => {
    addMessage({
      id: `${Date.now()}`,
      userToken: 'server',
      nickname: 'server',
      text: payload,
      createdAt: new Date().toISOString(),
    });
  };

  // ⭐️ [이벤트] 강퇴 알림 (Kicked)
  const handleKicked = (data: { roomUuid: string; reason: string }) => {
    console.warn(`🚨 방에서 강퇴되었습니다. (사유: ${data.reason})`);
    alert(data.reason ? `방장에 의해 강퇴되었습니다.\n(사유: ${data.reason})` : '방장에 의해 강퇴되었습니다.');

    // 소켓 끊고 홈으로 이동 (완전 초기화)
    socket.disconnect();
    window.location.href = '/';
  };

  socket.on('test_response', handleTestResponse);
  socket.on('kicked', handleKicked);
  socket.emit('test_message', 'hello from client');

  return () => {
    socket.off('test_response', handleTestResponse);
    socket.off('kicked', handleKicked);
  };
}
