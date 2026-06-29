// 문제 목록: 난이도·태그·상태 필터, 검색, 정렬, 생성 모달.
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { createProblem, useProblems } from '../hooks/useProblems'
import { DifficultyBadge, StatusBadge } from '../components/Badges'
import ProblemForm from '../components/ProblemForm'
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  STATUSES,
  STATUS_LABELS,
  type Difficulty,
  type Status,
} from '../types'

type SortKey = 'updated' | 'number' | 'title' | 'difficulty'
const DIFFICULTY_ORDER: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 }

export default function Problems() {
  const problems = useProblems()
  const [showForm, setShowForm] = useState(false)

  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all')
  const [status, setStatus] = useState<Status | 'all'>('all')
  const [tag, setTag] = useState<string>('all')
  const [sort, setSort] = useState<SortKey>('updated')

  const allTags = useMemo(() => {
    const set = new Set<string>()
    problems?.forEach((p) => p.tags.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [problems])

  const filtered = useMemo(() => {
    if (!problems) return []
    const q = search.trim().toLowerCase()
    const list = problems.filter((p) => {
      if (difficulty !== 'all' && p.difficulty !== difficulty) return false
      if (status !== 'all' && p.status !== status) return false
      if (tag !== 'all' && !p.tags.includes(tag)) return false
      if (q) {
        const hay = `${p.number ?? ''} ${p.title} ${p.tags.join(' ')}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    list.sort((a, b) => {
      switch (sort) {
        case 'number':
          return (a.number ?? Infinity) - (b.number ?? Infinity)
        case 'title':
          return a.title.localeCompare(b.title)
        case 'difficulty':
          return (
            (a.difficulty ? DIFFICULTY_ORDER[a.difficulty] : 99) -
            (b.difficulty ? DIFFICULTY_ORDER[b.difficulty] : 99)
          )
        default:
          return b.updated_at.localeCompare(a.updated_at)
      }
    })
    return list
  }, [problems, search, difficulty, status, tag, sort])

  const selectCls =
    'rounded-md border border-slate-300 px-2 py-1.5 text-sm bg-white'

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          문제{' '}
          <span className="text-slate-400 text-base font-normal">
            {problems ? problems.length : ''}
          </span>
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-700"
        >
          + 새 문제
        </button>
      </div>

      {/* 필터 바 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm flex-1 min-w-[180px]"
          placeholder="검색 (번호·제목·태그)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={selectCls}
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty | 'all')}
        >
          <option value="all">난이도 전체</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {DIFFICULTY_LABELS[d]}
            </option>
          ))}
        </select>
        <select
          className={selectCls}
          value={status}
          onChange={(e) => setStatus(e.target.value as Status | 'all')}
        >
          <option value="all">상태 전체</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          className={selectCls}
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        >
          <option value="all">태그 전체</option>
          {allTags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className={selectCls}
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
        >
          <option value="updated">최근 수정순</option>
          <option value="number">번호순</option>
          <option value="title">제목순</option>
          <option value="difficulty">난이도순</option>
        </select>
      </div>

      {/* 목록 */}
      {problems === undefined ? (
        <p className="text-slate-400 text-sm">불러오는 중…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          {problems.length === 0
            ? '아직 문제가 없습니다. "+ 새 문제"로 추가해 보세요.'
            : '조건에 맞는 문제가 없습니다.'}
        </div>
      ) : (
        <ul className="divide-y divide-slate-200 bg-white rounded-lg border border-slate-200">
          {filtered.map((p) => (
            <li key={p.id}>
              <Link
                to={`/problems/${p.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
              >
                <span className="text-slate-400 text-sm w-10 shrink-0">
                  {p.number ?? '—'}
                </span>
                <span className="font-medium flex-1 truncate">{p.title}</span>
                <span className="hidden sm:flex gap-1 flex-wrap justify-end max-w-[200px]">
                  {p.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="text-xs bg-slate-100 text-slate-500 rounded px-1.5 py-0.5"
                    >
                      {t}
                    </span>
                  ))}
                </span>
                <DifficultyBadge value={p.difficulty} />
                <StatusBadge value={p.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* 생성 모달 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center p-4 z-20 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8 p-6">
            <h2 className="text-lg font-bold mb-4">새 문제 추가</h2>
            <ProblemForm
              submitLabel="추가"
              onCancel={() => setShowForm(false)}
              onSubmit={async (input) => {
                await createProblem(input)
                setShowForm(false)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
