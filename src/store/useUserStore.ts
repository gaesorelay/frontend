import { create } from 'zustand';

// 1. 역할 타입 정의
export type UserRole = 'PLAYER' | 'AUDIENCE';

interface UserState {
  nickname: string;
  avatarId: number;
  roomId: string | null;
  
  // ⭐️ [추가] 내 신분증
  role: UserRole;   // 현재 나는 구경꾼인가 선수인가?
  isHost: boolean;  // 내가 방장인가? (권한)

  // 액션
  setProfile: (nickname: string, avatarId: number) => void;
  setRoomId: (roomId: string) => void;
  
  // ⭐️ [추가] 신분 변경 액션
  setUserStatus: (role: UserRole, isHost: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  nickname: "",
  avatarId: 1,
  roomId: null,
  
  // 초기값: 일단 모두 '관전자' & '방장 아님'으로 시작
  role: 'AUDIENCE', 
  isHost: false,

  setProfile: (nickname, avatarId) => set({ nickname, avatarId }),
  setRoomId: (roomId) => set({ roomId }),
  
  // 서버에서 내 정보 받아왔을 때 한방에 업데이트
  setUserStatus: (role, isHost) => set({ role, isHost }),
}));