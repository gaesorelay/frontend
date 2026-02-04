import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';


// bgm
import main from '@/assets/sound/BGM1.mp3';
import lobby from '@/assets/sound/waiting.mp3';
import game from '@/assets/sound/BGM3.mp3';

// sfx
import cardShuffle from '@/assets/sound/CARDSHUFFLE.wav';
import cardOpen from '@/assets/sound/CARDOPEN.wav';
import dog1 from '@/assets/sound/bark.wav';
import dog2 from '@/assets/sound/bark2.wav';
import dog3 from '@/assets/sound/bark3.wav';
import click from '@/assets/sound/click.mp3';
import gameFinish from '@/assets/sound/GAMEFINISH.wav';
import paper from '@/assets/sound/PAPER.wav';

const SOUND_ASSETS = {
    BGM: {
        MAIN: main, // 메인 & 캐릭터 선택 공용
        LOBBY: lobby,
        GAME: game,
    },
    SFX: {
        CARDSHUFFLE: cardShuffle,
        CARDOPEN: cardOpen,
        DOG1: dog1,
        DOG2: dog2,
        DOG3: dog3,
        CLICK: click,
        GAMEFINISH: gameFinish,
        PAPER: paper,
    },
} as const;

type BGMType = keyof typeof SOUND_ASSETS.BGM;
type SFXType = keyof typeof SOUND_ASSETS.SFX;

interface AudioState {
    isMuted: boolean;
    bgmAudio: HTMLAudioElement | null;
    fadeInterval: number | null; // 페이드 인터벌 관리용
    setMuted: (muted: boolean) => void;
    toggleMute: () => void;
    playSFX: (type: SFXType) => void;
    playBGM: (type: BGMType) => void;
    stopBGM: (callback?: () => void) => void;
}

export const useAudioStore = create<AudioState>()(
    persist(
        (set, get) => ({
            isMuted: false,
            bgmAudio: null,
            fadeInterval: null,

            setMuted: (muted) => {
                set({ isMuted: muted });
                const { bgmAudio } = get();
                if (bgmAudio) bgmAudio.muted = muted;
            },

            toggleMute: () => get().setMuted(!get().isMuted),

            playSFX: (type) => {
                const audio = new Audio(SOUND_ASSETS.SFX[type]);
                audio.volume = get().isMuted ? 0 : 0.5;
                audio.play().catch(() => { });
            },

            playBGM: (type) => {
                const { bgmAudio, isMuted, stopBGM } = get();
                const newSrc = SOUND_ASSETS.BGM[type];
                console.log("재생 시도 타입:", type); // 로그

                // 1. 이미 같은 곡이 있을 때의 처리 (주석 해제 버전)
                if (bgmAudio) {
                    // .src는 전체 URL을 반환하므로 끝부분만 비교하는 게 가장 정확해!
                    const isSameTrack = bgmAudio.src.endsWith(newSrc) || bgmAudio.src.includes(newSrc);

                    if (isSameTrack) {
                        // 소리가 안 나고 있다면(차단되었었다면) 다시 재생 시도
                        if (bgmAudio.paused && !isMuted) {
                            bgmAudio.play().catch(() => { });
                        }
                        return; // 같은 곡이 이미 재생 중이면 여기서 중단 (노래 끊김 방지)
                    }
                }

                const startNewAudio = () => {
                    console.log("새 오디오 객체 생성:", newSrc);
                    const nextAudio = new Audio(newSrc);
                    nextAudio.loop = true;
                    nextAudio.muted = isMuted;
                    // nextAudio.volume = 0;

                    nextAudio.play().then(() => {
                        let vol = 0;
                        const interval = window.setInterval(() => {
                            vol += 0.05;
                            if (vol >= 0.5) { // BGM 최대 볼륨 0.5로 제한
                                nextAudio.volume = 0.5;
                                clearInterval(interval);
                            } else {
                                nextAudio.volume = vol;
                            }
                        }, 50);
                        set({ fadeInterval: interval });
                    }).catch(() => console.log("유저 상호작용 필요"));

                    set({ bgmAudio: nextAudio });
                };

                if (bgmAudio) {
                    stopBGM(startNewAudio);
                } else {
                    startNewAudio();
                }
            },

            stopBGM: (callback) => {
                const { bgmAudio, fadeInterval } = get();
                if (fadeInterval) clearInterval(fadeInterval);

                if (!bgmAudio) {
                    if (callback) callback();
                    return;
                }

                let vol = bgmAudio.volume;
                const interval = window.setInterval(() => {
                    vol -= 0.05;
                    if (vol <= 0) {
                        bgmAudio.pause();
                        bgmAudio.currentTime = 0;
                        clearInterval(interval);
                        if (callback) callback();
                    } else {
                        bgmAudio.volume = Math.max(0, vol);
                    }
                }, 50);
                set({ fadeInterval: interval });
            },
        }),
        {
            name: 'audio-storage',
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({ isMuted: state.isMuted }),
        }
    )
);