---
name: 오늘 뭐 먹지? — 개발 계획
overview: Next.js App Router + TypeScript + Tailwind + Supabase 기반 팀 점심 메뉴 투표 서비스. 0단계(초기 셋업) → 1단계(목업) → 2단계(Supabase 연동) 순서로 진행한다.
todos:
  - id: 0a
    content: 0-A. Next.js 프로젝트 생성 — frontend/ 폴더에 App Router, TypeScript, Tailwind CSS 프로젝트 생성, 보일러플레이트 정리, @/ alias 확인
    status: completed
  - id: 0b
    content: 0-B. Supabase 패키지 설치 — @supabase/supabase-js, @supabase/ssr 설치
    status: completed
  - id: 0c
    content: 0-C. 환경 변수 준비 — .env.local 생성, NEXT_PUBLIC_SUPABASE_URL/ANON_KEY 자리 만들기, .gitignore 확인
    status: completed
  - id: 0d
    content: 0-D. Supabase 클라이언트 유틸 생성 — lib/supabase/client.ts (브라우저용), lib/supabase/server.ts (서버용)
    status: completed
  - id: 0e
    content: 0-E. 글로벌 레이아웃 — app/layout.tsx HTML 구조·폰트·Tailwind, app/globals.css @tailwind 지시문 확인
    status: completed
  - id: 0f
    content: 0-F. 동작 확인 — npm run dev 실행, 브라우저에서 빈 화면 정상 표시 확인
    status: completed
  - id: 1a
    content: 1-A. Mock 데이터 파일 생성 — mockData.ts (currentUser, teams, members, polls, menuSuggestions, votes, pollResults), types.ts 타입 정의
    status: completed
  - id: 1b
    content: 1-B. 공통 레이아웃 & 네비게이션 — Header.tsx (서비스명, 네비 링크, 로그아웃), layout.tsx에 헤더 포함, 모바일 반응형
    status: completed
  - id: 1c
    content: 1-C. 로그인/회원가입 화면 (목업) — login/page.tsx (이메일, 비밀번호, 로그인→/, 회원가입→/signup), signup/page.tsx (이메일, 비밀번호, 닉네임, 가입→/login)
    status: completed
  - id: 1d
    content: 1-D. 홈/대시보드 화면 (목업) — page.tsx 내 팀 목록 카드 (투표 상태 표시, 클릭→/vote), 빈 상태 안내 (팀 만들기/참여→/team)
    status: completed
  - id: 1e
    content: 1-E. 팀 생성/참여 화면 (목업) — team/page.tsx 팀 만들기 (이름 입력, 초대코드 표시), 팀 참여 (초대코드 입력), 성공→홈
    status: completed
  - id: 1f
    content: 1-F. 투표 화면 (목업 — 핵심) — vote/page.tsx 투표없음(열기 버튼), 진행중(메뉴 제안·투표·마감), 마감됨(결과보기→/result)
    status: completed
  - id: 1g
    content: 1-G. 결과 화면 (목업) — result/page.tsx 선정 메뉴 표시, 득표 분포 (막대/비율), 총 투표 수, 홈으로 버튼
    status: completed
  - id: 1h
    content: 1-H. 이력 화면 (목업) — history/page.tsx 최근 투표 결과 목록, 같은 메뉴 반복 배지, 빈 상태 안내
    status: completed
  - id: 1i
    content: 1-I. 플로우 최종 점검 — 로그인→홈→팀→투표→마감→결과 흐름, 이력 흐름, 빈 상태, 모바일 뷰 확인
    status: completed
  - id: 2a
    content: 2-A. Supabase 테이블 생성 (MCP) — teams, members, polls, menu_suggestions, votes, poll_results 테이블 + 유니크 제약
    status: completed
  - id: 2b
    content: 2-B. RLS 정책 & 트리거 (MCP) — 각 테이블 RLS 활성화, 팀 멤버 기반 접근 제어, invite_code 자동 생성
    status: completed
  - id: 2c
    content: 2-C. 인증 연동 — signUp, signInWithPassword, signOut, 미들웨어 리다이렉트 (/login ↔ /)
    status: completed
  - id: 2d
    content: 2-D. 팀 기능 연동 — 팀 만들기 (teams+members insert), 초대코드 조회, 팀 참여, 내 팀 목록
    status: completed
  - id: 2e
    content: 2-E. 투표 기능 연동 — 오늘 투표 조회, 투표 열기, 메뉴 제안 (중복 방지), 투표 upsert, 현황 조회
    status: completed
  - id: 2f
    content: 2-F. 마감 & 결과 연동 — polls 마감, 최다 득표 계산 (동점 랜덤), poll_results 저장/조회
    status: completed
  - id: 2g
    content: 2-G. 이력 연동 — 최근 14건 poll_results 조회, mockData.ts 코드 잔여 확인
    status: completed
  - id: 2h
    content: 2-H. 최종 점검 — 전체 플로우 테스트, 초대코드 참여, 이력, 리다이렉트, 모바일, mockData 제거, 환경 변수
    status: completed
isProject: true
---

# 오늘 뭐 먹지? — 개발 계획

> **참고 문서**: `spec.md` (기획) · `api-spec.md` (API 명세) · `AGENTS.md` (코딩 규칙)
>
> **프론트엔드 경로**: `frontend/` (Next.js 프로젝트 루트)

---

## 중요 규칙

1. **1단계(목업)가 완전히 끝나기 전에는 절대 2단계로 넘어가지 않는다.**
2. 각 섹션을 완성한 뒤 **반드시 멈추고** 사용자에게 다음 진행 여부를 확인한다.
3. `spec.md`와 `api-spec.md`를 읽고 필요한 섹션을 스스로 구성한다.

---

## 0단계: 프로젝트 초기 셋업

### 0-A. Next.js 프로젝트 생성

- `frontend/` 폴더 안에 Next.js 프로젝트 생성 (App Router, TypeScript, Tailwind CSS)
- 불필요한 보일러플레이트 파일 정리 (기본 아이콘·스타일 등)
- `tsconfig.json`에서 `@/` alias 확인

### 0-B. Supabase 패키지 설치

- `@supabase/supabase-js` 설치
- `@supabase/ssr` 설치

### 0-C. 환경 변수 준비

- `frontend/.env.local` 파일 생성
- `NEXT_PUBLIC_SUPABASE_URL` 자리 만들기
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 자리 만들기
- `.gitignore`에 `.env.local` 포함 확인

### 0-D. Supabase 클라이언트 유틸 생성

- `frontend/lib/supabase/client.ts` — 브라우저용 클라이언트
- `frontend/lib/supabase/server.ts` — 서버 컴포넌트/Route Handler용 클라이언트

### 0-E. 글로벌 레이아웃

- `frontend/app/layout.tsx` — HTML 기본 구조, 폰트, Tailwind 적용 확인
- `frontend/app/globals.css` — Tailwind `@tailwind` 지시문 확인

### 0-F. 동작 확인

- `npm run dev`로 개발 서버 실행
- 브라우저에서 빈 화면(또는 기본 페이지) 정상 표시 확인

---

## 1단계: 목업 (Mock Data로 전체 플로우)

> **규칙**
>
> - Supabase 연동 **없이** `frontend/lib/mockData.ts`의 하드코딩 데이터만 사용한다.
> - 모든 화면을 클릭해서 흐름을 확인할 수 있는 수준으로 만든다.
> - `spec.md`를 읽고 필요한 섹션을 스스로 구성한다.
> - **각 섹션 완성 후 반드시 멈추고 다음 진행 여부를 물어본다.**

### 1-A. Mock 데이터 파일 생성

- `frontend/lib/mockData.ts` 파일 생성
- 사용자 정보 (currentUser) mock
- 팀 목록 (teams) mock
- 팀원 목록 (members) mock
- 투표 정보 (polls) — open 상태 1개, closed 상태 1개
- 메뉴 제안 목록 (menuSuggestions) mock
- 투표 기록 (votes) mock
- 투표 결과 (pollResults) mock
- TypeScript 타입 정의 (`frontend/lib/types.ts`)
  - `Team`, `Member`, `Poll`, `MenuSuggestion`, `Vote`, `PollResult`

> **완성 후 멈추고 확인받기**

---

### 1-B. 공통 레이아웃 & 네비게이션

- 헤더 컴포넌트 (`frontend/components/Header.tsx`)
  - 서비스 이름 "오늘 뭐 먹지?"
  - 네비게이션 링크 (홈, 투표, 이력)
  - 로그아웃 버튼 (목업: 동작 없이 표시만)
- `app/layout.tsx`에 헤더 포함
- 모바일 반응형 기본 적용

> **완성 후 멈추고 확인받기**

---

### 1-C. 로그인 / 회원가입 화면 (목업)

- 로그인 화면 (`frontend/app/login/page.tsx`)
  - 이메일 입력 필드
  - 비밀번호 입력 필드
  - "로그인" 버튼 → 클릭 시 `/` 으로 이동 (실제 인증 없음)
  - "회원가입" 링크 → `/signup` 으로 이동
- 회원가입 화면 (`frontend/app/signup/page.tsx`)
  - 이메일 입력 필드
  - 비밀번호 입력 필드
  - 닉네임 입력 필드
  - "가입하기" 버튼 → 클릭 시 `/login` 으로 이동
  - "이미 계정이 있어요" 링크 → `/login` 으로 이동

> **완성 후 멈추고 확인받기**

---

### 1-D. 홈 / 대시보드 화면 (목업)

- 홈 화면 (`frontend/app/page.tsx`)
  - 내 팀 목록 카드 표시 (mockData 사용)
  - 각 팀 카드에 오늘의 투표 상태 표시 (진행 중 / 마감됨 / 아직 없음)
  - 팀 카드 클릭 → `/vote` 으로 이동
- 팀이 없을 때 빈 상태 안내
  - "아직 팀이 없어요" 메시지
  - "팀 만들기" / "팀 참여하기" 버튼 → `/team` 으로 이동

> **완성 후 멈추고 확인받기**

---

### 1-E. 팀 생성 / 참여 화면 (목업)

- 팀 화면 (`frontend/app/team/page.tsx`)
- 팀 만들기 섹션
  - 팀 이름 입력 필드
  - "만들기" 버튼 → 클릭 시 성공 메시지 표시 + 초대 코드 표시
- 팀 참여하기 섹션
  - 초대 코드 입력 필드
  - "참여하기" 버튼 → 클릭 시 성공 메시지 표시
- 성공 후 홈(`/`)으로 돌아가는 버튼

> **완성 후 멈추고 확인받기**

---

### 1-F. 투표 화면 (목업 — 핵심)

- 투표 화면 (`frontend/app/vote/page.tsx`)
- **투표가 아직 없을 때**
  - "오늘의 투표가 아직 없어요" 안내
  - "투표 열기" 버튼 → 클릭 시 투표 진행 중 UI로 전환
- **투표 진행 중 (status: open)**
  - 마감 시간 표시
  - 메뉴 제안 입력 폼
    - 메뉴 이름 입력 필드
    - "제안하기" 버튼 → 목록에 추가
    - 같은 이름 중복 제안 시 알림
  - 제안된 메뉴 목록
    - 메뉴 이름 + 득표 수 표시
    - 클릭하면 투표 (하이라이트로 내 투표 표시)
    - 다른 메뉴 클릭 시 투표 변경
  - "투표 마감하기" 버튼 → 클릭 시 결과 화면으로 전환
- **투표 마감됨 (status: closed)**
  - "이미 마감된 투표입니다" 안내
  - "결과 보기" 버튼 → `/result` 으로 이동

> **완성 후 멈추고 확인받기**

---

### 1-G. 결과 화면 (목업)

- 결과 화면 (`frontend/app/result/page.tsx`)
- 오늘의 선정 메뉴 크게 표시 (이름 + 이모지/아이콘)
- 전체 득표 분포 표시 (메뉴별 득표 수 + 막대/비율)
- 총 투표 수 표시
- "홈으로" 버튼

> **완성 후 멈추고 확인받기**

---

### 1-H. 이력 화면 (목업)

- 이력 화면 (`frontend/app/history/page.tsx`)
- 최근 투표 결과 목록 (날짜, 선정 메뉴, 득표 수)
- 같은 메뉴 반복 시 시각적 표시 (배지 등)
- 이력이 없을 때 빈 상태 안내

> **완성 후 멈추고 확인받기**

---

### 1-I. 플로우 최종 점검

- 로그인 → 홈 → 팀 만들기 → 홈 → 투표 → 메뉴 제안 → 투표 → 마감 → 결과 흐름 확인
- 홈 → 이력 화면 흐름 확인
- 모든 빈 상태(팀 없음, 투표 없음, 이력 없음) 표시 확인
- 모바일 뷰에서 레이아웃 깨지지 않는지 확인

> **1단계 전체 완료 확인받기**

---

## ⛔ 1단계가 완전히 끝나기 전에는 2단계로 넘어가지 않는다

---

## 2단계: 실제 구현 (Supabase 연동)

> **규칙**
>
> - 1단계 플로우 검증이 완료된 후에만 시작한다.
> - `mockData.ts`를 Supabase API 호출로 교체한다.
> - `api-spec.md`의 자료구조를 기준으로 테이블 및 API를 구현한다.
> - `api-spec.md`를 읽고 필요한 섹션을 스스로 구성한다.
> - Supabase 작업은 **Supabase MCP**를 사용한다.
> - Supabase 프로젝트 이름: **vibe-tutorial**
> - **각 섹션 완성 후 반드시 멈추고 다음 진행 여부를 물어본다.**

### 2-A. Supabase 테이블 생성 (MCP 사용)

- `teams` 테이블 생성
  - id (uuid PK), name (text), invite_code (text unique), created_at (timestamptz)
- `members` 테이블 생성
  - id (uuid PK), team_id (FK → teams), user_id (FK → auth.users), nickname (text), joined_at (timestamptz)
- `polls` 테이블 생성
  - id (uuid PK), team_id (FK → teams), date (date), status (text), deadline (timestamptz nullable), created_at (timestamptz)
  - (team_id, date) 유니크 제약
- `menu_suggestions` 테이블 생성
  - id (uuid PK), poll_id (FK → polls), name (text), suggested_by (FK → members), created_at (timestamptz)
  - (poll_id, name) 유니크 제약
- `votes` 테이블 생성
  - id (uuid PK), poll_id (FK → polls), member_id (FK → members), suggestion_id (FK → menu_suggestions), voted_at (timestamptz)
  - (poll_id, member_id) 유니크 제약
- `poll_results` 테이블 생성
  - id (uuid PK), poll_id (FK → polls), winning_suggestion_id (FK → menu_suggestions), total_votes (int), decided_at (timestamptz)

> **완성 후 멈추고 확인받기**

---

### 2-B. RLS 정책 & 트리거 (MCP 사용)

- 각 테이블에 RLS 활성화
- `teams` RLS — 멤버만 자기 팀 조회 가능
- `members` RLS — 본인 레코드 insert, 같은 팀원끼리 조회
- `polls` RLS — 팀 멤버만 조회/생성
- `menu_suggestions` RLS — 팀 멤버만 조회/생성
- `votes` RLS — 본인만 insert/update, 같은 투표 참여자끼리 count 조회
- `poll_results` RLS — 팀 멤버만 조회
- `invite_code` 자동 생성 트리거 또는 DB 함수 만들기

> **완성 후 멈추고 확인받기**

---

### 2-C. 인증 연동

- 회원가입 — `supabase.auth.signUp()` 연결
- 로그인 — `supabase.auth.signInWithPassword()` 연결
- 로그아웃 — `supabase.auth.signOut()` 연결
- 미들웨어 또는 레이아웃 가드 — 비로그인 시 `/login` 리다이렉트
- 로그인 상태 시 `/login` 접근하면 `/` 으로 리다이렉트

> **완성 후 멈추고 확인받기**

---

### 2-D. 팀 기능 연동

- 팀 만들기 — `teams` insert + `members` insert (자기 자신)
- 초대 코드로 팀 조회 — `teams` select by invite_code
- 팀 참여 — `members` insert
- 내 팀 목록 조회 — `members` select with teams join

> **완성 후 멈추고 확인받기**

---

### 2-E. 투표 기능 연동

- 오늘의 투표 조회 — `polls` select by team_id + date
- 투표 열기 — `polls` insert (status: open)
- 메뉴 제안 — `menu_suggestions` insert (중복 이름 방지)
- 투표하기 — `votes` upsert (onConflict: poll_id, member_id)
- 내 투표 확인 — `votes` select by poll_id + member_id
- 투표 현황 조회 — `menu_suggestions` + votes count

> **완성 후 멈추고 확인받기**

---

### 2-F. 마감 & 결과 연동

- 투표 마감 — `polls` update status to closed
- 최다 득표 메뉴 계산 (서버 측 Route Handler)
  - 동점 시 랜덤 선정 로직
- 결과 저장 — `poll_results` insert
- 결과 조회 — `poll_results` select with menu_suggestions join

> **완성 후 멈추고 확인받기**

---

### 2-G. 이력 연동

- 최근 이력 조회 — `poll_results` select (최근 14건, polls + menu_suggestions join)
- mockData.ts 사용하는 코드가 남아있지 않은지 최종 확인

> **완성 후 멈추고 확인받기**

---

### 2-H. 최종 점검

- 회원가입 → 로그인 → 팀 생성 → 투표 열기 → 메뉴 제안 → 투표 → 마감 → 결과 전체 플로우 테스트
- 초대 코드로 팀 참여 플로우 테스트
- 이력 화면 데이터 정상 표시 테스트
- 비로그인 상태 리다이렉트 테스트
- 모바일 뷰 최종 확인
- `mockData.ts` 파일 삭제 또는 제거 확인
- 환경 변수 실제 값 세팅 확인

> **2단계 전체 완료 확인받기**

---

## 단계별 요약


| 단계    | 핵심          | 데이터 소스         | 섹션 수     |
| ----- | ----------- | -------------- | -------- |
| **0** | 프로젝트 초기 셋업  | —              | 6개 (A~F) |
| **1** | 목업 (플로우 검증) | `mockData.ts`  | 9개 (A~I) |
| **2** | 실제 구현       | Supabase (MCP) | 8개 (A~H) |


