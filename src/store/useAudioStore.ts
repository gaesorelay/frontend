import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AudioState {
    isMuted: boolean;
    setMuted: (muted: boolean) => void;
    toggleMute: () => void;
}

export const useAudioStore = create<AudioState>()(
    persist(
        (set) => ({
            isMuted: false,
            setMuted: (muted) => set({ isMuted: muted }),
            toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
        }),
        {
            name: 'audio-storage', // 로컬 스토리지에 저장하여 새로고침해도 유지
            storage: createJSONStorage(() => sessionStorage), // 세션 스토리지 사용 (탭 닫으면 초기화)
        }
    )
);
