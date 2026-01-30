// src/lib/sound.ts

/**
 * 🔘 클릭 / UI 효과음 재생
 */
export const playClickSound = (src: string, volume: number = 1.0) => {
    try {
        const audio = new Audio(src);
        audio.volume = volume;
        audio.play();
    } catch (e) {
        console.warn('Click sound play failed:', e);
    }
};
