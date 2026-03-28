# 오늘 뭐 먹지? — API 명세

이 문서는 프론트엔드와 백엔드(Supabase) 사이에서 **어떤 데이터를 주고받는지** 정리한 것입니다.
Supabase JS SDK를 직접 호출하는 패턴을 기본으로 하며, 필요한 경우 Next.js Route Handler(`app/api/.../route.ts`)를 사용합니다.

> **표기 규칙**
>
> - 🟢 누구나 (로그인한 팀원)
> - 🔒 서버 전용 (Route Handler / Server Component)

---

## 1. 인증 (Supabase Auth)

Supabase Auth를 그대로 사용합니다. 별도 API를 만들지 않습니다.

| 동작 | SDK 호출 |
|------|---------|
| 회원가입 | `supabase.auth.signUp({ email, password })` |
| 로그인 | `supabase.auth.signInWithPassword({ email, password })` |
| 로그아웃 | `supabase.auth.signOut()` |
| 현재 사용자 | `supabase.auth.getUser()` |

---

## 2. 팀

### 2-1. 팀 만들기 🟢

```
POST → supabase.from('teams').insert(...)
```

**보내는 데이터 (request)**

```json
{
  "name": "개발팀"
}
```

**돌아오는 데이터 (response)**

```json
{
  "id": "abc-123",
  "name": "개발팀",
  "invite_code": "X7kQ9m",
  "created_at": "2026-03-27T09:00:00Z"
}
```

> `invite_code`는 DB 트리거 또는 서버에서 자동 생성합니다.

---

### 2-2. 초대 코드로 팀 참여하기 🟢

```
GET  → supabase.from('teams').select('id, name').eq('invite_code', 코드).single()
POST → supabase.from('members').insert(...)
```

**보내는 데이터**

```json
{
  "team_id": "abc-123",
  "user_id": "현재 로그인 유저 uuid",
  "nickname": "춘서"
}
```

**돌아오는 데이터**

```json
{
  "id": "mem-456",
  "team_id": "abc-123",
  "user_id": "user-789",
  "nickname": "춘서",
  "joined_at": "2026-03-27T09:05:00Z"
}
```

---

### 2-3. 내 팀 목록 조회 🟢

```
GET → supabase.from('members').select('team_id, nickname, teams(name, invite_code)').eq('user_id', 나)
```

**돌아오는 데이터**

```json
[
  {
    "team_id": "abc-123",
    "nickname": "춘서",
    "teams": {
      "name": "개발팀",
      "invite_code": "X7kQ9m"
    }
  }
]
```

---

## 3. 투표 (Poll)

### 3-1. 오늘의 투표 열기 🟢

```
POST → supabase.from('polls').insert(...)
```

**보내는 데이터**

```json
{
  "team_id": "abc-123",
  "date": "2026-03-27",
  "status": "open",
  "deadline": "2026-03-27T12:00:00Z"
}
```

**돌아오는 데이터**

```json
{
  "id": "poll-001",
  "team_id": "abc-123",
  "date": "2026-03-27",
  "status": "open",
  "deadline": "2026-03-27T12:00:00Z",
  "created_at": "2026-03-27T09:30:00Z"
}
```

> 같은 팀·같은 날짜에 이미 투표가 있으면 중복 생성을 막습니다 (DB 유니크 제약).

---

### 3-2. 오늘의 투표 조회 🟢

```
GET → supabase
        .from('polls')
        .select('*, menu_suggestions(*, votes(count))')
        .eq('team_id', 팀id)
        .eq('date', 오늘)
        .single()
```

**돌아오는 데이터**

```json
{
  "id": "poll-001",
  "team_id": "abc-123",
  "date": "2026-03-27",
  "status": "open",
  "deadline": "2026-03-27T12:00:00Z",
  "menu_suggestions": [
    {
      "id": "sug-01",
      "name": "김치찌개",
      "suggested_by": "mem-456",
      "votes": [{ "count": 3 }]
    },
    {
      "id": "sug-02",
      "name": "돈까스",
      "suggested_by": "mem-789",
      "votes": [{ "count": 5 }]
    }
  ]
}
```

---

### 3-3. 투표 마감하기 🟢

```
PATCH → supabase.from('polls').update({ status: 'closed' }).eq('id', 투표id)
```

**보내는 데이터**

```json
{
  "status": "closed"
}
```

마감 후 결과 저장은 아래 **5-1. 결과 저장**에서 처리합니다.

---

## 4. 메뉴 제안 & 투표

### 4-1. 메뉴 제안하기 🟢

```
POST → supabase.from('menu_suggestions').insert(...)
```

**보내는 데이터**

```json
{
  "poll_id": "poll-001",
  "name": "김치찌개",
  "suggested_by": "mem-456"
}
```

**돌아오는 데이터**

```json
{
  "id": "sug-01",
  "poll_id": "poll-001",
  "name": "김치찌개",
  "suggested_by": "mem-456",
  "created_at": "2026-03-27T09:35:00Z"
}
```

---

### 4-2. 투표하기 (1인 1표) 🟢

```
POST → supabase.from('votes').upsert(..., { onConflict: 'poll_id, member_id' })
```

`upsert`를 사용하면 처음 투표할 때는 추가, 마음이 바뀌면 자동으로 변경됩니다.

**보내는 데이터**

```json
{
  "poll_id": "poll-001",
  "member_id": "mem-456",
  "suggestion_id": "sug-02"
}
```

**돌아오는 데이터**

```json
{
  "id": "vote-01",
  "poll_id": "poll-001",
  "member_id": "mem-456",
  "suggestion_id": "sug-02",
  "voted_at": "2026-03-27T10:00:00Z"
}
```

---

### 4-3. 내 투표 확인 🟢

```
GET → supabase
        .from('votes')
        .select('suggestion_id')
        .eq('poll_id', 투표id)
        .eq('member_id', 내멤버id)
        .maybeSingle()
```

**돌아오는 데이터**

```json
{
  "suggestion_id": "sug-02"
}
```

> 아직 투표하지 않았으면 `null`이 옵니다.

---

## 5. 결과

### 5-1. 결과 저장 (마감 시 호출) 🔒

투표 마감 직후 **Route Handler 또는 Server Component**에서 실행합니다.

```
POST → supabase.from('poll_results').insert(...)
```

**서버가 계산해서 저장하는 데이터**

```json
{
  "poll_id": "poll-001",
  "winning_suggestion_id": "sug-02",
  "total_votes": 8,
  "decided_at": "2026-03-27T12:00:00Z"
}
```

> 동점이면 서버에서 랜덤으로 하나를 골라 저장합니다.

---

### 5-2. 오늘의 결과 조회 🟢

```
GET → supabase
        .from('poll_results')
        .select('*, menu_suggestions!winning_suggestion_id(name)')
        .eq('poll_id', 투표id)
        .single()
```

**돌아오는 데이터**

```json
{
  "id": "res-001",
  "poll_id": "poll-001",
  "winning_suggestion_id": "sug-02",
  "total_votes": 8,
  "decided_at": "2026-03-27T12:00:00Z",
  "menu_suggestions": {
    "name": "돈까스"
  }
}
```

---

## 6. 메뉴 이력

### 6-1. 최근 이력 조회 🟢

```
GET → supabase
        .from('poll_results')
        .select('decided_at, total_votes, polls(date), menu_suggestions!winning_suggestion_id(name)')
        .eq('polls.team_id', 팀id)
        .order('decided_at', { ascending: false })
        .limit(14)
```

**돌아오는 데이터**

```json
[
  {
    "decided_at": "2026-03-27T12:00:00Z",
    "total_votes": 8,
    "polls": { "date": "2026-03-27" },
    "menu_suggestions": { "name": "돈까스" }
  },
  {
    "decided_at": "2026-03-26T12:00:00Z",
    "total_votes": 6,
    "polls": { "date": "2026-03-26" },
    "menu_suggestions": { "name": "김치찌개" }
  }
]
```

---

## 요약 — API 목록 한눈에 보기

| # | 동작 | 테이블 | 메서드 | 비고 |
|---|------|--------|--------|------|
| 2-1 | 팀 만들기 | teams | insert | |
| 2-2 | 팀 참여 | members | insert | invite_code로 팀 조회 후 |
| 2-3 | 내 팀 목록 | members → teams | select | |
| 3-1 | 투표 열기 | polls | insert | 팀+날짜 유니크 |
| 3-2 | 투표 조회 | polls → menu_suggestions | select | 득표 수 포함 |
| 3-3 | 투표 마감 | polls | update | status → closed |
| 4-1 | 메뉴 제안 | menu_suggestions | insert | 중복 이름 방지 |
| 4-2 | 투표하기 | votes | upsert | 1인 1표 |
| 4-3 | 내 투표 확인 | votes | select | |
| 5-1 | 결과 저장 | poll_results | insert | 서버 전용 |
| 5-2 | 결과 조회 | poll_results → menu_suggestions | select | |
| 6-1 | 이력 조회 | poll_results → polls, menu_suggestions | select | 최근 14건 |
