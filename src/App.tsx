import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Intro } from './pages/Intro.tsx';
import Create from './pages/create/Create.tsx';
import Setup from './pages/setup/Setup.tsx';
import GameRoom from './pages/GameRoom.tsx';
// import MyProfile from './pages/MyProfile.tsx'; // 제거
import NotFound from './pages/NotFound';;
import { socket } from './lib/socket';
import { initSocketHandlers } from './lib/socketHandlers';
import WritingPhase from './components/game/phases/WritingPhase';
import JudgeShufflePhase from './components/game/phases/JudgeShufflePhase.tsx';
import CardShufflePhase from './components/game/phases/CardShufflePhase.tsx';
import VotingPhase from './components/game/phases/VotingPhase.tsx';
import JudgeResultPhase from './components/game/phases/JudgeResultPhase.tsx';
import FinalResultPhase from './components/game/phases/FinalResultPhase.tsx';
import { RoomValidationGuard, GameEntryGuard } from '@/components/routes/RouteGuards';
import KickModal from '@/components/common/KickModal';
import BGMPlayer from '@/components/common/BGMPlayer'; // 🎵 추가
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
                {/* <DevRemote /> */}
                <BGMPlayer /> {/* 🎵 전역 BGM 플레이어 */}
                <KickModal />
                <Routes>
                    {/* 1. 메인화면 */}
                    <Route path="/" element={<Intro />} />

                    {/* 2. 방 만들기 */}
                    <Route path="/create" element={<Create />} />
                    {/* <Route path="/profile" element={<MyProfile />} /> */}

                    {/* 3. 방 입장 (Setup) & 게임방 (GameRoom) - 공통: 방 유효성 검사 */}
                    <Route element={<RoomValidationGuard />}>
                        {/* 3-1. 게스트 입장 (RoomID 검증 -> Setup) */}
                        <Route path="/setup/:roomId" element={<Setup />} />

                        {/* 3-2. 게임방 (RoomID 검증 -> 입장권한 검증 -> 입장) */}
                        <Route element={<GameEntryGuard />}>
                            <Route path="/gameroom/:roomId" element={<GameRoom />} />
                        </Route>
                    </Route>

                    {/* 3-3. 방장 입장 (RoomID 없음 -> Setup -> 방만듬 -> GameRoom 이동) 
                        참고: 방장은 /setup 경로로 들어와서 방을 만듦. 이때는 RoomID가 URL에 없음.
                        따라서 RoomValidationGuard 밖에 둠. 
                    */}
                    <Route path="/setup" element={<Setup />} />

                    {/* 개발용 임시 라우트 */}
                    <Route path="/test/cardshuffle" element={<CardShufflePhase />} />
                    <Route path="/test/judgeshuffle" element={<JudgeShufflePhase />} />
                    <Route path="/test/voting" element={<VotingPhase />} />
                    <Route path="/test/judgeresult" element={<JudgeResultPhase />} />
                    <Route path="/test/finalresult" element={<FinalResultPhase />} />

                    {/* 없는 주소면 홈으로 */}
                    <Route path="*" element={<NotFound />} />

                    {/* <Route path="/develop" element={<develop />} /> */}
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
