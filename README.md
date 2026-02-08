# 🐶 개소릴레이 (Gaeso Relay) - Frontend

> **"말이 되든 말든 이어가라! 개연성은 없어도 재미는 확실한 릴레이 스토리 게임"**  
> 
> 개소릴레이는 여러 플레이어가 실시간으로 턴을 이어가며 하나의 엉뚱하고 재미있는 이야기를 완성하는 **웹 기반 멀티플레이어 게임**입니다.

---

## 📖 프로젝트 소개

**개소릴레이**는 "개소리"와 "릴레이"의 합성어로, 여러 유저들과 함께 예측 불가능한 스토리 흐름을 즐길 수 있는 서비스입니다. 

플레이어들은 제한된 시간 내에 랜덤 이미지를 보고 자신의 문장을 이어 써야 하며, 관객 투표와 AI 심사위원의 평가를 통해 승자를 결정합니다.

유저들이 즉흥적으로 이야기를 잇고 서로 반응하는 과정에서 끊임없는 유저 인터랙션이 발생하는 것이 서비스의 핵심 포인트입니다.

### 🎯 기획 의도
- 아이스브레이킹을 위한 게임
- 텍스트 기반의 창의적이고 유쾌한 소통 경험 제공
- 실시간 상호작용을 통한 몰입감 있는 게임 플레이
- 생성형 AI를 활용한 보조 및 심사 기능 도입

---

## ✨ 주요 기능

### 1. 🎨 몰입감 있는 UI/UX
- 키치(Kitsch)하고 유머러스한 디자인 컨셉
- 상황에 따른 다양한 애니메이션 및 시각 효과 (타이핑, 타이머 긴박감 등)

### 2. 🕒 실시간 상호작용
- Socket.IO 클라이언트를 통한 서버와의 실시간 데이터 동기화
- 다른 플레이어의 타이핑 상태 및 마우스 커서 실시간 표시
- 턴 전환, 게임 시작/종료 등의 이벤트 즉각 반영

### 3. 📝 스토리 작성 및 효과
- 제한 시간 내 문장을 입력하는 긴장감 넘치는 인터페이스
- 작성 중인 글자에 대한 타격감 있는 효과음 및 비주얼 피드백
- 이모지 및 리액션 기능을 통한 비언어적 소통

### 4. 🗳️ 결과 확인 및 투표
- 전체 스토리 로그를 직관적으로 확인 가능한 뷰어 제공
- 각 팀의 결과물에 대한 투표 UI
- AI 심사평 및 점수를 시각적으로 강조한 결과 화면

---

## 🛠️ 기술 스택 (Tech Stack)

| 분류 | 기술 | 비고 |
| --- | --- | --- |
| **Language** | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) | |
| **Framework** | ![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black) | Frontend Library (v19) |
| **Build Tool** | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) | High Performance Bundler |
| **State Management** | ![Zustand](https://img.shields.io/badge/Zustand-443E38?style=flat&logo=react&logoColor=white) | Global State Store |
| **Communication** | ![Socket.IO Client](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socketdotio&logoColor=white) | Real-time WebSocket |

---

## 📂 프로젝트 구조

```bash
frontend
├── 📂 exec                 # 포팅 매뉴얼 및 산출물 폴더
├── 📂 public               # 정적 리소스 (images, sounds 등)
├── 📂 src
│   ├── 📂 assets           # 컴포넌트 내 사용 에셋
│   ├── 📂 components       # React 컴포넌트
│   │   ├── 📂 common       # 공통 컴포넌트 (버튼, 모달 등)
│   │   ├── 📂 game         # 게임 진행 관련 컴포넌트 (Lobby, Writing, Result 등)
│   │   └── ...
│   ├── 📂 lib              # 소켓 설 및 유틸리티 함수
│   ├── 📂 pages            # 페이지 단위 컴포넌트
│   ├── 📂 store            # Zustand 상태 관리 스토어
│   ├── 📄 App.tsx          # 메인 앱 컴포넌트
│   └── 📄 main.tsx         # 진입점 (Entry Point)
├── 📄 .env                 # 환경 변수 설정
└── 📄 package.json
```

---

## 🚀 시작 가이드 (Getting Started)

### 1. 사전 요구 사항
- **Node.js**: v18.x 이상 (v24.13.0 권장)
- **NPM**: v9.x 이상

### 2. 설치 및 실행

**의존성 설치**
```bash
npm install
```

**개발 모드 실행**
```bash
npm run dev
```
- 브라우저에서 `http://localhost:5173` 접속

**프로덕션 빌드**
```bash
npm run build
```
- `dist` 폴더에 정적 파일 생성

### 3. 환경 변수 설정
최상위 경로에 `.env` 파일을 생성하고 다음 변수를 설정하세요.
```env
VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=ws://localhost:8000
```
- 배포 시에는 실제 도메인 주소로 변경 (`https://...`, `wss://...`)
