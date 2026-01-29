import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Intro } from './pages/Intro.tsx';
import Create from './pages/create/Create.tsx';
import Setup from './pages/setup/Setup.tsx';
import GameRoom from './pages/GameRoom.tsx';
import NotFound from './pages/NotFound';
import { socket } from './lib/socket';
import { initSocketHandlers } from './lib/socketHandlers';
import WritingPhase from './components/game/phases/WritingPhase';
import JudgeShufflePhase from './components/game/phases/JudgeShufflePhase.tsx';
import CardShufflePhase from './components/game/phases/CardShufflePhase.tsx';
import VotingPhase from './components/game/phases/VotingPhase.tsx';
import JudgeResultPhase from './components/game/phases/JudgeResultPhase.tsx';
import FinalResultPhase from './components/game/phases/FinalResultPhase.tsx';

// 임시 페이지 컴포넌트 (나중에 src/pages/.. 로 분리하세요)
const TempResult = () => <div className="p-10 text-2xl font-bold">결과 화면</div>;

function App() {
  useEffect(() => {
    socket.connect();
    const cleanup = initSocketHandlers();

    // [Debug] 디버깅용 스토어 전역 노출
    (window as any).gameStore = import('@/store/useGameStore').then(m => m.useGameStore);

    return () => {
      cleanup();
      socket.disconnect();
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Routes>
          {/* 1. 메인화면 */}
          <Route path="/" element={<Intro />} />

          {/* 2. 방 설정(방장만 보게 될) */}
          <Route path="/create" element={<Create />} />

          {/* 3. 프로필 설정(캐릭터, 닉네임) */}
          <Route path="/setup" element={<Setup />} />          {/* 방장이 들어올 때 */}
          <Route path="/setup/:roomId" element={<Setup />} />  {/* [추가] 게스트가 들어올 때 */}

          {/* 4. 게임 플레이(로비부터 결과까지 다) */}
          <Route path="/gameroom/:roomId" element={<GameRoom />} />

          {/* 개발용 임시 라우트 */}
          <Route path="/test/writing" element={<WritingPhase />} />
          <Route path="/test/cardshuffle" element={<CardShufflePhase 
          onFinish={() => console.log("테스트용 카드셔플 페이지로 이동")}/>} />

          <Route path="/test/judgeshuffle" element={<JudgeShufflePhase 
          onFinish={() => console.log("테스트용 심사위원셔플 페이지로 이동")}/>} />
          
          <Route path="/test/voting" element={<VotingPhase />} />
          <Route path="/test/judgeresult" element={<JudgeResultPhase />} />
          <Route path="/test/finalresult" element={<FinalResultPhase />} />



          {/* 없는 주소면 홈으로 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
