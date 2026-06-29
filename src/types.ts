// 도메인 타입 정의 — Supabase 스키마(supabase/schema.sql)와 1:1 대응.

export type Difficulty = 'easy' | 'medium' | 'hard'
export type Status = 'todo' | 'solving' | 'solved' | 'review'

export interface Problem {
  id: string
  user_id?: string | null
  number: number | null
  title: string
  url: string | null
  difficulty: Difficulty | null
  tags: string[]
  status: Status
  code: string | null
  language: string
  notes: string | null
  time_complexity: string | null
  space_complexity: string | null
  perceived_difficulty: number | null
  first_solved_at: string | null
  // SM-2 간격 반복 상태 (3단계)
  ease_factor: number
  interval_days: number
  repetitions: number
  due_date: string | null
  last_reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface ReviewLog {
  id: string
  user_id?: string | null
  problem_id: string
  reviewed_at: string
  quality: number
}

// 신규 문제 생성 시 폼에서 받는 필드들.
export type ProblemInput = Pick<
  Problem,
  | 'number'
  | 'title'
  | 'url'
  | 'difficulty'
  | 'tags'
  | 'status'
  | 'code'
  | 'language'
  | 'notes'
  | 'time_complexity'
  | 'space_complexity'
  | 'perceived_difficulty'
>

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']
export const STATUSES: Status[] = ['todo', 'solving', 'solved', 'review']

export const STATUS_LABELS: Record<Status, string> = {
  todo: '할 일',
  solving: '푸는 중',
  solved: '해결',
  review: '복습',
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}
