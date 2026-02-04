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

    // 오디오 객체와 현재 트랙 정보를 관리하는 Ref
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const currentTrackRef = useRef<string | null>(null); // 현재 재생 중인 소스 URL (또는 식별자)

    // STORY 페이즈 전용 상태: 'GAMEOVER' -> 'FINISH' 순차 재생 관리
    const [storyBgmMode, setStoryBgmMode] = useState<'GAMEOVER' | 'FINISH'>('GAMEOVER');

    // 페이즈가 변경되면 스토리 BGM 모드를 초기화
    useEffect(() => {
        if (gamePhase !== 'STORY') {
            setStoryBgmMode('GAMEOVER');
        }
    }, [gamePhase]);

    useEffect(() => {
        // 1. 오디오 객체 초기화
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.volume = 0.5;
        }

        const audio = audioRef.current;
        const path = location.pathname;

        // 2. 재생할 트랙 결정
        let targetTrack: string | null = null;
        let shouldLoop = true;

        // (1) Intro ~ Setup 구간
        if (
            path === '/' ||
            path.startsWith('/intro') ||
            path.startsWith('/create') ||
            path.startsWith('/setup')
        ) {
            targetTrack = bgm1;
        }
        // (2) GameRoom - Lobby 구간
        else if (path.startsWith('/gameroom') && gamePhase === 'LOBBY') {
            targetTrack = waitingMp3;
        }
        // (3) GameRoom - Writing 구간 (TURN1 ~ TURN6)
        else if (path.startsWith('/gameroom') && gamePhase.startsWith('TURN')) {
            targetTrack = bgm3;
        }
        // (4) GameRoom - Story (낭독) 구간
        // ⭐️ gameover(1회) -> finish(무한) 순차 재생
        else if (path.startsWith('/gameroom') && gamePhase === 'STORY') {
            if (storyBgmMode === 'GAMEOVER') {
                targetTrack = gameoverMp3;
                shouldLoop = false; // 한 번만 재생
            } else {
                targetTrack = finishMp3;
                shouldLoop = true;
            }
        }
        // (5) GameRoom - 그 이후 (투표 ~ 최종 결과) -> Finish BGM
        else if (
            path.startsWith('/gameroom') &&
            (gamePhase === 'VOTING' || gamePhase === 'JUDGE_RESULT' || gamePhase === 'FINAL_RESULT')
        ) {
            targetTrack = finishMp3;
        }

        // 3. 트랙 변경 감지 및 소스 교체
        if (targetTrack !== currentTrackRef.current) {
            if (targetTrack) {
                // 새 트랙으로 교체
                audio.src = targetTrack;
                audio.loop = shouldLoop; // 루프 설정 적용
                audio.load();
                currentTrackRef.current = targetTrack;

                // 소리 켜져있으면 바로 재생
                if (!isMuted) {
                    audio.play().catch(err => console.log("BGM Play Error:", err));
                }
            } else {
                // 트랙이 없음
                audio.pause();
                audio.currentTime = 0;
                currentTrackRef.current = null;
            }
        } else {
            // 트랙이 같은 경우에도 loop 속성이 바뀌었을 수 있으므로 업데이트
            if (audio.loop !== shouldLoop) {
                audio.loop = shouldLoop;
            }
            // 멈춰있다면 재생 (방어 코드)
            if (targetTrack && audio.paused && !isMuted) {
                audio.play().catch(() => { });
            }
        }

        // 4. 뮤트 상태 즉각 반영
        audio.muted = isMuted;

        // 5. 'ended' 이벤트 리스너: gameover가 끝나면 finish로 전환
        const handleEnded = () => {
            if (currentTrackRef.current === gameoverMp3 && gamePhase === 'STORY') {
                setStoryBgmMode('FINISH');
            }
        };

        audio.addEventListener('ended', handleEnded);
        return () => {
            audio.removeEventListener('ended', handleEnded);
        };

    }, [location.pathname, gamePhase, isMuted, storyBgmMode]); // storyBgmMode 의존성 추가

    // ... (인터랙션 핸들러 등은 유지) ...

    // 5. 브라우저 정책상 자동 재생이 막혔을 때, 사용자 인터랙션 발생 시 재생 시도
    useEffect(() => {
        const handleInteraction = () => {
            const audio = audioRef.current;
            if (audio && audio.paused && !isMuted && currentTrackRef.current) {
                audio.play().catch(() => { });
            }
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('keydown', handleInteraction);

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
    }, [isMuted]);

    return null; // UI는 없음
};

export default BGMPlayer;
