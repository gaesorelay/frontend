import { socket } from './socket';
import { useGameStore } from '../store/useGameStore';

// Handle socket events for global UI state.
export function initSocketHandlers() {
  const addMessage = useGameStore.getState().addMessage;
  const resetGameStore = useGameStore.getState().reset;

  const handleTestResponse = (payload: string) => {
    addMessage({
      id: `${Date.now()}`,
      userToken: 'server',
      nickname: 'server',
      text: payload,
      createdAt: new Date().toISOString(),
    });
  };

  const handleKicked = (data: { roomUuid: string; reason: string }) => {
    console.warn(`방에서 강퇴되었습니다. (사유: ${data.reason})`);

    socket.disconnect();

    const store = useGameStore.getState();
    store.setKickTitle(null);
    store.setKickReason(data.reason || '방장에 의해 강퇴되었습니다.');
  };

  const handleRoomClosed = (data: { reason?: string }) => {
    const defaultReason = '방장이 나가 방이 종료되었습니다.';
    const reason = data?.reason ? data.reason : defaultReason;
    console.warn(reason);

    try {
      sessionStorage.setItem('kickModalTitle', '방이 종료되었습니다.');
      sessionStorage.setItem('kickModalReason', reason);
    } catch {
      // Ignore storage errors.
    }

    resetGameStore();
    window.location.href = '/';
  };

  socket.on('test_response', handleTestResponse);
  socket.on('kicked', handleKicked);
  socket.on('room_closed', handleRoomClosed);
  socket.emit('test_message', 'hello from client');

  return () => {
    socket.off('test_response', handleTestResponse);
    socket.off('kicked', handleKicked);
    socket.off('room_closed', handleRoomClosed);
  };
}
