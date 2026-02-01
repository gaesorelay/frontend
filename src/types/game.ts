// src/types/game.ts

export type RoomStatus = 'WAITING' | 'PLAYING' | 'ENDED'; // LOBBY 제거, WAITING 사용

// ⭐️ [수정] HOST 제거 -> boolean으로 대체
export type UserRole = 'PLAYER' | 'AUDIENCE';
export type UserTeam = 'A' | 'B' | null;

// ⭐️ [수정] 백엔드 RoomConfig와 변수명 통일
export type RoomConfig = {
  maxPlayers: number; // (teamSize 제거 -> maxPlayers 사용)
  storytellerCount: number; // 이야기꾼 수
  rounds: number; // (roundCount -> rounds)
  roundTime: number; // (roundTimeSeconds -> roundTime)
  voteTime: number; // (votingTimeSeconds -> voteTime)
};

export type RoomInfo = {
  roomId: string;
  ownerUserToken: string;
  title: string;
  status: RoomStatus;
  config: RoomConfig;
  createdAt: string;
};

// ⭐️ [수정] avatar -> avatarId 로 변경 (숫자로 관리)
export type Player = {
  userToken: string;
  socketId?: string;
  roomUuid: string;
  nickname: string;
  role: UserRole;
  isHost: boolean; // boolean 필드 확인
  team: UserTeam;
  slotIndex: number | null;
  avatarId: number; // avatar string 대신 id 사용 권장
  ipAddress?: string;
  isReady: boolean;
};

// ... 나머지 GameState, ChatMessage 등은 그대로 유지 ...
export type GameState = {
  roomUuid: string;
  currentRound: number;
  teamAOrder: string[];
  teamBOrder: string[];
  teamAImages: string[];
  teamBImages: string[];
  teamAStory: string[];
  teamBStory: string[];
  turnEndAt: string | null;
};

export type VoteJudge = {
  name: string;
  score: number;
  comment: string;
};

export type VoteResult = {
  roomUuid: string;
  votesTeamA: number;
  votesTeamB: number;
  judges: VoteJudge[];
  averageScore?: number;
};

export type ChatMessage = {
  id: string;
  userToken: string;
  nickname: string;
  text: string;
  createdAt: string;
  avatarId?: number;
};

export type GamePhase =
  | 'LOBBY'
  | 'CARD_SHUFFLE'
  | 'JUDGE_SHUFFLE'
  // 🔽 세분화된 턴 추가
  | 'TURN1'
  | 'TURN2'
  | 'TURN3'
  | 'TURN4'
  | 'TURN5'
  | 'TURN6'
  | 'TURN7'
  | 'TURN8'
  | 'STORY'
  | 'VOTING'
  | 'JUDGE_RESULT'
  | 'FINAL_RESULT';

export interface RoundData {
  cardIds: number[];
  judgeIds: number[];
  startedAt?: string; // ⭐️ 타이머 동기화용 시작 시간
}
