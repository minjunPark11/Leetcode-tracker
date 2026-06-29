# LeetCode 공부 트래커

LeetCode 풀이 진도를 관리하는 개인용 웹앱. 푼 문제·풀이 코드·메모를 저장하고,
로컬(IndexedDB)에 즉시 저장하면서 Supabase로 기기 간 동기화하며,
JSON 파일로 백업/복원할 수 있습니다.

> 구현 단계는 **1단계(MVP)** 와 **3단계(간격 반복·통계)** 만 다룹니다.
> LeetCode 자동 가져오기는 구현하지 않으며, 문제 정보는 직접 입력합니다.
> 현재 저장소에는 **1단계(MVP)** 가 구현되어 있습니다.

## 기술 스택

- Vite + React + TypeScript, Tailwind CSS, react-router-dom
- Supabase (Postgres + Auth + RLS) — 클라우드 동기화
- Dexie.js (IndexedDB) — 로컬 우선(local-first), 오프라인 동작
- recharts + 커스텀 SVG — 통계/히트맵 (3단계)

## 빠른 시작

```bash
npm install
cp .env.example .env   # 값 채우기 (아래 참고). 비워두면 로컬 전용으로 동작.
npm run dev
```

`.env` 를 비워두면 Supabase 없이 **로컬(IndexedDB) 전용**으로 바로 사용할 수 있습니다.

## Supabase 연동 (선택, 기기 간 동기화용)

로그인 화면 없이 개인용으로 쓰기 위해, **단일 계정 자동 로그인** 방식을 사용합니다.

1. [supabase.com](https://supabase.com) 에서 프로젝트를 생성합니다.
2. **SQL Editor** 에 [`supabase/schema.sql`](./supabase/schema.sql) 전체를 붙여넣고 실행합니다.
   (테이블 `problems`, `review_logs` + RLS 정책이 생성됩니다.)
3. **Authentication > Users > Add user** 로 본인 계정을 1개 만듭니다
   (이메일 + 비밀번호, "Auto Confirm User" 체크).
4. **Project Settings > API** 에서 URL 과 anon key 를 복사해 `.env` 에 입력합니다:

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   VITE_APP_USER_EMAIL=you@example.com
   VITE_APP_USER_PASSWORD=your-password
   ```

5. 앱을 실행하면 시작 시 이 계정으로 자동 로그인하고, RLS 로 본인 데이터만
   접근·동기화합니다.

> 비밀번호가 `.env` 에 들어가므로(빌드에 포함됨) **개인용/비공개 배포**에만 사용하세요.

## 동기화 패턴 (local-first)

1. 입력/수정 시 Dexie(IndexedDB)에 즉시 저장 → UI 바로 반영
2. 백그라운드로 Supabase 에 upsert
3. 앱 시작 시 Supabase 에서 최신 데이터를 받아 로컬 캐시 갱신
4. 충돌은 `updated_at` 최신 우선(last-write-wins)으로 단순 처리

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 타입체크 + 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run typecheck` | 타입 검사만 |

## 프로젝트 구조

```
src/
  lib/        supabase.ts · db.ts(Dexie+동기화) · backup.ts · sm2.ts(3단계)
  hooks/      useProblems.ts
  pages/      Dashboard.tsx · Problems.tsx · ProblemDetail.tsx · ReviewQueue.tsx(3단계)
  components/ ProblemForm.tsx · Badges.tsx · Heatmap.tsx(3단계)
supabase/
  schema.sql  DB 스키마 + RLS
```

## 로드맵

- [x] **1단계 (MVP)**: 문제 CRUD, 필터·검색·정렬, 상세, 대시보드, 로컬 우선 저장 + 동기화, JSON 백업
- [ ] **3단계**: SM-2 간격 반복 복습 큐, 잔디 히트맵, 심화 통계
