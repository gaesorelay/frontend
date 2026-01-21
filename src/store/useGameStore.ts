import { create } from 'zustand';

interface GameState {
  // 방 설정 정보 (방장용)
  roomConfig: {
    title: string;
    maxPlayers: number;
    totalRounds: number;
    roundTime: number;
    voteTime: number;
    storytellerCount: number; // 팀별 이야기꾼 수
    imageCount: number;       // 사용할 그림 개수 (변수로 분리, 나중에 테스트할때 바꿔가면서)
  } | null;

  joinCode: string | null;
  
  setRoomConfig: (config: GameState['roomConfig']) => void;
  setJoinCode: (code: string) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  roomConfig: null,
  joinCode: null,
  
  setRoomConfig: (config) => set({ roomConfig: config }),
  setJoinCode: (code) => set({ joinCode: code }),
  
  reset: () => set({ roomConfig: null, joinCode: null }),
}));