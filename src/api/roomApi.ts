import client from '@/lib/axios';
import type { RoomConfig } from '@/types/game';

// ----------------------------------------------------------------------
// 1. 방 생성 (Host)
// ----------------------------------------------------------------------

// ⚠️ 백엔드 CreateRoomDto와 100% 일치해야 함!
export interface CreateRoomRequest {
  title: string;
  config: RoomConfig;
  nickname: string; // 👈 hostProfile로 감싸지 말고 바로!
  avatarId: number; // 👈 여기도 바로!
}

export interface CreateRoomResponse {
  roomId: string;
  token: string;
  // 백엔드 CreateRoomResponseDto에 따라 더 있을 수 있음
}

export const createRoomApi = async (data: CreateRoomRequest): Promise<CreateRoomResponse> => {
  // console.log(`📡 [API POST] 방 생성 요청:`, data);
  // 백엔드: @Post('rooms')
  const response = await client.post<CreateRoomResponse>('/rooms', data);
  return response.data;
};

// ----------------------------------------------------------------------
// 2. 방 존재 확인
// ----------------------------------------------------------------------

export const checkRoomCodeApi = async (roomId: string) => {
  // console.log(`📡 [API GET] 방 조회 중: ${roomId}`);
  try {
    // 백엔드: @Get('rooms/:roomUuid')
    // 백엔드가 { status: 'success', data: roomInfo } 형태로 준다고 가정
    const response = await client.get(`/rooms/${roomId}`);

    if (response.data && response.data.data) {
      return { exists: true, roomId: roomId };
    } else {
      return { exists: false };
    }
  } catch (e) {
    console.error('방 조회 실패:', e);
    return { exists: false };
  }
};
