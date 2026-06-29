-- LeetCode 공부 트래커 — Supabase / Postgres 스키마
-- 적용 방법:
--   1) Supabase 대시보드 > SQL Editor 에 아래 전체를 붙여넣고 실행.
--   2) Authentication > Users 에서 본인 계정을 1개 생성한 뒤,
--      그 이메일/비밀번호를 프로젝트 루트 .env 의
--      VITE_APP_USER_EMAIL / VITE_APP_USER_PASSWORD 에 입력.
--   3) 앱이 시작 시 해당 계정으로 자동 로그인하며, RLS 로 본인 데이터만 접근합니다.

create table if not exists problems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) default auth.uid(),
  number int,
  title text not null,
  url text,
  difficulty text check (difficulty in ('easy','medium','hard')),
  tags text[] default '{}',
  status text not null default 'todo'
    check (status in ('todo','solving','solved','review')),
  code text,
  language text default 'python',
  notes text,
  time_complexity text,
  space_complexity text,
  perceived_difficulty int check (perceived_difficulty between 1 and 5),
  first_solved_at timestamptz,
  -- SM-2 간격 반복 상태 (3단계)
  ease_factor real default 2.5,
  interval_days int default 0,
  repetitions int default 0,
  due_date date,
  last_reviewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists review_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) default auth.uid(),
  problem_id uuid not null references problems(id) on delete cascade,
  reviewed_at timestamptz default now(),
  quality int check (quality between 0 and 5)
);

alter table problems enable row level security;
alter table review_logs enable row level security;

drop policy if exists "own problems" on problems;
create policy "own problems" on problems
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own reviews" on review_logs;
create policy "own reviews" on review_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
