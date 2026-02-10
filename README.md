# 🐶 개소릴레이 (Gaesorelay)
<div align="center">
  <img src="https://velog.velcdn.com/images/zhy2on/post/6ac9a867-6896-43a7-89fa-e03fdc810bd2/image.png" />
</div>

> **"말이 되든 말든 이어가라! 개연성은 없어도 재미는 확실한 릴레이 스토리 게임"**  
> 
> 

- **개발기간**: 2026.01.12 ~ 2026.02.09 (**4주**)
- **플랫폼**: Web
- **개발인원**: 6명

---

## 📖 프로젝트 소개

- **개소릴레이**는 "개소리"와 "릴레이"의 합성어로, 여러 플레이어가 실시간으로 턴을 이어가며 하나의 엉뚱하고 재미있는 이야기를 완성하는 **웹 기반 멀티플레이어 게임**입니다.

- 플레이어들은 제한된 시간 내에 랜덤 이미지를 보고 자신의 문장을 이어 써야 하며, 관객 투표와 AI 심사위원의 평가를 통해 승자를 결정합니다.
- 유저들이 즉흥적으로 이야기를 잇고 서로 반응하는 과정에서 끊임없는 유저 인터랙션이 발생하는 것이 서비스의 핵심 포인트입니다.

---

## ✨ 주요 기능

|메인페이지|방 만들기|
|:---:|:---:|
|<img src="https://velog.velcdn.com/images/zhy2on/post/d88dd8bc-fe51-4fb9-8861-32d170c84c90/image.gif" width=500> |<img src="https://velog.velcdn.com/images/zhy2on/post/81312fa0-8571-4414-84e0-37e2edf22ce6/image.gif" width=500> | 
|코드로 입장 & 닉네임 설정| 대기실|
|<img src="https://velog.velcdn.com/images/zhy2on/post/5a1129ae-0d0d-48c7-b97d-dfb7d2f9882b/image.gif" width=500>|<img src="https://velog.velcdn.com/images/zhy2on/post/1641be49-5b00-4943-975c-e2093beed551/image.gif" width=500>|
|실시간 릴레이 글쓰기 (A팀)| 실시간 릴레이 글쓰기 (B팀)|
|<img src="https://velog.velcdn.com/images/zhy2on/post/9bf3e103-5173-4fca-9e27-5082c51f0a79/image.gif" width=500> |<img src="https://velog.velcdn.com/images/zhy2on/post/6b6a39b9-54be-4e6d-96b1-2cda5c1c7962/image.gif" width=500> |
|실시간 관객 참여 (댓글 / 반응)| 실시간 관객 참여 (투표)|
|<img src="https://velog.velcdn.com/images/zhy2on/post/ceebb347-db84-4300-a3f9-a284d043f826/image.gif" width=150> | <img src="https://velog.velcdn.com/images/zhy2on/post/315c62a5-e1b4-4b79-b298-eb55bce120e5/image.gif" width=500> |
|스토리북|AI 심사 결과|
|<img src="https://velog.velcdn.com/images/zhy2on/post/97805140-d391-4e42-ad9a-1dbf5a144168/image.gif" width=500> | <img src="https://velog.velcdn.com/images/zhy2on/post/34d73816-248b-47e7-a109-be5ce8bb60e6/image.gif" width=500> |


---

## ⚙️ 시스템 아키텍쳐
<img src="https://velog.velcdn.com/images/zhy2on/post/b50f6681-86c3-4f1a-a72a-318956dc9883/image.png" width=700>

## 🧱 ERD
<img src="https://velog.velcdn.com/images/zhy2on/post/8c536f6e-cabe-48b6-a4a6-d4781bcf0c45/image.png" width=800>

|엔티티 |역할 |
|---|---|
|ROOM|방 메타 + 상태 관리의 기준 엔티티|
|USER|방 소속 유저, 팀/역할/아바타 관리|    
|ROOM_USER_SET / USER_SEQ|유저 목록 관리 및 공개 ID 발급|
|SOCKET_MAP|소켓 ↔ 유저 매핑 (재접속/끊김 처리)|
|GAME_STATE|게임 진행 핵심 상태(라운드, 순서, 스토리)|
|VOTE_STATE|투표·AI 심사 결과(일시 데이터)|

<details> <summary><b>mermaid code</b></summary> <br>
   
    ```
    erDiagram
        direction LR

        ROOM {
            string room_uuid PK "Redis Key: room:{uuid}:info"
            string owner_user_token "방장의 고유 토큰"
            string title "방 이름"
            enum status "WAITING, PLAYING, RESULTING, ENDED"
            boolean is_started "게임 시작 여부"
            json config "maxPlayers, storytellerCount, rounds, roundTime, voteTime"
            timestamp created_at "TTL 기준"
        }

        USER {
            string user_token PK "Redis Key: room:{uuid}:users:{token}"
            int public_user_id "room:{uuid}:user_seq"
            string current_socket_id "nullable"
            string room_uuid FK "속한 방"
            string nickname "유저 닉네임"
            enum role "PLAYER, AUDIENCE"
            boolean is_host "방장 여부"
            enum team "A, B, null"
            int slot_index "nullable"
            int avatar_id "아바타 ID"
            boolean is_ready "optional"
            string ip "optional"
        }

        ROOM_USER_SET {
            string room_uuid PK "Redis Key: room:{uuid}:users (Set)"
            string user_token "members"
        }

        USER_SEQ {
            string room_uuid PK "Redis Key: room:{uuid}:user_seq"
            int seq "auto-increment"
        }

        SOCKET_MAP {
            string socket_id PK "Redis Key: socket:{socket_id}"
            string mapping_value "roomUuid:userToken"
        }

        GAME_STATE {
            string room_uuid PK "Redis Key: room:{uuid}:game"
            int current_round "현재 라운드"
            string genre "장르"
            list ai_judge_ids "AI 심사위원 ID 목록"
            list team_a_order "public_user_id 문자열"
            list team_b_order "public_user_id 문자열"
            list image_ids "이미지 ID 목록"
            list team_a_story "A팀 스토리 배열"
            list team_b_story "B팀 스토리 배열"
            timestamp turn_end_at "턴 종료 시간"
        }

        VOTE_STATE {
            string room_uuid PK "in-memory"
            int votes_team_a
            int votes_team_b
            enum winner "A, B, DRAW"
            json ai_judges "optional"
        }

        ROOM ||--|{ USER : "contains (by Token)"
        ROOM ||--|{ ROOM_USER_SET : "members"
        ROOM ||--|| USER_SEQ : "sequence"
        SOCKET_MAP }|--|| USER : "maps to (parsed)"
        ROOM ||--|| GAME_STATE : "manages"
        GAME_STATE ||--|| VOTE_STATE : "produces"
    ```
</details>

## 🛠️ 기술 스택 (Tech Stack)

### Frontend
| 분류 | 기술 | 비고 |
| --- | --- | --- |
| **Language** | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) | |
| **Framework** | ![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black) | Frontend Library (v19) |
| **Build Tool** | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) | High Performance Bundler |
| **State Management** | ![Zustand](https://img.shields.io/badge/Zustand-443E38?style=flat&logo=react&logoColor=white) | Global State Store |
| **Communication** | ![Socket.IO Client](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socketdotio&logoColor=white) | Real-time WebSocket |

### Backend

| 분류 | 기술 | 비고 |
| --- | --- | --- |
| **Language** | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) | |
| **Framework** | ![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white) | Backend Core |
| **Database** | ![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white) | In-memory Game State / Session |
| **Communication** | ![Socket.IO](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socketdotio&logoColor=white) | Real-time WebSocket |
| **External API** | **OpenAI / GMS** | AI Story Evaluation |

---
## 📋 API 명세서

<details> <summary><b>Swagger API Docs</b></summary> <br>
   
```yaml
openapi: 3.0.0
info:
  title: 개소릴레이 API
  description: 개소릴레이 백엔드 API 명세서
  version: 1.0.0
servers:
  - url: http://localhost:8000/api
    description: 로컬 개발 서버

# ------------------------------
# API 경로 (Paths)
# ------------------------------
paths:
  # [방 생성 API]
  # - 방을 생성하고 방장의 토큰을 발급합니다.
  /rooms:
    post:
      summary: 방 생성
      description: 새로운 게임 방을 생성합니다. 초기 설정값(Config)과 방장의 아바타 ID를 요청으로 받습니다.
      operationId: createRoom
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateRoomDto'
      responses:
        '201':
          description: 방 생성 성공 (roomId 및 방장 token 반환)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CreateRoomResponseDto'
  
  # [방 정보 조회 API]
  # - 방의 상태, 현재 인원 등 상세 정보를 조회합니다.
  /rooms/{roomUuid}:
    get:
      summary: 방 정보 조회
      description: 특정 방의 설정 정보와 현재 상태를 조회합니다.
      operationId: getRoom
      parameters:
        - name: roomUuid
          in: path
          description: 조회할 방의 UUID
          required: true
          schema:
            type: string
      responses:
        '200':
          description: 조회 성공
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: success
                    description: API 호출 결과 상태 (success/fail)
                  data:
                    allOf:
                      - $ref: '#/components/schemas/Room'
                      - type: object
                        properties:
                          currentUserCount:
                            type: number
                            description: 현재 방에 접속 중인 실시간 유저 수
        '404':
          description: 존재하지 않는 방입니다.

  # [AI 심사 요청 API]
  # - 제출된 문장과 이미지를 AI 페르소나에게 전달하여 평가를 받습니다.
  /ai-judge/evaluate:
    post:
      summary: AI 심사 요청
      description: 사용자가 제출한 문장과 이미지 태그 정보를 기반으로, 선택된 AI 심사위원들이 점수와 코멘트를 반환합니다.
      operationId: evaluateSubmission
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EvaluateRequestDto'
      responses:
        '201':
          description: 심사 완료 (심사위원별 평가 결과 반환)
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/PersonaResult'

# ------------------------------
# 데이터 모델 (Schemas)
# ------------------------------
components:
  schemas:
    # 1. 방 생성 요청 DTO
    CreateRoomDto:
      type: object
      properties:
        title:
          type: string
          description: 방 제목
          example: "즐거운 게임 한 판!"
        config:
          $ref: '#/components/schemas/RoomConfig'
        avatarId:
          type: number
          description: 방장의 아바타 ID (1~5)
          example: 1
      required:
        - title
        - config
        - avatarId

    # 2. 방 설정 정보
    RoomConfig:
      type: object
      properties:
        maxPlayers:
          type: number
          description: 전체 정원 (플레이어 + 관전자)
          example: 8
        storytellerCount:
          type: number
          description: 이야기꾼 수 (팀별 슬롯 개수)
          example: 4
        rounds:
          type: number
          description: 진행할 총 라운드 수
          example: 3
        roundTime:
          type: number
          description: 라운드 별 제한 시간 (초 단위)
          example: 60
        voteTime:
          type: number
          description: 투표 제한 시간 (초 단위)
          example: 30
      required:
        - maxPlayers
        - storytellerCount
        - rounds
        - roundTime
        - voteTime

    # 3. 방 생성 응답 DTO
    CreateRoomResponseDto:
      type: object
      properties:
        roomId:
          type: string
          description: 생성된 방의 UUID (소켓 연결 namespace로 사용됨)
          example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
        token:
          type: string
          description: 방장 권한 토큰 (재접속 및 방장 권한 인증용)
          example: "token-uuid-1234"
      required:
        - roomId
        - token

    # 4. 방 기본 정보 모델
    Room:
      type: object
      properties:
        roomUuid:
          type: string
          description: 방 UUID
        title:
          type: string
          description: 방 제목
        status:
          type: string
          enum: [WAITING, PLAYING, RESULTING, ENDED]
          description: |
            방 상태:
            - WAITING: 대기 중 (로비)
            - PLAYING: 게임 진행 중
            - RESULTING: 결과 집계 중
            - ENDED: 게임 종료
        isStarted:
          type: boolean
          description: 게임 시작 여부 (true면 게임 중)
        config:
          $ref: '#/components/schemas/RoomConfig'
        createdAt:
          type: number
          description: 방 생성 시간 (Unix Timestamp)

    # 5. AI 심사 요청 DTO
    EvaluateRequestDto:
      type: object
      properties:
        genre:
          type: string
          description: 게임 장르 (ex. 판타지, 스릴러)
          example: "판타지"
        images:
          type: array
          items:
            $ref: '#/components/schemas/ImageContextDto'
          description: 문장과 관련된 이미지 정보 목록
        sentence:
          type: string
          description: 평가받을 플레이어의 제출 문장
          example: "용사가 칼을 뽑아들고 소리쳤다."
        judgeIds:
          type: array
          items:
            type: number
          description: 심사를 요청할 AI 심사위원 ID 목록
          example: [1, 2, 3]
      required:
        - genre
        - images
        - sentence
        - judgeIds

    # 6. 이미지 컨텍스트 DTO
    ImageContextDto:
      type: object
      properties:
        tags:
          type: array
          items:
            type: string
          description: 이미지 분석 태그 목록
        description:
          type: string
          description: 이미지에 대한 텍스트 설명
      required:
        - tags
        - description

    # 7. AI 페르소나 심사 결과
    PersonaResult:
      type: object
      properties:
        personaName:
          type: string
          description: 심사위원 페르소나 이름
          example: "엄격한 김부장"
        score:
          type: number
          description: 평가 점수 (0~100)
          example: 85
        comment:
          type: string
          description: AI 심사평 (한줄 평)
          example: "문맥은 훌륭하지만 창의성이 조금 부족하군요."
      required:
        - personaName
        - score
        - comment
```
</details>

<details> <summary><b>AsyncAPI Docs</b></summary> <br>
   
```yaml
asyncapi: 3.0.0
info:
  title: 개소릴레이 WebSocket API
  version: 1.0.0
  description: '개소릴레이 게임 진행을 위한 WebSocket API 명세 (Namespace: /game)'

servers:
  dev:
    host: localhost:8000
    pathname: /game
    protocol: socket.io
    description: 로컬 개발 서버

channels:
  /:
    address: /
    messages:
      # ----------------------------------------------------------------
      # Client -> Server Messages (Publish)
      # ----------------------------------------------------------------
      join_room:
        $ref: "#/components/messages/JoinRoom"
      leave_room:
        $ref: "#/components/messages/LeaveRoom"
      request_room_info:
        $ref: "#/components/messages/RequestRoomInfo"
      update_room_config:
        $ref: "#/components/messages/UpdateRoomConfig"
      game_ready:
        $ref: "#/components/messages/GameReady"
      send_chat:
        $ref: '#/components/messages/SendChat'
      send_reaction:
        $ref: '#/components/messages/SendReaction'
      join_team:
        $ref: "#/components/messages/JoinTeam"
      leave_team:
        $ref: "#/components/messages/LeaveTeam"
      auto_fill:
        $ref: "#/components/messages/AutoFill"
      start_game:
        $ref: "#/components/messages/StartGame"
      restart_game:
        $ref: "#/components/messages/RestartGame"
      story_typing:
        $ref: "#/components/messages/StoryTyping"
      submit_story:
        $ref: "#/components/messages/SubmitStory"
      kick_user:
        $ref: "#/components/messages/KickUser"
      submit_vote:
        $ref: "#/components/messages/SubmitVote"
      request_judging:
        $ref: "#/components/messages/RequestJudging"
      skip_phase:
        $ref: "#/components/messages/SkipPhase"
      prev_phase:
        $ref: "#/components/messages/PrevPhase"

      # ----------------------------------------------------------------
      # Server -> Client Messages (Subscribe)
      # ----------------------------------------------------------------
      lobby_updated:
        $ref: "#/components/messages/LobbyUpdated"
      chat_message:
        $ref: '#/components/messages/ChatMessage'
      receive_reaction:
        $ref: '#/components/messages/ReceiveReaction'
      room_config_updated:
        $ref: "#/components/messages/RoomConfigUpdated"
      game_started:
        $ref: "#/components/messages/GameStarted"
      change_phase:
        $ref: "#/components/messages/ChangePhase"
      story_update:
        $ref: "#/components/messages/StoryUpdate"
      story_submitted:
        $ref: "#/components/messages/StorySubmitted"
      vote_updated:
        $ref: "#/components/messages/VoteUpdated"
      vote_result:
        $ref: "#/components/messages/VoteResult"
      kicked:
        $ref: "#/components/messages/Kicked"
      judging_finished:
        $ref: "#/components/messages/JudgingFinished"
      error:
        $ref: "#/components/messages/Error"
      room_closed:
        $ref: "#/components/messages/RoomClosed"

operations:
  receiveClientActions:
    action: receive
    channel:
      $ref: "#/channels/~1"
    messages:
      - $ref: "#/channels/~1/messages/join_room"
      - $ref: "#/channels/~1/messages/leave_room"
      - $ref: "#/channels/~1/messages/request_room_info"
      - $ref: "#/channels/~1/messages/update_room_config"
      - $ref: "#/channels/~1/messages/game_ready"
      - $ref: "#/channels/~1/messages/send_chat"
      - $ref: "#/channels/~1/messages/send_reaction"
      - $ref: "#/channels/~1/messages/join_team"
      - $ref: "#/channels/~1/messages/leave_team"
      - $ref: "#/channels/~1/messages/auto_fill"
      - $ref: "#/channels/~1/messages/start_game"
      - $ref: "#/channels/~1/messages/restart_game"
      - $ref: "#/channels/~1/messages/story_typing"
      - $ref: "#/channels/~1/messages/submit_story"
      - $ref: "#/channels/~1/messages/kick_user"
      - $ref: "#/channels/~1/messages/submit_vote"
      - $ref: "#/channels/~1/messages/request_judging"
      - $ref: "#/channels/~1/messages/skip_phase"
      - $ref: "#/channels/~1/messages/prev_phase"

  sendServerEvents:
    action: send
    channel:
      $ref: "#/channels/~1"
    messages:
      - $ref: '#/channels/~1/messages/lobby_updated'
      - $ref: '#/channels/~1/messages/chat_message'
      - $ref: '#/channels/~1/messages/receive_reaction'
      - $ref: '#/channels/~1/messages/room_config_updated'
      - $ref: '#/channels/~1/messages/game_started'
      - $ref: '#/channels/~1/messages/change_phase'
      - $ref: '#/channels/~1/messages/story_update'
      - $ref: '#/channels/~1/messages/story_submitted'
      - $ref: '#/channels/~1/messages/vote_updated'
      - $ref: '#/channels/~1/messages/vote_result'
      - $ref: '#/channels/~1/messages/kicked'
      - $ref: '#/channels/~1/messages/judging_finished'
      - $ref: '#/channels/~1/messages/error'
      - $ref: '#/channels/~1/messages/room_closed'

components:
  messages:
    # -----------------------------------------------------
    # Client -> Server
    # -----------------------------------------------------
    JoinRoom:
      name: join_room
      title: 방 입장 요청
      summary: 유저가 방에 입장할 때 전송합니다.
      payload:
        type: object
        properties:
          roomId:
            type: string
            description: 입장할 방의 UUID
          nickname:
            type: string
            description: 사용할 닉네임
          avatarId:
            type: number
            description: 선택한 아바타 ID (1~5)
          userToken:
            type: string
            description: 기존 유저 재접속 시 토큰 (선택)
        required: [roomId, nickname, avatarId]

    LeaveRoom:
      name: leave_room
      title: 방 퇴장 요청
      summary: 유저가 방에서 퇴장할 때 전송합니다.
      payload:
        type: object
        properties: {}
        additionalProperties: false

    RequestRoomInfo:
      name: request_room_info
      title: 방 정보 요청 (ACK)
      summary: 방의 상세 정보를 요청하고 ACK 콜백으로 수신합니다.
      payload:
        type: object
        properties:
          roomId:
            type: string
            description: 조회를 원하는 방 UUID
        required: [roomId]

    UpdateRoomConfig:
      name: update_room_config
      title: 방 설정 변경
      summary: 방장이 게임 설정을 변경할 때 전송합니다.
      payload:
        type: object
        properties:
          config:
            type: object
            description: 변경할 설정 객체 (maxPlayers, rounds 등)
        required: [config]

    GameReady:
      name: game_ready
      title: 준비 상태 변경
      summary: 플레이어가 준비 완료/취소 상태를 변경할 때 전송합니다.
      payload:
        type: object
        properties:
          isReady:
            type: boolean
            description: 준비 여부 (true/false)
        required: [isReady]

    SendChat:
      name: send_chat
      title: 채팅 전송
      summary: 채팅 메시지를 보낼 때 전송합니다.
      payload:
        type: object
        properties:
          message:
            type: string
            description: 채팅 내용
        required: [message]

    SendReaction:
      name: send_reaction
      title: 리액션(이모지) 전송
      summary: 이모지 리액션을 보낼 때 전송합니다.
      payload:
        type: object
        properties:
          emoji:
            type: string
            description: 이모지 문자
          nickname:
            type: string
            description: 보낸 사람 닉네임
        required: [emoji, nickname]

    JoinTeam:
      name: join_team
      title: 팀/슬롯 선택
      summary: 특정 팀의 슬롯으로 이동할 때 전송합니다.
      payload:
        type: object
        properties:
          public_user_id:
            type: number
            description: 대상 유저의 공개 ID
          slot_index:
            type: number
            description: 이동할 슬롯 인덱스 (0~3)
          team:
            type: string
            enum: [A, B]
            description: 이동할 팀 (A 또는 B)
        required: [public_user_id, slot_index, team]

    LeaveTeam:
      name: leave_team
      title: 팀 나가기 (관전 전환)
      summary: 플레이어 슬롯에서 나와 관전자로 전환할 때 전송합니다.
      payload:
        type: object
        properties:
          public_user_id:
            type: number
            description: 대상 유저의 공개 ID
          slot_index:
            type: number
            description: 현재 슬롯 인덱스
          team:
            type: string
            description: 현재 팀 (A 또는 B)
        required: [public_user_id, slot_index, team]

    AutoFill:
      name: auto_fill
      title: 자동 채우기 (방장)
      summary: 빈 슬롯을 관전자로 무작위 채웁니다.
      payload:
        type: object
        properties:
          roomId:
            type: string
            description: 방 UUID
        required: [roomId]

    StartGame:
      name: start_game
      title: 게임 시작
      summary: 방장이 게임을 시작할 때 전송합니다.
      payload:
        type: object
        properties:
          roomId:
            type: string
            description: 방 UUID
        required: [roomId]

    RestartGame:
      name: restart_game
      title: 게임 재시작
      summary: 방장이 게임을 초기화하고 재시작할 때 전송합니다.
      payload:
        type: object
        properties: {}
        additionalProperties: false

    StoryTyping:
      name: story_typing
      title: 스토리 입력 중
      summary: 플레이어가 스토리를 작성 중일 때 실시간으로 전송합니다.
      payload:
        type: object
        properties:
          text:
            type: string
            description: 입력 중인 텍스트
          team:
            type: string
            enum: [A, B]
            description: 팀 정보
          userToken:
            type: string
            description: 유저 토큰
        required: [text, team, userToken]

    SubmitStory:
      name: submit_story
      title: 스토리 제출
      summary: 플레이어가 작성한 스토리를 제출합니다.
      payload:
        type: object
        properties:
          text:
            type: string
            description: 제출할 스토리 텍스트
          team:
            type: string
            enum: [A, B]
            description: 팀 정보
          userToken:
            type: string
            description: 유저 토큰
          turn:
            type: number
            description: 제출하는 턴 번호 (1-based)
        required: [text, team, userToken, turn]

    KickUser:
      name: kick_user
      title: 유저 강퇴 (방장)
      summary: 특정 유저를 방에서 강제로 퇴장시킵니다.
      payload:
        type: object
        properties:
          public_user_id:
            type: number
            description: 강퇴할 유저의 공개 ID
        required: [public_user_id]

    SubmitVote:
      name: submit_vote
      title: 투표 제출
      summary: 관객이 특정 팀에 투표할 때 전송합니다.
      payload:
        type: object
        properties:
          team:
            type: string
            enum: [A, B]
            description: 투표할 팀
        required: [team]

    RequestJudging:
      name: request_judging
      title: 심사 요청
      summary: 게임 종료 후 AI 심사를 요청할 때 전송합니다.
      payload:
        type: object
        properties:
          roomId:
            type: string
            description: 방 UUID
        required: [roomId]

    SkipPhase:
      name: skip_phase
      title: 단계 건너뛰기 (테스트용)
      summary: 현재 진행 중인 게임 단계를 강제로 건너뜁니다.
      payload:
        type: object
        additionalProperties: false

    PrevPhase:
      name: prev_phase
      title: 이전 단계로 되돌리기 (테스트용)
      summary: 현재 진행 중인 게임 단계를 취소하고 이전 단계로 되돌립니다.
      payload:
        type: object
        additionalProperties: false

    # -----------------------------------------------------
    # Server -> Client
    # -----------------------------------------------------
    LobbyUpdated:
      name: lobby_updated
      title: 로비 상태 갱신
      summary: 유저 목록이나 상태가 변경되었을 때 최신 정보를 전송합니다.
      payload:
        type: object
        properties:
          users:
            type: array
            description: 최신 유저 목록
          updatedUser:
            type: object
            description: 변경된 특정 유저 정보 (선택)

    ChatMessage:
      name: chat_message
      title: 채팅 수신
      summary: 다른 유저의 채팅이나 시스템 메시지를 수신합니다.
      payload:
        type: object
        properties:
          senderId:
            type: string
            description: 보낸 유저 소켓 ID
          publicUserId:
            type: number
            description: 보낸 유저 publicUserId
          nickname:
            type: string
            description: 보낸 유저 닉네임
          message:
            type: string
            description: 메시지 내용
          type:
            type: string
            description: 메시지 타입 (일반/시스템)
          avatarId:
            type: number
            description: 아바타 ID
          team:
            type: string
            description: 팀 정보 (A/B/null)
          isHost:
            type: boolean
            description: 방장 여부
          timestamp:
            type: number
            description: 전송 시간

    ReceiveReaction:
      name: receive_reaction
      title: 리액션 수신
      summary: 다른 유저가 전송한 리액션(이모지)을 수신합니다.
      payload:
        type: object
        properties:
          emoji:
            type: string
            description: 이모지 문자
          nickname:
            type: string
            description: 보낸 유저 닉네임

    RoomConfigUpdated:
      name: room_config_updated
      title: 방 설정 변경 알림
      summary: 변경된 방 설정을 알립니다.
      payload:
        type: object
        properties:
          config:
            type: object
            description: 변경된 설정 객체

    GameStarted:
      name: game_started
      title: 게임 시작 알림
      summary: 게임이 시작되었음을 알리고 초기 데이터를 전송합니다.
      payload:
        type: object
        properties:
          imageIds:
            type: array
            description: 선정된 이미지 ID 목록
          judges:
            type: array
            description: 선정된 심사위원 목록

    ChangePhase:
      name: change_phase
      title: 페이즈 변경 알림
      summary: 게임 페이즈(대기/플레이/결과/종료)가 변경될 때 전송됩니다.
      payload:
        type: object
        properties:
          phase:
            type: string
            description: 프론트 표시용 상태 문자열
          data:
            type: object
            properties:
              duration:
                type: number
                description: 지속 시간(ms)
              startAt:
                type: number
                description: 시작 시각(Timestamp)
              serverStatus:
                type: string
                description: 서버 내부 상태 (WAITING 등)
              roundName:
                type: string
                description: 표시용 라운드명

    StoryUpdate:
      name: story_update
      title: 스토리 실시간 업데이트
      summary: 다른 플레이어가 작성 중인 스토리를 실시간으로 수신합니다.
      payload:
        type: object
        properties:
          team:
            type: string
            enum: [A, B]
          text:
            type: string
            description: 작성 중인 텍스트
          writerToken:
            type: string
            description: 작성자 토큰

    StorySubmitted:
      name: story_submitted
      title: 스토리 제출 알림
      summary: 플레이어가 스토리를 제출했음을 알립니다.
      payload:
        type: object
        properties:
          team:
            type: string
          text:
            type: string
            description: 제출된 텍스트
          writerToken:
            type: string

    VoteUpdated:
      name: vote_updated
      title: 실시간 투표 현황
      summary: 투표 진행 중 실시간 득표수를 알립니다.
      payload:
        type: object
        properties:
          votesTeamA:
            type: number
            description: A팀 득표수
          votesTeamB:
            type: number
            description: B팀 득표수

    VoteResult:
      name: vote_result
      title: 최종 투표 결과
      summary: 투표 및 심사가 완료된 후 최종 결과를 알립니다.
      payload:
        type: object
        properties:
          votesTeamA:
            type: number
          votesTeamB:
            type: number
          winner:
            type: string
            enum: [A, B, DRAW]
          aiJudges:
            type: array
            description: AI 심사 결과 목록

    Kicked:
      name: kicked
      title: 강퇴 알림
      summary: 방장에서 강퇴된 사용자에게 알립니다.
      payload:
        type: object
        properties:
          roomUuid:
            type: string
          reason:
            type: string
            description: 강퇴 사유

    JudgingFinished:
      name: judging_finished
      title: 심사 완료 알림
      summary: AI 심사가 완료되었음을 알립니다.
      payload:
        type: object
        properties:
          results:
            type: array
            description: 심사 결과 목록

    Error:
      name: error
      title: 에러 알림
      summary: 요청 처리 중 발생한 에러를 알립니다.
      payload:
        type: object
        properties:
          message:
            type: string
            description: 에러 메시지

    RoomClosed:
      name: room_closed
      title: 방 종료 알림
      summary: 방장이 나가서 방이 종료되었음을 알립니다.
      payload:
        type: object
        properties:
          reason:
            type: string
            description: 종료 사유
```
</details>

---

## 📂 프로젝트 구조
### Frontend

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

### Backend

```bash
backend
├── 📂 exec                 # 포팅 매뉴얼 및 산출물 폴더
├── 📂 src
│   ├── 📂 common           # 공통 모듈 (Filters, Guards, Pipes 등)
│   ├── 📂 config           # 환경 변수 및 설정 파일
│   ├── 📂 modules          # 도메인별 모듈
│   │   ├── 📂 games        # 게임 로직 (Core)
│   │   ├── 📂 rooms        # 대기방 관리
│   │   ├── 📂 users        # 사용자 관리
│   │   └── ...
│   ├── 📂 lib              # 외부 라이브러리 연동
│   └── 📄 main.ts          # 진입점 (Entry Point)
├── 📄 .env.development     # 환경 변수 설정
└── 📄 package.json
```

---

## 🚀 시작 가이드 (Getting Started)

### Frontend
#### 1. 사전 요구 사항
- **Node.js**: v18.x 이상 (v24.13.0 권장)
- **NPM**: v9.x 이상

#### 2. 설치 및 실행

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

#### 3. 환경 변수 설정
최상위 경로에 `.env` 파일을 생성하고 다음 변수를 설정하세요.
```env
VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=ws://localhost:8000
```
- 배포 시에는 실제 도메인 주소로 변경 (`https://...`, `wss://...`)


### Backend

#### 1. 사전 요구 사항
- **Node.js**: v20 이상
- **Redis**: 6379 포트 실행 중

#### 2. 설치 및 실행

**의존성 설치**
```bash
npm install
```

**개발 모드 실행**
```bash
npm run start:dev
```

**프로덕션 빌드 및 실행**
```bash
npm run build
npm run start:prod
```

#### 3. 환경 변수 설정
프로젝트 실행 환경에 맞춰 최상위 경로에 `.env.development` 또는 `.env.production` 파일을 생성하고 다음 변수를 설정하세요.

```env
PORT=8000
REDIS_HOST=localhost
REDIS_PORT=6379
GMS_API_KEY=your_api_key_here
```

## 🐕 역할 소개

<table style="width:100%; table-layout:fixed; border-collapse:collapse;">
  <colgroup>
    <col style="width:33.33%" />
    <col style="width:33.33%" />
    <col style="width:33.33%" />
  </colgroup>

  <!-- 1행: 이미지 -->
  <tr>
    <td align="center">
      <img src="https://velog.velcdn.com/images/zhy2on/post/7f3d3d30-74e7-47c7-92b0-fbdde4cee244/image.png" width="120" />
    </td>
    <td align="center">
      <img src="https://velog.velcdn.com/images/zhy2on/post/c06b82aa-b33f-4110-97a4-32e6f66da4c5/image.png" width="120" />
    </td>
    <td align="center">
      <img src="https://velog.velcdn.com/images/zhy2on/post/6a43de82-0304-4e4d-b721-1ad23881bc74/image.png" width="140" />
    </td>
  </tr>

  <!-- 2행: 이름 -->
  <tr>
    <td align="center"><b>김민준</b></td>
    <td align="center"><b>배현지</b></td>
    <td align="center"><b>진준영</b></td>
  </tr>

  <!-- 3행: 역할 -->
  <tr>
    <td align="center">FE</td>
    <td align="center">FE</td>
    <td align="center">FE</td>
  </tr>

  <!-- 4행: 역할 설명 (좌측 정렬) -->
  <tr>
    <td style="text-align:left; vertical-align:top;">
      - 백엔드 게임 데이터와 AI 심사 결과를 화면에 실시간 반영<br>
      - Zustand를 활용한 게임 상태 관리 및 데이터 흐름 제어<br>
      - Socket.IO 기반 실시간 스토리 작성·저장 및 리액션 기능 구현
    </td>
    <td style="text-align:left; vertical-align:top;">
      - 메인페이지 / 대기실 페이지 / 투표 페이지 / 게임 페이지 UI 구현
    </td>
    <td style="text-align:left; vertical-align:top;">
      - 방 만들기 / 프로필 설정 / 카드 & 심사위원 추첨 페이지<br>
      - 심사 결과 페이지 UI 구현
    </td>
  </tr>

  <!-- 구분선 -->
  <tr><td colspan="3" style="height:20px;"></td></tr>

  <!-- 5행: 이미지 -->
  <tr>
    <td align="center">
      <img src="https://velog.velcdn.com/images/zhy2on/post/a05e5f92-6bea-4723-bfec-53b893e832b5/image.png" width="130" />
    </td>
    <td align="center">
      <img src="https://velog.velcdn.com/images/zhy2on/post/8d5b9d47-0b7a-4f80-a20b-19984ce24070/image.png" width="120" />
    </td>
    <td align="center">
      <img src="https://velog.velcdn.com/images/zhy2on/post/db65ba41-fb04-473c-bee7-455ee19ffa23/image.png" width="130" />
    </td>
  </tr>

  <!-- 6행: 이름 -->
  <tr>
    <td align="center"><b>오지현</b></td>
    <td align="center"><b>김택우</b></td>
    <td align="center"><b>송하준</b></td>
  </tr>

  <!-- 7행: 역할 -->
  <tr>
    <td align="center">Infra / BE</td>
    <td align="center">BE</td>
    <td align="center">BE</td>
  </tr>

  <!-- 8행: 역할 설명 -->
  <tr>
    <td style="text-align:left; vertical-align:top;">
      - AWS·Docker 기반 인프라 구축<br>
      - Jenkins CI/CD 배포 자동화
    </td>
    <td style="text-align:left; vertical-align:top;">
      - Socket.IO 기반 실시간 게임 아키텍처 설계 및 동기화 기능 구현<br>
      - 어뷰징 방지(쓰로틀링·욕설 필터·IP 밴) 기능 구현<br>
      - NestJS 소켓 세션 관리(재접속·방 정리) 구현
    </td>
    <td style="text-align:left; vertical-align:top;">
      - 방 상태 라이프사이클 구현<br>
      - 옵저버 패턴 기반 게임 흐름 시스템 구현<br>
      - Redis WATCH/MULTI 기반 동시성 처리
    </td>
  </tr>
</table>
