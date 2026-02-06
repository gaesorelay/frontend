# 🐶 개소릴레이 (Gaeso Relay) Client

SSAFY 14기 자율프로젝트 A608 **개소릴레이** 프론트엔드 레포지토리입니다.
React + TypeScript + Vite + Zustand + Socket.io-client 기반으로 구축되었습니다.

## 📂 프로젝트 구조 (Project Structure)

주요 디렉토리 및 파일의 역할 설명입니다.

```text
frontend/
├── public/                 # 정적 리소스 (favicon, robots.txt 등)
│
├── src/
│   ├── api/                # [API] 백엔드 통신 로직
│   │   ├── roomApi.ts      # 방 생성, 조회, 입장 (REST)
│   │   └── gameApi.ts      # 게임 관련 추가 API
│   │
│   ├── assets/             # [자산] 이미지, 사운드, 아이콘
│   │   ├── decorations/    # 게임 내 장식, 이모지 이미지
│   │   ├── dog/            # 멍멍이 아바타 이미지
│   │   ├── logo/           # 로고 이미지
│   │   └── sound/          # 배경음악, 효과음
│   │
│   ├── components/
│   │   ├── common/         # [공통 UI] 버튼, 모달, 토스트 등 재사용 컴포넌트
│   │   │
│   │   └── game/           # [게임 UI] 핵심 게임 로직 및 컴포넌트
│   │       ├── phases/     # ⭐️ 게임 진행 단계별 컴포넌트
│   │       │   ├── LobbyPhase.tsx        # [대기실] 팀 선택, 캐릭터 설정
│   │       │   ├── CardShufflePhase.tsx  # [카드 배분] 발표 순서/카드 섞기
│   │       │   ├── JudgeShufflePhase.tsx # [심사위원 선정] AI 심사위원 배정
│   │       │   ├── WritingPhase.tsx      # [글쓰기] 릴레이 소설 작성 (핵심)
│   │       │   ├── StoryPhase.tsx        # [낭독] 완성된 스토리 감상
│   │       │   ├── VotingPhase.tsx       # [투표] 더 재미있는 팀 투표
│   │       │   ├── JudgeResultPhase.tsx  # [심사] AI 심사위원 점수 및 코멘트 (TTS)
│   │       │   └── FinalResultPhase.tsx  # [결과] 최종 승리 팀 발표
│   │       │
│   │       ├── ChatArea.tsx          # 실시간 채팅 및 리액션(이모지) 발사
│   │       ├── StoryBoardArea.tsx    # 릴레이 소설이 작성되는 칠판 영역
│   │       ├── AudienceList.tsx      # 관전자 목록 표시
│   │       ├── DisturbanceLayer.tsx  # 방해 공작 효과 레이어
│   │       └── TutorialArea.tsx      # 게임 설명 튜토리얼 모달
│   │
│   ├── constants/          # [상수] 설정값 관리 (이벤트, 룸 설정 등)
│   │
│   ├── hooks/              # [커스텀 훅]
│   │   ├── useSocket.ts    # 소켓 연결/해제 관리
│   │   └── useAudio.ts     # 오디오 재생 관련 훅
│   │
│   ├── lib/                # [라이브러리/유틸]
│   │   ├── socket.ts       # Socket.io 싱글톤 인스턴스
│   │   └── utils.ts        # Tailwind 유틸 등 Helper 함수
│   │
│   ├── pages/              # [페이지] 라우트 단위 컴포넌트
│   │   ├── Intro.tsx       # 메인 진입 화면
│   │   ├── GameRoom.tsx    # ⭐️ 게임 메인 컨트롤러 (모든 페이즈 관리)
│   │   └── Create.tsx      # 방 만들기 화면
│   │
│   ├── store/              # [상태 관리] Zustand Store
│   │   ├── useGameStore.ts # 게임 데이터 (턴, 점수, 스토리 등)
│   │   ├── useUserStore.ts # 유저 정보 (내 정보, 토큰 등)
│   │   └── useAudioStore.ts# 오디오 설정 (BGM, SFX, 뮤트)
│   │
│   ├── App.tsx             # 라우팅 설정 (React Router)
│   └── main.tsx            # 진입점
```

## 🛠️ 핵심 컴포넌트 설명

### `GameRoom.tsx`
- 게임의 메인 페이지입니다.
- **Socket Event Handling**: 서버로부터 `game_phase_update`를 받아 현재 페이즈를 전환합니다.
- **Render Phase**: 현재 `gamePhase` 상태에 따라 알맞은 서브 컴포넌트(`phases/*`)를 렌더링합니다.

### `phases/WritingPhase.tsx`
- 게임의 가장 핵심적인 릴레이 글쓰기 단계입니다.
- **Timer**: 0.1초 단위의 정밀 타이머로 남은 시간을 표시합니다.
- **Turn Management**: 현재 누구의 턴인지 표시하고, 입력 권한을 제어합니다.
- **Real-time Typing**: 소켓을 통해 다른 플레이어의 타이핑을 실시간으로 동기화합니다.

### `ChatArea.tsx`
- 실시간 채팅과 **리액션(이모지)** 기능을 담당합니다.
- **Floating Emojis**: 유저가 이모지를 보내면 화면 위로 떠오르는 애니메이션 효과를 보여줍니다.
- **Random Position**: 이모지 시작 위치를 랜덤하게 분산시켜 화면을 풍성하게 채웁니다.

### `store/useGameStore.ts`
- 게임 진행에 필요한 모든 전역 상태를 관리합니다.
- `messages`: 채팅 로그
- `players`: 현재 접속자 목록
- `roundData`: 현재 라운드 정보 (카드, 심사위원 등)

## 🚀 시작하기 (Getting Started)

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```
