import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAudioStore } from '@/store/useAudioStore';
import { useGameStore } from '@/store/useGameStore';

const BGMPlayer = () => {
  const location = useLocation();
  const { playBGM, playSFX, stopBGM, stopAllSFX } = useAudioStore();
  const { gamePhase, storyReviewFinished } = useGameStore();

  const [storyBgmMode, setStoryBgmMode] = useState<'GAMEOVER' | 'FINISH'>('GAMEOVER');

  // 효과음 중복 실행 방지용 Ref
  const hasPlayedGameOver = useRef(false);

  // 1. 페이즈 초기화 로직
  useEffect(() => {
    if (gamePhase !== 'STORY') {
      setStoryBgmMode('GAMEOVER');
      hasPlayedGameOver.current = false;
    }
  }, [gamePhase]);

  // 2. 메인 BGM 및 SFX 제어
  useEffect(() => {
    const path = location.pathname;

    // --- [섹션 A] 경로별 기본 BGM (Main, Lobby 등) ---
    if (path === '/' || ['/intro', '/create', '/setup'].some(p => path.startsWith(p))) {
      playBGM('MAIN');
    }
    else if (path.startsWith('/gameroom')) {
      // --- [섹션 B] 게임 페이즈별 BGM ---
      switch (gamePhase) {
        case 'LOBBY':
          stopAllSFX();
          playBGM('LOBBY');
          break;
        case 'CARD_SHUFFLE':
          playBGM('SHUFFLE');
          break;
        case 'VOTING':
          playBGM('VOTE');
          break;
        case 'JUDGE_RESULT':
        case 'FINAL_RESULT':
          playBGM('BOOGIE_PARTY');
          break;
        case 'STORY':
          handleStoryPhase();
          break;
      }
    }

    // STORY 페이즈 전용 핸들러
    function handleStoryPhase() {
      if (storyReviewFinished) {
        stopBGM();
        return;
      }

      if (storyBgmMode === 'GAMEOVER') {
        // SFX는 한 번만 실행되도록 제어
        if (!hasPlayedGameOver.current) {
          stopBGM(); // 이전 BGM 정리
          playSFX('GAME_OVER');
          hasPlayedGameOver.current = true;

          // 💡 Tip: GAME_OVER가 SFX라면, 길이를 계산해 수동으로 FINISH BGM으로 넘겨줍니다.
          // gameover.mp3의 길이를 확인해 보세요 (예: 3000ms)
          setTimeout(() => {
            setStoryBgmMode('FINISH');
          }, 3500);
        }
      } else {
        playBGM('FINISH');
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, gamePhase, storyBgmMode, storyReviewFinished]);
  return null;
};

export default BGMPlayer;
