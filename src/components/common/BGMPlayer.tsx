import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAudioStore } from '@/store/useAudioStore';
import { useGameStore } from '@/store/useGameStore';

import waitingMp3 from '@/assets/sound/waiting.mp3';
import bgm1 from '@/assets/sound/BGM1.mp3';
import bgm3 from '@/assets/sound/BGM3.mp3';
import gameoverMp3 from '@/assets/sound/gameover.mp3';
import finishMp3 from '@/assets/sound/finish.mp3';

const BGMPlayer = () => {
    const location = useLocation();
    const { isMuted } = useAudioStore();
    const { gamePhase } = useGameStore();

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const currentTrackRef = useRef<string | null>(null);

    // STORY 페이즈 전용: GAMEOVER(1회) -> FINISH(반복) 관리
    const [storyBgmMode, setStoryBgmMode] = useState<'GAMEOVER' | 'FINISH'>('GAMEOVER');

    // 1. 페이즈가 STORY가 아니면 모드 초기화
    useEffect(() => {
        if (gamePhase !== 'STORY') {
            setStoryBgmMode('GAMEOVER');
        }
    }, [gamePhase]);

    // 2. 메인 BGM 제어 로직
    useEffect(() => {
        // 오디오 객체 싱글톤 초기화
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.volume = 0.5;
        }

        const audio = audioRef.current;
        const path = location.pathname;
        let targetTrack: string | null = null;
        let shouldLoop = true;

        // --- 트랙 결정 로직 ---
        if (path === '/' || ['/intro', '/create', '/setup'].some(p => path.startsWith(p))) {
            targetTrack = bgm1;
        }
        else if (path.startsWith('/gameroom')) {
            if (gamePhase === 'LOBBY') {
                targetTrack = waitingMp3;
            }
            else if (gamePhase === 'STORY') {
                if (storyBgmMode === 'GAMEOVER') {
                    targetTrack = gameoverMp3;
                    shouldLoop = false; // 1회 재생
                } else {
                    targetTrack = finishMp3;
                }
            }
            else if (['VOTING', 'JUDGE_RESULT', 'FINAL_RESULT'].includes(gamePhase)) {
                targetTrack = finishMp3;
            }
        }

        // --- 재생 제어 ---
        if (targetTrack !== currentTrackRef.current) {
            if (targetTrack) {
                audio.src = targetTrack;
                audio.loop = shouldLoop;
                audio.load();
                currentTrackRef.current = targetTrack;

                if (!isMuted) {
                    audio.play().catch(err => console.warn("BGM Play Blocked:", err));
                }
            } else {
                audio.pause();
                currentTrackRef.current = null;
            }
        } else {
            // 같은 트랙 내에서 loop 설정만 바뀔 수 있음 (STORY 페이즈 등)
            audio.loop = shouldLoop;
        }

        audio.muted = isMuted;

        // --- 이벤트 리스너: GAMEOVER 종료 후 FINISH로 전환 ---
        const handleEnded = () => {
            if (currentTrackRef.current === gameoverMp3 && gamePhase === 'STORY') {
                setStoryBgmMode('FINISH');
            }
        };

        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);

    }, [location.pathname, gamePhase, isMuted, storyBgmMode]);

    // 3. 브라우저 정책 대응 (사용자 클릭 시 재생 시도)
    useEffect(() => {
        const handleInteraction = () => {
            if (audioRef.current?.paused && !isMuted && currentTrackRef.current) {
                audioRef.current.play().catch(() => { });
            }
        };
        window.addEventListener('click', handleInteraction);
        return () => window.removeEventListener('click', handleInteraction);
    }, [isMuted]);

    return null;
};

export default BGMPlayer;