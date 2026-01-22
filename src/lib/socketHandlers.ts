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

  socket.on('test_response', handleTestResponse);
  socket.emit('test_message', 'hello from client');

  return () => {
    socket.off('test_response', handleTestResponse);
  };
}
