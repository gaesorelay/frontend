import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  ChatMessage,
  GameState,
  Player,
  RoomConfig,
  RoomInfo,
  VoteResult,
  GamePhase,
  RoundData,
} from '../types/game';

interface GameStoreState {
  roomConfig: RoomConfig | null;
  roomTitle: string | null; // ⭐️ 저장용 방 제목 추가
  joinCode: string | null;
  roomInfo: RoomInfo | null;
  players: Player[];
  messages: ChatMessage[];
  gameState: GameState | null;
  voteResult: VoteResult | null;
  gamePhase: GamePhase;
  roundData: RoundData | null;

  setRoomActions: (title: string, config: RoomConfig) => void; // 통합 액션
  // setRoomConfig: (config: RoomConfig) => void; // Deprecated or removed
  setJoinCode: (code: string | null) => void;
  setRoomInfo: (info: RoomInfo | null) => void;
  setPlayers: (players: Player[]) => void;
  upsertPlayer: (player: Player) => void;
  removePlayer: (userToken: string) => void;
  addMessage: (message: ChatMessage) => void;
  setGameState: (state: GameState | null) => void;
  setVoteResult: (result: VoteResult | null) => void;
  setGamePhase: (phase: GamePhase) => void;
  setRoundData: (data: RoundData | null) => void;

  reset: () => void;
}

export const useGameStore = create<GameStoreState>()(
  persist(
    (set) => ({
      roomConfig: null,
      roomTitle: null,
      joinCode: null,
      roomInfo: null,
      players: [],
      messages: [],
      gameState: null,
      voteResult: null,
      gamePhase: 'LOBBY',
      roundData: null,
      setRoomActions: (title, config) => {
        console.log("💾 [GameStore] setRoomActions:", { title, config });
        set({ roomTitle: title, roomConfig: config });
      },
      setJoinCode: (code) => set({ joinCode: code }),
      setRoomInfo: (info) => set({ roomInfo: info }),
      setPlayers: (players) => set({ players }),
      upsertPlayer: (player) =>
        set((state) => {
          const next = state.players.filter((p) => p.userToken !== player.userToken);
          next.push(player);
          return { players: next };
        }),
      removePlayer: (userToken) =>
        set((state) => ({
          players: state.players.filter((p) => p.userToken !== userToken),
        })),
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      setGameState: (state) => set({ gameState: state }),
      setVoteResult: (result) => set({ voteResult: result }),
      setGamePhase: (phase) => set({ gamePhase: phase }),
      setRoundData: (data) => set({ roundData: data }),
      reset: () =>
        set({
          roomConfig: null,
          roomTitle: null,
          joinCode: null,
          roomInfo: null,
          players: [],
          messages: [],
          gameState: null,
          voteResult: null,
          gamePhase: 'LOBBY',
          roundData: null,
        }),
    }),
    {
      name: 'game-storage', // local storage key name
      storage: createJSONStorage(() => localStorage), // ⭐️ Debugging: localStorage
      onRehydrateStorage: () => {
        console.log('hydration starts');
        return (_state, error) => {
          if (error) {
            console.log('an error happened during hydration', error);
          } else {
            console.log('hydration finished');
          }
        };
      },
    }
  )
);
