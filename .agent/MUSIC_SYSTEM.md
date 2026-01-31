# 음악 관리 시스템 변경 사항

## 개요
음악 파일 저장 방식을 변경하여, MongoDB의 청크 저장 대신 `public/music` 폴더에 파일을 저장하고, 
localhost에서만 음악 관리 권한을 부여하며, Vercel에서는 음악 요청을 생성하는 시스템으로 변경되었습니다.

## 주요 변경사항

### 1. 새로운 MusicRequest 모델 추가
- **파일**: `server/models/MusicRequest.ts`
- **기능**: 음악 추가 요청을 MongoDB에 저장하고 관리
- **상태**: `pending`, `approved`, `rejected`
- **필드**:
  - `hash`: SHA-256 해시
  - `filename`: 파일명 (hash + 확장자)
  - `title`: 트랙 제목
  - `requestedBy`: 요청한 사용자 ID
  - `requestedByName`: 요청한 사용자 이름
  - `status`: 요청 상태
  - `bpm`, `measureLength`: 음악 정보
  - `createdAt`, `processedAt`, `processedBy`: 타임스탬프 및 처리자 정보

### 2. 음악 업로드 로직 변경
- **파일**: `server/api/maps/index.post.ts`

#### Vercel 환경
- 음악 파일 업로드 시 `MusicRequest` 생성
- 이미 존재하는 요청이 있으면 기존 요청 상태 반환
- 에러 코드: `MUSIC_REQUEST_PENDING`
- 사용자에게 대기/거절 상태 안내

#### Localhost 환경
- 직접 `public/music` 폴더에 파일 저장
- 파일명: `{sha256-hash}.{extension}`
- 중복 파일은 자동으로 스킵

### 3. 청크 업로드 방식 제거
- **파일**: `server/api/maps/[id]/audio-chunk.post.ts`
- 청크 방식 대신 전체 파일을 한 번에 업로드
- 기존 엔드포인트는 하위 호환성을 위해 유지하되, 동일한 로직 사용

### 4. 관리자 API 추가

#### GET `/api/admin/music-requests`
- **파일**: `server/api/admin/music-requests.get.ts`
- **기능**: 음악 요청 목록 조회
- **쿼리 파라미터**: `?status=pending|approved|rejected`
- **반환**: 요청 목록 (사용자 정보 포함)

#### POST `/api/admin/music-requests`
- **파일**: `server/api/admin/music-requests.post.ts`
- **기능**: 음악 요청 승인/거절
- **권한**: localhost에서만 접근 가능
- **요청 본문**:
  ```json
  {
    "requestId": "string",
    "action": "approve" | "reject",
    "adminUserId": "string" (optional)
  }
  ```
- **승인 시**: 요청 상태를 'approved'로 변경
- **거절 시**: 
  - 요청 상태를 'rejected'로 변경
  - `public/music`에서 파일 삭제
  - MongoDB에서 요청 레코드 삭제

### 5. 관리자 UI 페이지
- **파일**: `pages/admin/music.vue`
- **URL**: `/admin/music`
- **기능**:
  - 음악 요청 목록 조회 및 필터링
  - 대기중/승인됨/거절됨 상태별 필터
  - 각 요청의 승인/거절 버튼 제공
  - 현대적인 그라디언트 디자인
  - 반응형 레이아웃

## 사용 흐름

### 사용자 (Vercel)
1. 에디터에서 음악 파일 업로드
2. 서버에서 해시 계산 후 `MusicRequest` 생성
3. 에러 메시지와 함께 카카오톡 오픈채팅 링크 제공
4. 관리자 승인 대기

### 관리자 (Localhost)
1. `/admin/music` 페이지 접속
2. 대기중인 요청 확인
3. 승인 또는 거절 버튼 클릭
4. 승인 시: 상태만 변경 (파일은 이미 존재)
5. 거절 시: 파일 및 DB 레코드 삭제

### 개발자 (Localhost)
1. 에디터에서 음악 파일 업로드
2. 직접 `public/music`에 파일 저장
3. 즉시 사용 가능

## 주요 장점

1. **서버 부하 감소**: MongoDB에 바이너리 저장 대신 파일 시스템 사용
2. **관리 용이성**: localhost에서만 관리 가능하여 보안 강화
3. **청크 제거**: 복잡한 청크 업로드 로직 제거로 코드 단순화
4. **요청 승인 시스템**: Vercel에서 직접 저장 불가능한 문제 해결
5. **중복 방지**: 해시 기반 파일명으로 중복 자동 방지

## 마이그레이션 노트

### 기존 AudioContent 데이터
- `AudioContent` 모델은 레거시로 유지
- 기존 데이터는 삭제하지 않음
- 새로운 업로드는 `MusicRequest` 시스템 사용

### Map 모델
- `audioChunks`, `audioContentId` 필드는 DEPRECATED로 유지
- 하위 호환성을 위해 삭제하지 않음
- 새로운 맵은 `audioUrl`만 사용

## TODO
- [ ] 기존 AudioContent 데이터를 파일 시스템으로 마이그레이션 (선택사항)
- [ ] 관리자 인증 시스템 추가 (현재는 localhost 체크만)
- [ ] 음악 파일 미리듣기 기능 추가
- [ ] 승인된 음악 자동 Git push 워크플로우 (선택사항)
