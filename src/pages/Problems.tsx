// 문제 목록: 검색·태그·정렬은 상단 바에서, 상태·난이도 필터는 좌측 사이드바(URL 쿼리)에서.
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { createProblem, useProblems } from '../hooks/useProblems'
import { DifficultyBadge, StatusBadge, DIFFICULTY_BAR } from '../components/Badges'
import ProblemForm from '../components/ProblemForm'
import { toast } from '../components/Toast'
import { Plus, Search, X, List } from 'lucide-react'
import {
  DIFFICULTY_LABELS,
  STATUS_LABELS,
  type Difficulty,
  type Status,
} from '../types'

type SortKey = 'updated' | 'number' | 'title' | 'difficulty'
const DIFFICULTY_ORDER: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 }

export default function Problems() {
  const problems = useProblems()
  const [params, setParams] = useSearchParams()
  const [showForm, setShowForm] = useState(false)

  const [search, setSearch] = useState('')
  const [tag, setTag] = useState<string>('all')
  const [sort, setSort] = useState<SortKey>('updated')

  // 상태·난이도는 사이드바가 설정하는 URL 쿼리에서 읽는다.
  const status = (params.get('status') as Status | null) ?? null
  const difficulty = (params.get('difficulty') as Difficulty | null) ?? null

  const allTags = useMemo(() => {
    const set = new Set<string>()
    problems?.forEach((p) => p.tags.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [problems])

  const filtered = useMemo(() => {
    if (!problems) return []
    const q = search.trim().toLowerCase()
    const list = problems.filter((p) => {
      if (difficulty && p.difficulty !== difficulty) return false
      if (status && p.status !== status) return false
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

  const activeFacets = [
    status && { key: 'status', label: STATUS_LABELS[status] },
    difficulty && { key: 'difficulty', label: DIFFICULTY_LABELS[difficulty] },
  ].filter(Boolean) as { key: string; label: string }[]

  function clearFacet(key: string) {
    const p = new URLSearchParams(params)
    p.delete(key)
    setParams(p)
  }

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            문제{' '}
            {problems && (
              <span className="text-slate-300 text-xl font-bold">{filtered.length}</span>
            )}
          </h1>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {activeFacets.length === 0 ? (
              <p className="text-sm text-slate-400">풀이·메모·복잡도를 한곳에서 관리하세요.</p>
            ) : (
              activeFacets.map((f) => (
                <button
                  key={f.key}
                  onClick={() => clearFacet(f.key)}
                  className="chip gap-1 hover:bg-slate-200/80"
                >
                  {f.label}
                  <X size={12} />
                </button>
              ))
            )}
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary shrink-0">
          <Plus size={18} />새 문제
        </button>
      </div>

      {/* 검색 / 태그 / 정렬 */}
      <div className="card p-3 mb-5 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            className="input pl-9"
            placeholder="검색 (번호·제목·태그)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-auto"
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
          className="input w-auto"
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
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-14" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center text-center py-16 px-6">
          <span className="grid place-items-center w-14 h-14 rounded-card text-brand-500 bg-brand-100/70 mb-4">
            <List size={26} />
          </span>
          <p className="font-semibold text-slate-600">
            {problems.length === 0 ? '아직 문제가 없습니다' : '조건에 맞는 문제가 없습니다'}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {problems.length === 0
              ? '"새 문제"로 첫 문제를 추가해 보세요.'
              : '필터를 바꿔보세요.'}
          </p>
          {problems.length === 0 && (
            <button onClick={() => setShowForm(true)} className="btn-primary mt-5">
              <Plus size={18} />새 문제
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((p, i) => (
            <li
              key={p.id}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}
            >
              <Link
                to={`/problems/${p.id}`}
                className="card card-hover flex items-center gap-3 pl-0 pr-4 py-3 overflow-hidden"
              >
                <span
                  className={`self-stretch w-1.5 rounded-full ${
                    p.difficulty ? DIFFICULTY_BAR[p.difficulty] : 'bg-slate-200'
                  }`}
                />
                <span className="text-slate-300 text-sm font-bold w-9 shrink-0 text-center">
                  {p.number ?? '—'}
                </span>
                <span className="font-semibold flex-1 truncate">{p.title}</span>
                <span className="hidden md:flex gap-1 flex-wrap justify-end max-w-[220px]">
                  {p.tags.slice(0, 3).map((t) => (
                    <span key={t} className="chip">
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
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-start justify-center p-4 z-40 overflow-y-auto animate-fade-in">
          <div className="card w-full max-w-2xl my-8 p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">새 문제 추가</h2>
              <button onClick={() => setShowForm(false)} className="icon-btn" aria-label="닫기">
                <X size={18} />
              </button>
            </div>
            <ProblemForm
              submitLabel="추가"
              onCancel={() => setShowForm(false)}
              onSubmit={async (input) => {
                await createProblem(input)
                setShowForm(false)
                toast.success('문제를 추가했습니다.')
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
