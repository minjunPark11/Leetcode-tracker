// 난이도 / 상태 배지 — 목록·상세·대시보드에서 공용으로 사용.
import {
  DIFFICULTY_LABELS,
  STATUS_LABELS,
  type Difficulty,
  type Status,
} from '../types'

const DIFFICULTY_CLASS: Record<Difficulty, string> = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-rose-100 text-rose-700',
}

const STATUS_CLASS: Record<Status, string> = {
  todo: 'bg-slate-100 text-slate-600',
  solving: 'bg-blue-100 text-blue-700',
  solved: 'bg-emerald-100 text-emerald-700',
  review: 'bg-violet-100 text-violet-700',
}

export function DifficultyBadge({ value }: { value: Difficulty | null }) {
  if (!value) return null
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${DIFFICULTY_CLASS[value]}`}
    >
      {DIFFICULTY_LABELS[value]}
    </span>
  )
}

export function StatusBadge({ value }: { value: Status }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_CLASS[value]}`}
    >
      {STATUS_LABELS[value]}
    </span>
  )
}
