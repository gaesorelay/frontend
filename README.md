```text
frontend/
├── public/                     # 정적 파일 (favicon.ico, robots.txt 등)
│
├── src/
│   ├── api/                    # [API 함수] 백엔드 API 호출 로직 모음
│   │   ├── roomApi.ts          # 방 생성, 조회, 입장 관련
│   │   └── gameApi.ts          # 게임 결과 전송 등
│   │
│   ├── assets/                 # 이미지, 폰트, 아이콘
│   │   └── react.svg
│   │
│   ├── components/             # [UI 컴포넌트]
│   │   ├── common/             # 재사용 가능한 범용 UI
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Toast.tsx       # 알림 메시지 
│   │   │
│   │   ├── game/               # 게임 도메인 전용 UI
│   │   │   ├── GameTimer.tsx
│   │   │   ├── StoryCard.tsx
│   │   │   └── TypingBubble.tsx
│   │   │
│   │   └── layout/             # 레이아웃
│   │       ├── Header.tsx
│   │       └── Layout.tsx
│   │
│   ├── constants/              # [상수] 하드코딩 방지
│   │   ├── socketEvents.ts     # 소켓 이벤트 명칭 ('join_room' 등)
│   │   └── gameConfig.ts       # 제한 시간, 최대 인원 등 설정값
│   │
│   ├── hooks/                  # [커스텀 훅]
│   │   ├── useGameLogic.ts     # 게임 진행 로직
│   │   ├── useSocket.ts        # 소켓 연결 관리
│   │   └── useToast.ts         # 알림 표시 훅 
│   │
│   ├── lib/                    # [설정 및 유틸]
│   │   ├── axios.ts            # Axios 인스턴스 설정
│   │   ├── socket.ts           # Socket.io 싱글톤
│   │   └── utils.ts            # Tailwind cn() 등 유틸
│   │
│   ├── pages/                  # [페이지]
│   │   ├── Create.tsx          # 방만들기
│   │   ├── GameRoom.tsx        # 게임(로비부터 결과까지)
│   │   ├── Intro.tsx           # 진입 화면
│   │   ├── NotFound.tsx        # 오류 화면
│   │   └── Setup.tsx           # 닉네임, 캐릭터 설정 화면
│   │
│   ├── store/                  # [상태 관리] Zustand
│   │   ├── useGameStore.ts     # 게임 상태
│   │   └── useUserStore.ts     # 유저 상태
│   │
│   ├── types/                  # [타입 정의]
│   │   ├── api.d.ts            # API 응답 타입 
│   │   ├── game.d.ts           # 게임 데이터 타입
│   │   └── socket.d.ts         # 소켓 페이로드 타입
│   │
│   ├── App.tsx                 # 라우팅
│   ├── main.tsx                # 진입점
│   └── index.css               # 스타일
│
├── .env
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```
