// 문제 상세: 풀이 코드·메모·복잡도·체감 난이도 보기 / 수정 / 삭제.
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  deleteProblem,
  updateProblem,
  useProblem,
} from '../hooks/useProblems'
import { DifficultyBadge, StatusBadge } from '../components/Badges'
import ProblemForm from '../components/ProblemForm'

function Stars({ value }: { value: number | null }) {
  if (!value) return <span className="text-slate-400">—</span>
  return <span>{'★'.repeat(value)}{'☆'.repeat(5 - value)}</span>
}

export default function ProblemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const problem = useProblem(id)
  const [editing, setEditing] = useState(false)

  if (problem === undefined) {
    return <p className="text-slate-400 text-sm">불러오는 중…</p>
  }
  if (problem === null || !problem) {
    return (
      <div className="text-center py-16 text-slate-400">
        문제를 찾을 수 없습니다.{' '}
        <Link to="/problems" className="text-slate-700 underline">
          목록으로
        </Link>
      </div>
    )
  }

  async function handleDelete() {
    if (!problem) return
    if (!confirm(`"${problem.title}" 문제를 삭제할까요?`)) return
    await deleteProblem(problem.id)
    navigate('/problems')
  }

  if (editing) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h1 className="text-lg font-bold mb-4">문제 수정</h1>
        <ProblemForm
          initial={problem}
          onCancel={() => setEditing(false)}
          onSubmit={async (input) => {
            await updateProblem(problem.id, input)
            setEditing(false)
          }}
        />
      </div>
    )
  }

  const meta = 'text-xs font-medium text-slate-500'

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            to="/problems"
            className="text-sm text-slate-400 hover:text-slate-600"
          >
            ← 목록
          </Link>
          <h1 className="text-2xl font-bold mt-1">
            {problem.number != null && (
              <span className="text-slate-400">{problem.number}. </span>
            )}
            {problem.title}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <DifficultyBadge value={problem.difficulty} />
            <StatusBadge value={problem.status} />
            {problem.url && (
              <a
                href={problem.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                LeetCode ↗
              </a>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="px-3 py-1.5 rounded-md text-sm font-medium border border-slate-300 hover:bg-slate-100"
          >
            수정
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 rounded-md text-sm font-medium border border-rose-200 text-rose-600 hover:bg-rose-50"
          >
            삭제
          </button>
        </div>
      </div>

      {/* 메타 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white rounded-lg border border-slate-200 p-4">
        <div>
          <div className={meta}>언어</div>
          <div>{problem.language}</div>
        </div>
        <div>
          <div className={meta}>체감 난이도</div>
          <div className="text-amber-500">
            <Stars value={problem.perceived_difficulty} />
          </div>
        </div>
        <div>
          <div className={meta}>시간 복잡도</div>
          <div className="font-mono">{problem.time_complexity || '—'}</div>
        </div>
        <div>
          <div className={meta}>공간 복잡도</div>
          <div className="font-mono">{problem.space_complexity || '—'}</div>
        </div>
      </div>

      {problem.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {problem.tags.map((t) => (
            <span
              key={t}
              className="text-xs bg-slate-100 text-slate-600 rounded px-2 py-0.5"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <section>
        <h2 className="text-sm font-semibold text-slate-500 mb-2">풀이 코드</h2>
        {problem.code ? (
          <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-sm">
            <code>{problem.code}</code>
          </pre>
        ) : (
          <p className="text-slate-400 text-sm">아직 코드가 없습니다.</p>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 mb-2">메모</h2>
        {problem.notes ? (
          <p className="whitespace-pre-wrap bg-white rounded-lg border border-slate-200 p-4 text-sm">
            {problem.notes}
          </p>
        ) : (
          <p className="text-slate-400 text-sm">메모가 없습니다.</p>
        )}
      </section>
    </div>
  )
}
