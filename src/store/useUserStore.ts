import { create } from 'zustand';

interface UserState {
  nickname: string;
  avatarId: number;
  roomId: string | null; // 내가 들어갈 방 번호
  
  // 액션(함수)
  setProfile: (nickname: string, avatarId: number) => void;
  setRoomId: (roomId: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  nickname: "",
  avatarId: 1,
  roomId: null,

  setProfile: (nickname, avatarId) => set({ nickname, avatarId }),
  setRoomId: (roomId) => set({ roomId }),
}));