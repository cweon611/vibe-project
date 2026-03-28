# AGENTS.md — 프로젝트 규칙 (AI·협업용)

이 문서는 이 저장소에서 코드를 작성·수정할 때 **반드시 지켜야 할 기술 스택과 관례**를 정리합니다. 사용자가 매번 같은 설명을 반복하지 않아도 되도록, 아래 규칙을 우선합니다.

---

## 기술 스택

| 영역 | 선택 |
|------|------|
| 프레임워크 | **Next.js** — **App Router** (`app/` 디렉터리) |
| 언어 | **TypeScript** (`.ts`, `.tsx`) |
| 스타일 | **Tailwind CSS** |
| 데이터베이스·백엔드(BaaS) | **Supabase** |

---

## 반드시 지켜야 할 것 (DO)

- **App Router만 사용한다.** 페이지·레이아웃·로딩·에러 UI는 `app/` 아래에 둔다. 새 라우트는 `page.tsx`, 공통 레이아웃은 `layout.tsx` 등 App Router 관례를 따른다.
- **TypeScript로 작성한다.** 새 파일은 기본적으로 `.ts` / `.tsx`이며, 가능한 한 타입을 명시한다 (`any` 남용 금지).
- **스타일은 Tailwind 유틸리티 클래스**로 맞춘다. 디자인 토큰·간격·색은 프로젝트에 이미 있는 Tailwind 설정과 일관되게 쓴다.
- **데이터 접근은 Supabase 클라이언트/SDK**를 통해 한다. 스키마·RLS·환경 변수(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 등) 패턴을 프로젝트에 맞춘다.
- **서버/클라이언트 경계를 명확히 한다.** `'use client'`는 필요한 최소 범위에만 둔다. 데이터 페칭·민감 로직은 Server Components나 Route Handlers(`route.ts`)를 우선 고려한다.
- **Next.js 권장 패턴**을 따른다: `next/image`, `next/link`, 메타데이터 API(`metadata` / `generateMetadata`) 등을 상황에 맞게 사용한다.
- **환경 변수·시크릿**은 코드에 하드코딩하지 않고 `.env.local` 등 설정으로 분리한다.

---

## 하면 안 되는 것 (DON'T)

- **Pages Router와 App Router를 섞지 않는다.** `pages/`에 새 기능을 추가하지 않는다 (기존 레거시가 없다면 `pages/`를 새로 만들지 않는다).
- **JavaScript만 있는 새 파일(`.js` / `.jsx`)을 기본으로 추가하지 않는다.** 예외는 설정 파일 등 도구가 JS만 요구하는 경우뿐이다.
- **CSS-in-JS, CSS Modules, styled-components 등**을 새로 도입해 스타일 방식을 나누지 않는다. (Tailwind가 이미 쓰이는 한 Tailwind를 유지한다.)
- **Supabase 대신 임의의 다른 DB 클라이언트나 ORM으로 “대체”하지 않는다.** 요구사항이 바뀌지 않는 한 Supabase를 유지한다.
- **`any`로 타입을 우회하거나 `@ts-ignore`를 남발하지 않는다.**
- **전역 상태·클라이언트 번들을 불필요하게 키우지 않는다.** `'use client'`를 루트 레이아웃 전체에 걸지 않는다.
- **API 키·서비스 롤 키를 클라이언트에 노출하는 코드를 작성하지 않는다.**

---

## AI에게 요청할 때 한 줄로 붙여 넣기

> Next.js App Router + TypeScript + Tailwind + Supabase. `AGENTS.md`의 DO/DON'T를 따른다.

---

## 참고

- 프로젝트별 세부사항(ESLint/Prettier, import alias `@/`, 폴더 구조)은 저장소의 `package.json`, `tsconfig.json`, `tailwind.config.*`를 우선한다.
- 이 문서와 충돌하는 지시가 있으면 **사용자의 최신 명시적 지시**가 우선한다.
