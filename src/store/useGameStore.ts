import { create } from 'zustand';
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
  joinCode: string | null;
  roomInfo: RoomInfo | null;
  players: Player[];
  messages: ChatMessage[];
  gameState: GameState | null;
  voteResult: VoteResult | null;
  gamePhase: GamePhase;
  roundData: RoundData | null;

  setRoomConfig: (config: RoomConfig) => void;
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

export const useGameStore = create<GameStoreState>((set) => ({
  roomConfig: null,
  joinCode: null,
  roomInfo: null,
  players: [],
  messages: [],
  gameState: null,
  voteResult: null,
  gamePhase: 'LOBBY',
  roundData: null,
  setRoomConfig: (config) => set({ roomConfig: config }),
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
      joinCode: null,
      roomInfo: null,
      players: [],
      messages: [],
      gameState: null,
      voteResult: null,
      gamePhase: 'LOBBY',
      roundData: null,
    }),
}));
