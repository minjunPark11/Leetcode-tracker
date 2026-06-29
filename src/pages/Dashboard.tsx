// 대시보드: 벤토 그리드 레이아웃 + 완료율 도넛 + 난이도/태그 진행도,
// 연속 학습일(streak), JSON 내보내기/불러오기.
import { useMemo, useRef } from 'react'
import { useProblems } from '../hooks/useProblems'
import { exportBackup, importBackup } from '../lib/backup'
import { syncAll } from '../lib/db'
import { toast } from '../components/Toast'
import { Download, Upload, Flame, List, Check } from 'lucide-react'
import { DIFFICULTIES, DIFFICULTY_LABELS, type Difficulty } from '../types'

const DIFF_BAR: Record<Difficulty, string> = {
  easy: 'from-emerald-400 to-teal-400',
  medium: 'from-amber-400 to-orange-400',
  hard: 'from-rose-400 to-pink-500',
}

// 로컬 기준 YYYY-MM-DD.
function localDay(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

function computeStreak(days: Set<string>): number {
  if (days.size === 0) return 0
  let streak = 0
  const cursor = new Date()
  if (!days.has(localDay(cursor.toISOString()))) {
    cursor.setDate(cursor.getDate() - 1)
  }
  while (days.has(localDay(cursor.toISOString()))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

function ProgressRing({ percent }: { percent: number }) {
  const size = 168
  const stroke = 14
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - percent / 100)
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(148,163,184,0.18)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold gradient-text">{percent}%</span>
        <span className="text-xs font-semibold text-slate-400 mt-0.5">완료율</span>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  accent: string
}) {
  return (
    <div className="card card-hover p-5 flex flex-col justify-between">
      <span
        className={`grid place-items-center w-10 h-10 rounded-control text-white bg-gradient-to-br ${accent} shadow-lg`}
      >
        {icon}
      </span>
      <div className="mt-4">
        <div className="text-2xl font-extrabold tracking-tight">{value}</div>
        <div className="text-xs font-semibold text-slate-400 mt-0.5">{label}</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const problems = useProblems()
  const fileRef = useRef<HTMLInputElement>(null)

  const stats = useMemo(() => {
    const list = problems ?? []
    const solvedStatuses = new Set(['solved', 'review'])
    const solved = list.filter((p) => solvedStatuses.has(p.status))
    const solving = list.filter((p) => p.status === 'solving')

    const byDifficulty = DIFFICULTIES.map((d) => ({
      difficulty: d,
      total: list.filter((p) => p.difficulty === d).length,
      solved: solved.filter((p) => p.difficulty === d).length,
    }))

    const tagCount = new Map<string, number>()
    solved.forEach((p) =>
      p.tags.forEach((t) => tagCount.set(t, (tagCount.get(t) ?? 0) + 1)),
    )
    const topTags = Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
    const maxTag = topTags[0]?.[1] ?? 1

    const activityDays = new Set<string>()
    list.forEach((p) => {
      if (p.first_solved_at) activityDays.add(localDay(p.first_solved_at))
      if (p.last_reviewed_at) activityDays.add(localDay(p.last_reviewed_at))
    })

    return {
      total: list.length,
      solvedCount: solved.length,
      solvingCount: solving.length,
      byDifficulty,
      topTags,
      maxTag,
      streak: computeStreak(activityDays),
      percent: list.length
        ? Math.round((solved.length / list.length) * 100)
        : 0,
    }
  }, [problems])

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const n = await importBackup(file)
      await syncAll()
      toast.success(`${n}개의 문제를 불러왔습니다.`)
    } catch (err) {
      toast.error(`불러오기 실패: ${(err as Error).message}`)
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">대시보드</h1>
          <p className="text-sm text-slate-400 mt-0.5">학습 현황 한눈에 보기</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportBackup()} className="btn-ghost px-3">
            <Download size={16} />
            <span className="hidden sm:inline">내보내기</span>
          </button>
          <button onClick={() => fileRef.current?.click()} className="btn-ghost px-3">
            <Upload size={16} />
            <span className="hidden sm:inline">불러오기</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImport}
          />
        </div>
      </div>

      {/* 벤토 그리드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 히어로: 완료율 도넛 */}
        <div className="card sm:col-span-2 lg:row-span-2 p-6 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br from-indigo-300/30 to-fuchsia-300/30 blur-2xl animate-float" />
          <ProgressRing percent={stats.percent} />
          <div className="text-center">
            <div className="text-lg font-bold">
              <span className="gradient-text">{stats.solvedCount}</span>
              <span className="text-slate-300"> / {stats.total} 문제 해결</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              꾸준함이 실력입니다. 오늘도 한 문제!
            </p>
          </div>
        </div>

        <StatCard
          label="연속 학습일"
          value={`${stats.streak}일`}
          accent="from-orange-400 to-rose-500"
          icon={<Flame size={20} />}
        />
        <StatCard
          label="총 문제"
          value={stats.total}
          accent="from-indigo-400 to-violet-500"
          icon={<List size={20} />}
        />
        <StatCard
          label="해결"
          value={stats.solvedCount}
          accent="from-emerald-400 to-teal-500"
          icon={<Check size={20} />}
        />
        <StatCard
          label="푸는 중"
          value={stats.solvingCount}
          accent="from-sky-400 to-blue-500"
          icon={<List size={20} />}
        />

        {/* 난이도별 진행도 */}
        <div className="card sm:col-span-2 p-5">
          <h2 className="text-sm font-bold text-slate-500 mb-4">난이도별 진행도</h2>
          <div className="space-y-3.5">
            {stats.byDifficulty.map((d) => {
              const pct = d.total ? (d.solved / d.total) * 100 : 0
              return (
                <div key={d.difficulty}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-semibold">
                      {DIFFICULTY_LABELS[d.difficulty]}
                    </span>
                    <span className="text-slate-400 font-medium">
                      {d.solved} / {d.total}
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-200/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${DIFF_BAR[d.difficulty]} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 태그별 진행도 */}
        <div className="card sm:col-span-2 p-5">
          <h2 className="text-sm font-bold text-slate-500 mb-4">
            많이 푼 태그 <span className="text-slate-300">Top 8</span>
          </h2>
          {stats.topTags.length === 0 ? (
            <p className="text-slate-400 text-sm py-6 text-center">
              아직 데이터가 없습니다.
            </p>
          ) : (
            <div className="space-y-2.5">
              {stats.topTags.map(([tag, count]) => (
                <div key={tag} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-28 truncate">{tag}</span>
                  <div className="flex-1 h-2.5 bg-slate-200/60 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-400 transition-all duration-700"
                      style={{ width: `${(count / stats.maxTag) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-400 w-6 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
