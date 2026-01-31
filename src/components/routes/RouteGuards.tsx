import { useEffect, useState } from 'react';
import { Navigate, Outlet, useParams, useLocation } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';
import { useUserStore } from '@/store/useUserStore';
import { socket } from '@/lib/socket';

/**
 * 🛡️ [Guard 1] 방 유효성 검사 (RoomValidationGuard)
 * - URL의 :roomId가 실제 존재하는지 서버에 확인합니다.
 * - 존재하면 하위 라우트(Outlet)를 렌더링하고, 아니면 404로 보냅니다.
 * - Setup, GameRoom 페이지 모두에 적용됩니다.
 */
export const RoomValidationGuard = () => {
    const { roomId } = useParams();
    const [isValid, setIsValid] = useState<boolean | null>(null);

    useEffect(() => {
        if (!roomId) {
            setIsValid(false);
            return;
        }

        if (socket.disconnected) socket.connect();

        console.log(`🔍 [Guard] 방(${roomId}) 유효성 검사 시작...`);

        socket.emit('request_room_info', { roomId }, (response: any) => {
            if (response.status === 'success') {
                console.log(`✅ [Guard] 유효한 방입니다.`);
                setIsValid(true);
            } else {
                console.error(`❌ [Guard] 유효하지 않은 방:`, response.message);
                setIsValid(false);
            }
        });
    }, [roomId]);

    if (isValid === null) {
        return <div className="fixed inset-0 flex items-center justify-center bg-slate-900 text-white font-bold text-xl">방 확인 중... 🔍</div>;
    }

    if (!isValid) {
        return <Navigate to="/error/not-found" replace />;
    }

    return <Outlet />;
};

/**
 * 🛡️ [Guard 2] 게임 입장 권한 검사 (GameEntryGuard)
 * - 사용자가 닉네임/아바타 설정을 완료하고 '입장하기'를 눌렀는지(hasEntered) 확인합니다.
 * - 아니면 Setup 페이지로 쫓아냅니다.
 * - GameRoom 페이지에만 적용됩니다.
 */
export const GameEntryGuard = () => {
    const { roomId } = useParams();
    const { hasEntered } = useGameStore();
    const { isHost } = useUserStore();

    // 배포/테스트 환경 변수나 로직에 따라 테스트 모드는 통과시킬 수도 있음
    const TEST_MODE = false;

    // 방장은 스토어가 초기화되었을 수도 있어서 예외를 두거나, 
    // 방장도 엄격하게 Setup을 거치게 하려면 !isHost 조건을 빼면 됩니다.
    // 여기서는 "방장이거나, 테스트모드거나, 입장절차를 밟았으면 패스"로 설정
    const canEnter = hasEntered || isHost || TEST_MODE;

    if (!canEnter) {
        console.warn(`⛔️ [Guard] 입장 권한 없음. Setup으로 이동합니다.`);
        return <Navigate to={`/setup/${roomId}`} replace />;
    }

    return <Outlet />;
};
