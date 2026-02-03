import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAudioStore } from '@/store/useAudioStore';
import bgmMp3 from '@/assets/sound/BGM1.mp3';

export default function BGMPlayer() {
    const { isMuted } = useAudioStore();
    const location = useLocation();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // 1. 오디오 초기화
    useEffect(() => {
        const audio = new Audio(bgmMp3);
        audio.loop = true;
        audio.volume = 0.5;
        audioRef.current = audio;

        // 모바일 등 자동재생 정책 대응
        const attemptPlay = () => {
            if (audio.paused && !isMuted) {
                audio.play().catch(() => {
                    // 아직 준비 안됨
                });
            }
        };

        document.addEventListener('click', attemptPlay, { once: true });

        // 초기 로드시 자동 재생 시도
        if (!isMuted) {
            audio.play().catch(() => { });
        }

        return () => {
            audio.pause();
            document.removeEventListener('click', attemptPlay);
        };
    }, []);

    // 2. 뮤트 상태 반영
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.muted = isMuted;
            if (!isMuted && audio.paused) {
                // 게임 방이 아닐 때만 재생
                if (!location.pathname.startsWith('/gameroom')) {
                    audio.play().catch(() => { });
                }
            }
        }
    }, [isMuted]);

    // 3. 페이지 이동 감지 (게임방 진입 시 정지, 나중에 나오면 다시 재생?)
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const isGameRoom = location.pathname.startsWith('/gameroom');

        if (isGameRoom) {
            // 게임방에서는 BGM 정지 (게임 전용 BGM이 있을 수 있음)
            audio.pause();
        } else {
            // 대기실 등으로 나오면 다시 재생 (뮤트 아닐 경우)
            if (!isMuted && audio.paused) {
                audio.play().catch(() => { });
            }
        }
    }, [location.pathname, isMuted]);

    return null; // UI 없음 (소리만 재생)
}
