import { create } from 'zustand';

interface GameState {
  roomId: string | null;
  currentRound: number;
  timeLeft: number;
  isGameStarted: boolean;
  
  // Actions
  setRoomId: (id: string) => void;
  updateTimer: (time: number) => void;
  startGame: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  roomId: null,
  currentRound: 1,
  timeLeft: 0,
  isGameStarted: false,

  setRoomId: (id) => set({ roomId: id }),
  updateTimer: (time) => set({ timeLeft: time }),
  startGame: () => set({ isGameStarted: true }),
  resetGame: () => set({ 
    roomId: null, 
    currentRound: 1, 
    timeLeft: 0, 
    isGameStarted: false 
  }),
}));