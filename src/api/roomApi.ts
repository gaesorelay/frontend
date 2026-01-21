
// [가짜] 방 코드가 맞는지 검사하는 함수
export const checkRoomCodeApi = async (code: string) => {
  console.log(`📡 [API Request] 방 코드 확인 중: ${code}`);
  
  // 0.5초 뒤에 결과를 줌 (네트워크 딜레이 흉내)
  return new Promise<{ exists: boolean; roomId?: string }>((resolve) => {
    setTimeout(() => {
      // 테스트용: 코드가 '1234'면 성공, 아니면 실패
      if (code === "1234") {
        resolve({ exists: true, roomId: "ROOM_1234" });
      } else {
        resolve({ exists: false });
      }
    }, 500);
  });
};

export const createRoomApi = async (data: any) => {
  console.log(`📡 [API POST] 방 생성 요청:`, data);
  return new Promise<{ roomId: string; token: string }>((resolve) => {
    setTimeout(() => {
      // 랜덤 방 번호 생성 (예: RM_AD31)
      const mockRoomId = "RM_" + Math.random().toString(36).substring(2, 6).toUpperCase();
      resolve({ roomId: mockRoomId, token: "host_token_xyz" });
    }, 1000);
  });
};

// [가짜] 방 입장 요청 (참가자)
export const joinRoomApi = async (data: any) => {
  console.log(`📡 [API POST] 방 입장 요청:`, data);
  return new Promise<{ token: string }>((resolve) => {
    setTimeout(() => {
      resolve({ token: "guest_token_abc" });
    }, 1000);
  });
};