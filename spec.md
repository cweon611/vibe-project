# 오늘 뭐 먹지? — 서비스 기획서

## 한 줄 소개

매일 점심 메뉴 선택으로 눈치 보는 직장인 팀들이 **빠르고 공평하게** 메뉴를 결정하는 서비스.

---

## 사용 흐름 (핵심 시나리오)

1. 팀원 중 누군가가 **오늘의 투표**를 연다.
2. 팀원들이 먹고 싶은 **메뉴를 자유롭게 제안**한다.
3. 제안된 메뉴 목록을 보고 **1인 1표로 투표**한다.
4. 마감 시간이 되면(또는 수동 마감) **최다 득표 메뉴가 자동 선정**된다.
5. 결정된 메뉴가 **팀원 전체에게 공유**된다.
6. 지난 결과는 **최근 메뉴 이력**에서 확인할 수 있다.

---

## 주요 기능

### 1. 팀 만들기 / 참여하기

- 팀을 새로 만들거나, 초대 링크로 기존 팀에 참여한다.
- 팀에는 고유한 이름이 있다.

### 2. 오늘의 투표 열기

- 팀원 누구나 당일 투표를 시작할 수 있다.
- 하루에 한 팀당 투표 하나만 활성화된다.

### 3. 메뉴 제안

- 투표가 열려 있는 동안 팀원 누구나 메뉴를 제안할 수 있다.
- 같은 메뉴가 이미 있으면 중복 추가되지 않는다.

### 4. 투표 (1인 1표)

- 제안된 메뉴 중 하나를 선택해 투표한다.
- 마음이 바뀌면 투표를 변경할 수 있다.
- 자기 표가 어디에 찍혔는지 본인만 볼 수 있다.

### 5. 마감 & 결과 발표

- 정해진 마감 시간에 자동 마감되거나, 팀원이 수동으로 마감한다.
- 최다 득표 메뉴가 **오늘의 메뉴**로 선정된다.
- 동점이면 랜덤으로 하나를 고른다.

### 6. 메뉴 이력

- 과거 투표 결과(날짜, 선정 메뉴, 득표 수)를 목록으로 확인한다.
- 최근 며칠간 같은 메뉴가 반복되는지 한눈에 볼 수 있다.

---

## 화면 구성

| 화면 | 경로(예시) | 설명 |
|------|-----------|------|
| 홈 / 대시보드 | `/` | 오늘의 투표 상태 요약, 빠른 입장 |
| 팀 생성·참여 | `/team` | 팀 만들기 / 초대 링크 입력 |
| 투표 화면 | `/vote` | 메뉴 제안 + 투표 + 실시간 현황 |
| 결과 화면 | `/result` | 오늘의 선정 메뉴, 득표 분포 |
| 이력 화면 | `/history` | 최근 투표 결과 목록 |

---

## 데이터 구조 (Supabase 테이블)

### teams

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | 팀 고유 ID |
| name | text | 팀 이름 |
| invite_code | text (unique) | 초대 코드 |
| created_at | timestamptz | 생성 시각 |

### members

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | 멤버 고유 ID |
| team_id | uuid (FK → teams) | 소속 팀 |
| user_id | uuid (FK → auth.users) | Supabase Auth 사용자 |
| nickname | text | 팀 내 표시 이름 |
| joined_at | timestamptz | 참여 시각 |

### polls

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | 투표 고유 ID |
| team_id | uuid (FK → teams) | 해당 팀 |
| date | date | 투표 날짜 (팀당 하루 하나) |
| status | text | `open` · `closed` |
| deadline | timestamptz | 마감 시각 (nullable) |
| created_at | timestamptz | 생성 시각 |

### menu_suggestions

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | 제안 고유 ID |
| poll_id | uuid (FK → polls) | 해당 투표 |
| name | text | 메뉴 이름 |
| suggested_by | uuid (FK → members) | 제안한 사람 |
| created_at | timestamptz | 제안 시각 |

### votes

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | 투표 고유 ID |
| poll_id | uuid (FK → polls) | 해당 투표 |
| member_id | uuid (FK → members) | 투표한 사람 |
| suggestion_id | uuid (FK → menu_suggestions) | 선택한 메뉴 |
| voted_at | timestamptz | 투표 시각 |

> **제약**: (poll_id, member_id) 유니크 — 1인 1표 보장.

### poll_results

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | 결과 고유 ID |
| poll_id | uuid (FK → polls) | 해당 투표 |
| winning_suggestion_id | uuid (FK → menu_suggestions) | 선정된 메뉴 |
| total_votes | int | 총 투표 수 |
| decided_at | timestamptz | 결정 시각 |

---

## 기술 스택

| 영역 | 선택 |
|------|------|
| 프레임워크 | Next.js (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS |
| DB·인증·백엔드 | Supabase |

자세한 개발 규칙은 `AGENTS.md`와 `.cursor/rules/`를 참고한다.
