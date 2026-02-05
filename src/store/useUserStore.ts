import { create } from 'zustand';

// 1. 역할 타입 정의
export type UserRole = 'PLAYER' | 'AUDIENCE';

interface UserState {
  nickname: string;
  avatarId: number;
  roomId: string | null;

  // ⭐️ [추가] 나의 고유 토큰 (신분증)
  userToken: string | null;
  publicUserId: string | number | null;

  // 내 신분증
  role: UserRole;
  isHost: boolean;

  // 액션
  setProfile: (nickname: string, avatarId: number) => void;
  // 👇 [추가] 개별 설정 함수 (Setup 페이지 오류 해결용)
  setNickname: (nickname: string) => void;
  setAvatarId: (avatarId: number) => void;

  setRoomId: (roomId: string) => void;
  setUserStatus: (role: UserRole, isHost: boolean) => void;
  // ⭐️ [추가] 토큰 저장 함수
  setUserToken: (token: string) => void;
  setPublicUserId: (publicUserId: string | number | null) => void;

}

export const useUserStore = create<UserState>((set) => ({
  nickname: "",
  avatarId: 1,
  roomId: null,
  
  role: 'AUDIENCE', 
  isHost: false,

  // ⭐️ [추가] 초기값 null
  userToken: null,
  publicUserId: null,
  
  setProfile: (nickname, avatarId) => set({ nickname, avatarId }),
  
  // 👇 [추가] 구현
  setNickname: (nickname) => set({ nickname }),
  setAvatarId: (avatarId) => set({ avatarId }),

  setRoomId: (roomId) => set({ roomId }),
  setUserStatus: (role, isHost) => set({ role, isHost }),

  // ⭐️ [추가] 구현
  setUserToken: (userToken) => set({ userToken }),
  setPublicUserId: (publicUserId) => set({ publicUserId }),
}));