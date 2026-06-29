// 2단 사이드바의 "메인(옅은 회색)" 패널 — 문제 화면의 필터 내비게이션.
// 상태(Status) / 난이도(Difficulty)를 그룹으로 묶고, 각 항목에 개수 배지를 표시한다.
// 항목 클릭 시 URL 쿼리(?status=, ?difficulty=)를 토글하여 목록을 필터링한다.
import { Link, useSearchParams } from 'react-router-dom'
import { useProblems } from '../hooks/useProblems'
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  STATUSES,
  STATUS_LABELS,
  type Difficulty,
  type Status,
} from '../types'
import {
  ListIcon,
  CircleIcon,
  CircleDotIcon,
  CircleCheckIcon,
  RefreshIcon,
} from './icons'
import type { ComponentType, SVGProps } from 'react'

const STATUS_ICON: Record<Status, ComponentType<SVGProps<SVGSVGElement>>> = {
  todo: CircleIcon,
  solving: CircleDotIcon,
  solved: CircleCheckIcon,
  review: RefreshIcon,
}

const DIFF_DOT: Record<Difficulty, string> = {
  easy: 'bg-emerald-400',
  medium: 'bg-amber-400',
  hard: 'bg-rose-400',
}

function Row({
  to,
  active,
  label,
  count,
  icon,
}: {
  to: string
  active: boolean
  label: string
  count: number
  icon: React.ReactNode
}) {
  return (
    <Link
      to={to}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
        active
          ? 'bg-gradient-to-r from-violet-100 to-fuchsia-100 text-violet-700 shadow-sm shadow-violet-200/50'
          : 'text-slate-600 hover:bg-white/70'
      }`}
    >
      <span
        className={`shrink-0 ${active ? 'text-violet-500' : 'text-slate-400 group-hover:text-slate-500'}`}
      >
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      <span
        className={`text-xs font-bold tabular-nums ${
          active ? 'text-violet-400' : 'text-slate-300'
        }`}
      >
        {count}
      </span>
    </Link>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pt-4 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
      {children}
    </div>
  )
}

export default function ProblemSidebar() {
  const problems = useProblems()
  const [params] = useSearchParams()
  const curStatus = params.get('status')
  const curDiff = params.get('difficulty')
  const list = problems ?? []

  // 현재 쿼리를 기준으로 key 를 토글한 href 생성.
  function href(key: 'status' | 'difficulty', value: string) {
    const p = new URLSearchParams(params)
    if (p.get(key) === value) p.delete(key)
    else p.set(key, value)
    const s = p.toString()
    return s ? `/problems?${s}` : '/problems'
  }

  const statusCount = (s: Status) => list.filter((p) => p.status === s).length
  const diffCount = (d: Difficulty) => list.filter((p) => p.difficulty === d).length

  return (
    <div className="card !rounded-3xl h-full flex flex-col p-3 overflow-y-auto">
      <h2 className="px-3 pt-2 pb-3 text-xl font-extrabold tracking-tight">문제</h2>

      <Row
        to="/problems"
        active={!curStatus && !curDiff}
        label="전체"
        count={list.length}
        icon={<ListIcon width={18} height={18} />}
      />

      <div className="mx-3 my-1 border-t border-slate-200/70" />

      <SectionLabel>상태</SectionLabel>
      {STATUSES.map((s) => {
        const Icon = STATUS_ICON[s]
        return (
          <Row
            key={s}
            to={href('status', s)}
            active={curStatus === s}
            label={STATUS_LABELS[s]}
            count={statusCount(s)}
            icon={<Icon width={18} height={18} />}
          />
        )
      })}

      <div className="mx-3 my-1 border-t border-slate-200/70" />

      <SectionLabel>난이도</SectionLabel>
      {DIFFICULTIES.map((d) => (
        <Row
          key={d}
          to={href('difficulty', d)}
          active={curDiff === d}
          label={DIFFICULTY_LABELS[d]}
          count={diffCount(d)}
          icon={<span className={`block w-2.5 h-2.5 rounded-full ${DIFF_DOT[d]}`} />}
        />
      ))}
    </div>
  )
}
