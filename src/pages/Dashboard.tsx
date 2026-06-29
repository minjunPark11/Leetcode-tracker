// 기본 대시보드: 총 푼 문제, 난이도별·태그별 진행도, 연속 학습일(streak),
// JSON 내보내기/불러오기.
import { useMemo, useRef } from 'react'
import { useProblems } from '../hooks/useProblems'
import { exportBackup, importBackup } from '../lib/backup'
import { syncAll } from '../lib/db'
import { DIFFICULTIES, DIFFICULTY_LABELS, type Difficulty } from '../types'

const DIFF_BAR: Record<Difficulty, string> = {
  easy: 'bg-emerald-500',
  medium: 'bg-amber-500',
  hard: 'bg-rose-500',
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
  // 오늘 활동이 없으면 어제부터 시작 (오늘은 아직일 수 있으므로).
  if (!days.has(localDay(cursor.toISOString()))) {
    cursor.setDate(cursor.getDate() - 1)
  }
  while (days.has(localDay(cursor.toISOString()))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
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
      byDifficulty,
      topTags,
      maxTag,
      streak: computeStreak(activityDays),
    }
  }, [problems])

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const n = await importBackup(file)
      await syncAll()
      alert(`${n}개의 문제를 불러왔습니다.`)
    } catch (err) {
      alert(`불러오기 실패: ${(err as Error).message}`)
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">대시보드</h1>
        <div className="flex gap-2">
          <button
            onClick={() => exportBackup()}
            className="px-3 py-1.5 rounded-md text-sm font-medium border border-slate-300 hover:bg-slate-100"
          >
            JSON 내보내기
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="px-3 py-1.5 rounded-md text-sm font-medium border border-slate-300 hover:bg-slate-100"
          >
            JSON 불러오기
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="총 문제" value={stats.total} />
        <StatCard label="푼 문제" value={stats.solvedCount} />
        <StatCard label="연속 학습일" value={`${stats.streak}일`} />
        <StatCard
          label="완료율"
          value={
            stats.total
              ? `${Math.round((stats.solvedCount / stats.total) * 100)}%`
              : '0%'
          }
        />
      </div>

      {/* 난이도별 진행도 */}
      <section className="bg-white rounded-lg border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-500 mb-4">
          난이도별 진행도
        </h2>
        <div className="space-y-3">
          {stats.byDifficulty.map((d) => (
            <div key={d.difficulty}>
              <div className="flex justify-between text-sm mb-1">
                <span>{DIFFICULTY_LABELS[d.difficulty]}</span>
                <span className="text-slate-400">
                  {d.solved} / {d.total}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${DIFF_BAR[d.difficulty]}`}
                  style={{
                    width: `${d.total ? (d.solved / d.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 태그별 진행도 */}
      <section className="bg-white rounded-lg border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-500 mb-4">
          많이 푼 태그 (Top 8)
        </h2>
        {stats.topTags.length === 0 ? (
          <p className="text-slate-400 text-sm">아직 데이터가 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {stats.topTags.map(([tag, count]) => (
              <div key={tag} className="flex items-center gap-3">
                <span className="text-sm w-32 truncate">{tag}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-700"
                    style={{ width: `${(count / stats.maxTag) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-6 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
