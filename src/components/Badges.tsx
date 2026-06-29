// 난이도 / 상태 배지 — 목록·상세·대시보드에서 공용으로 사용.
import {
  DIFFICULTY_LABELS,
  STATUS_LABELS,
  type Difficulty,
  type Status,
} from '../types'

const DIFFICULTY_CLASS: Record<Difficulty, string> = {
  easy: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
  medium: 'bg-amber-50 text-amber-600 ring-amber-200',
  hard: 'bg-rose-50 text-rose-600 ring-rose-200',
}

const STATUS_CLASS: Record<Status, string> = {
  todo: 'bg-slate-100 text-slate-500 ring-slate-200',
  solving: 'bg-blue-50 text-blue-600 ring-blue-200',
  solved: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
  review: 'bg-violet-50 text-violet-600 ring-violet-200',
}

// 좌측 컬러 띠(목록 행 강조)에 쓰는 색.
export const DIFFICULTY_BAR: Record<Difficulty, string> = {
  easy: 'bg-emerald-400',
  medium: 'bg-amber-400',
  hard: 'bg-rose-400',
}

const pill =
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset'

export function DifficultyBadge({ value }: { value: Difficulty | null }) {
  if (!value) return null
  return <span className={`${pill} ${DIFFICULTY_CLASS[value]}`}>{DIFFICULTY_LABELS[value]}</span>
}

export function StatusBadge({ value }: { value: Status }) {
  return <span className={`${pill} ${STATUS_CLASS[value]}`}>{STATUS_LABELS[value]}</span>
}
