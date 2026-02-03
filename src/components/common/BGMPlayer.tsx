import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAudioStore } from '@/store/useAudioStore';
import { useGameStore } from '@/store/useGameStore';
import waitingMp3 from '@/assets/sound/waiting.mp3';
import bgm1 from '@/assets/sound/BGM1.mp3';

const BGMPlayer = () => {
    const location = useLocation();
    const { isMuted } = useAudioStore();
    const { gamePhase } = useGameStore();

    // 오디오 객체와 현재 트랙 정보를 관리하는 Ref
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const currentTrackRef = useRef<string | null>(null); // 현재 재생 중인 소스 URL (또는 식별자)

    useEffect(() => {
        // 1. 오디오 객체 초기화 (최초 1회)
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.loop = true;
            audioRef.current.volume = 0.5;
        }

        const audio = audioRef.current;
        const path = location.pathname;

        // 2. 재생할 트랙 결정
        let targetTrack: string | null = null;

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

        // 3. 트랙 변경 감지 및 소스 교체
        if (targetTrack !== currentTrackRef.current) {
            if (targetTrack) {
                // 새 트랙으로 교체
                audio.src = targetTrack;
                audio.load(); // 메타데이터 로드
                currentTrackRef.current = targetTrack;

                // 소리 켜져있으면 바로 재생
                if (!isMuted) {
                    audio.play().catch(err => console.log("BGM Play Error:", err));
                }
            } else {
                // 트랙이 없음 (재생 중지)
                audio.pause();
                audio.currentTime = 0;
                currentTrackRef.current = null;
            }
        } else {
            // 트랙이 같다면? 
            // -> 만약 targetTrack이 있는데 멈춰있고, 뮤트가 아니라면 재생 (재진입 등 방어)
            if (targetTrack && audio.paused && !isMuted) {
                audio.play().catch(() => { });
            }
        }

        // 4. 뮤트 상태 즉각 반영
        audio.muted = isMuted;

        // (예외 처리) 만약 뮤트가 풀렸는데 재생중이 아니라면 다시 play
        if (!isMuted && targetTrack && audio.paused) {
            audio.play().catch(() => { });
        }

    }, [location.pathname, gamePhase, isMuted]);

    return null; // UI는 없음
};

export default BGMPlayer;
