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
  roomTitle: string | null;
  joinCode: string | null;
  roomInfo: RoomInfo | null;
  players: Player[];
  messages: ChatMessage[];
  gameState: GameState | null;
  voteResult: VoteResult | null;
  gamePhase: GamePhase;
  roundData: RoundData | null;
  visitedRoomId: string | null;
  hasEntered: boolean;
  kickReason: string | null; // ⭐️ 강퇴 사유 (null이면 강퇴 아님)

  // ⭐️ [추가] 진행 중인 스토리 텍스트 (Dev Bar 제출용)
  draftText: string;
  setDraftText: (text: string) => void;

  teamAStory: string[];
  teamBStory: string[];

  setRoomActions: (title: string, config: RoomConfig) => void;
  setJoinCode: (code: string | null) => void;
  setRoomInfo: (info: RoomInfo | null) => void;
  setVisitedRoomId: (id: string | null) => void;
  setHasEntered: (entered: boolean) => void;
  setKickReason: (reason: string | null) => void; // ⭐️ 강퇴 알림 표시용
  setPlayers: (players: Player[]) => void;
  upsertPlayer: (player: Player) => void;
  removePlayer: (userToken: string) => void;
  addMessage: (message: ChatMessage) => void;
  setGameState: (state: GameState | null) => void;
  setVoteResult: (result: VoteResult | null) => void;
  setGamePhase: (phase: GamePhase) => void;
  setRoundData: (data: RoundData | null) => void;

  addStoryLine: (team: 'A' | 'B', text: string) => void;

  resetStory: () => void;
  reset: () => void;
}

// ⭐️ [변경] persist 미들웨어 제거 (새로고침 시 초기화 위함)
export const useGameStore = create<GameStoreState>()((set) => ({
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
  visitedRoomId: null,
  hasEntered: false, // ⭐️ 정상 입장 여부 체크
  teamAStory: [],
  teamBStory: [],
  addStoryLine: (team, text) => set((state) => ({
    teamAStory: team === 'A' ? [...state.teamAStory, text] : state.teamAStory,
    teamBStory: team === 'B' ? [...state.teamBStory, text] : state.teamBStory,
  })),
  resetStory: () => set({ teamAStory: [], teamBStory: [] }),
  kickReason: null, // 초기값 null

  draftText: '',
  setDraftText: (text) => set({ draftText: text }),

  setRoomActions: (title, config) => {
    console.log("💾 [GameStore] setRoomActions:", { title, config });
    set({ roomTitle: title, roomConfig: config });
  },
  setJoinCode: (code) => set({ joinCode: code }),
  setRoomInfo: (info) => set({ roomInfo: info }),
  setVisitedRoomId: (id) => set({ visitedRoomId: id }),
  setHasEntered: (entered) => set({ hasEntered: entered }),
  setKickReason: (reason) => set({ kickReason: reason }),
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
  setRoundData: (newData) =>
    set((state) => ({
      roundData: state.roundData ? { ...state.roundData, ...newData } : newData
    })),
  reset: () =>
    set({
      roomConfig: null,
      roomTitle: null,
      joinCode: null,
      roomInfo: null,
      visitedRoomId: null,
      hasEntered: false,
      players: [],
      messages: [],
      gameState: null,
      voteResult: null,
      gamePhase: 'LOBBY',
      roundData: null,
      kickReason: null,
    }),
}));
