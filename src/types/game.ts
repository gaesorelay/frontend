export type RoomStatus = 'WAITING' | 'PLAYING' | 'ENDED';

// ⭐️ [수정] HOST 제거 (isHost로 대체)
export type UserRole = 'PLAYER' | 'AUDIENCE';
export type UserTeam = 'A' | 'B' | null; // TeamSlot 컴포넌트와 통일 ('A' | 'B' | null)

export type RoomConfig = {
  title: string;
  maxPlayers: number;
  // totalRounds: number;
  roundTime: number;
  voteTime: number;
  storytellerCount: number;
  // imageCount: number;
};

export type RoomInfo = {
  roomUuid: string;
  ownerUserToken: string;
  title: string;
  status: RoomStatus;
  config: RoomConfig;
  createdAt: string;
};

export type Player = {
  userToken: string;
  socketId?: string;
  roomUuid: string;
  nickname: string;
  role: UserRole;
  isHost: boolean;
  team: UserTeam;
  slotIndex: number | null; // 몇 번째 의자인지
  avatar: string;
  ipAddress?: string;
  isReady: boolean;
};

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
};

export type GamePhase = 
  | 'LOBBY'             // 대기실
  | 'CARD_SHUFFLE'      // 카드 섞기
  | 'JUDGE_SHUFFLE'     // 심사위원 선정
  | 'WRITING'           // 글쓰기
  | 'VOTING'            // 투표
  | 'JUDGE_RESULT'      // 결과 발표
  | 'FINAL_RESULT';     // 최종 우승


export interface RoundData {
cardIds: number[];  // [1, 5, 20...]
judgeIds: number[]; // [0, 2, 4]
// 나중에 '주제' 같은 게 생기면 여기에 추가 (topicId: number)
}