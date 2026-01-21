import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Intro from './pages/Intro.tsx';
import Create from './pages/Create.tsx';
import Setup from './pages/Setup.tsx';
import GameRoom from './pages/GameRoom.tsx';
import NotFound from './pages/NotFound';

// 임시 페이지 컴포넌트 (나중에 src/pages/.. 로 분리하세요)
const TempResult = () => <div className="p-10 text-2xl font-bold">결과 화면</div>;

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Routes>
          {/* 1. 메인화면 */}
          <Route path="/" element={<Intro />} />
          
          {/* 2. 방 설정(방장만 보게 될) */}
          <Route path="/create" element={<Create />} />
          
          {/* 3. 프로필 설정(캐릭터, 닉네임) */}
          <Route path="/setup" element={<Setup />} />
          
          {/* 4. 게임 플레이(로비부터 결과까지 다) */}
          <Route path="/game/:roomId" element={<GameRoom />} />
          
          {/* 없는 주소면 홈으로 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;