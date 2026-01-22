export type RoomStatus = 'LOBBY' | 'PLAYING' | 'VOTING' | 'RESULT';
export type UserRole = 'HOST' | 'PLAYER' | 'AUDIENCE';
export type UserTeam = 'TEAM_A' | 'TEAM_B' | 'NONE';

export type RoomConfig = {
  title: string;
  maxPlayers: number;
  totalRounds: number;
  roundTime: number;
  voteTime: number;
  storytellerCount: number;
  imageCount: number;
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
  team: UserTeam;
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
