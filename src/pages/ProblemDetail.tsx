// 문제 상세: 풀이 코드·메모·복잡도·체감 난이도 보기 / 수정 / 삭제.
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteProblem, updateProblem, useProblem } from '../hooks/useProblems'
import { DifficultyBadge, StatusBadge } from '../components/Badges'
import ProblemForm from '../components/ProblemForm'
import { toast } from '../components/Toast'
import { ArrowLeft, Copy, Check, SquarePen, Trash2, ExternalLink } from 'lucide-react'

function Stars({ value }: { value: number | null }) {
  if (!value) return <span className="text-slate-300">—</span>
  return (
    <span className="text-amber-400">
      {'★'.repeat(value)}
      <span className="text-slate-200">{'★'.repeat(5 - value)}</span>
    </span>
  )
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code)
          setCopied(true)
          toast.success('코드를 복사했습니다.')
          setTimeout(() => setCopied(false), 1500)
        } catch {
          toast.error('복사에 실패했습니다.')
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-control px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? '복사됨' : '복사'}
    </button>
  )
}

export default function ProblemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const problem = useProblem(id)
  const [editing, setEditing] = useState(false)

  if (problem === undefined) {
    return (
      <div className="space-y-3 animate-fade-in">
        <div className="skeleton h-8 w-2/3" />
        <div className="skeleton h-24" />
        <div className="skeleton h-40" />
      </div>
    )
  }
  if (!problem) {
    return (
      <div className="card text-center py-16 text-slate-400">
        문제를 찾을 수 없습니다.{' '}
        <Link to="/problems" className="text-brand-600 font-semibold hover:underline">
          목록으로
        </Link>
      </div>
    )
  }

  async function handleDelete() {
    if (!problem) return
    if (!confirm(`"${problem.title}" 문제를 삭제할까요?`)) return
    await deleteProblem(problem.id)
    toast.success('삭제했습니다.')
    navigate('/problems')
  }

  if (editing) {
    return (
      <div className="card p-6 animate-fade-up">
        <h1 className="text-lg font-bold mb-5">문제 수정</h1>
        <ProblemForm
          initial={problem}
          onCancel={() => setEditing(false)}
          onSubmit={async (input) => {
            await updateProblem(problem.id, input)
            setEditing(false)
            toast.success('수정했습니다.')
          }}
        />
      </div>
    )
  }

  const metaLabel = 'text-xs font-semibold uppercase tracking-wide text-slate-400'

  return (
    <div className="space-y-5 animate-fade-up">
      <Link
        to="/problems"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 font-medium"
      >
        <ArrowLeft size={16} />
        목록
      </Link>

      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight">
              {problem.number != null && (
                <span className="text-slate-300">{problem.number}. </span>
              )}
              {problem.title}
            </h1>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <DifficultyBadge value={problem.difficulty} />
              <StatusBadge value={problem.status} />
              {problem.url && (
                <a
                  href={problem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
                >
                  LeetCode <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setEditing(true)} className="btn-ghost px-3">
              <SquarePen size={16} />
              <span className="hidden sm:inline">수정</span>
            </button>
            <button onClick={handleDelete} className="btn-danger px-3">
              <Trash2 size={16} />
              <span className="hidden sm:inline">삭제</span>
            </button>
          </div>
        </div>

        {/* 메타 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200/70">
          <div>
            <div className={metaLabel}>언어</div>
            <div className="mt-1 font-semibold">{problem.language}</div>
          </div>
          <div>
            <div className={metaLabel}>체감 난이도</div>
            <div className="mt-1">
              <Stars value={problem.perceived_difficulty} />
            </div>
          </div>
          <div>
            <div className={metaLabel}>시간 복잡도</div>
            <div className="mt-1 font-mono font-semibold">
              {problem.time_complexity || '—'}
            </div>
          </div>
          <div>
            <div className={metaLabel}>공간 복잡도</div>
            <div className="mt-1 font-mono font-semibold">
              {problem.space_complexity || '—'}
            </div>
          </div>
        </div>

        {problem.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-5">
            {problem.tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 코드 */}
      <section className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200/70">
          <h2 className="text-sm font-bold text-slate-500">풀이 코드</h2>
          {problem.code && (
            <div className="flex items-center gap-2">
              <span className="chip">{problem.language}</span>
            </div>
          )}
        </div>
        {problem.code ? (
          <div className="relative bg-slate-900">
            <div className="absolute top-2 right-2">
              <CopyButton code={problem.code} />
            </div>
            <pre className="text-slate-100 p-5 pt-10 overflow-x-auto text-sm leading-relaxed">
              <code>{problem.code}</code>
            </pre>
          </div>
        ) : (
          <p className="text-slate-400 text-sm px-5 py-8 text-center">
            아직 코드가 없습니다.
          </p>
        )}
      </section>

      {/* 메모 */}
      <section className="card p-5">
        <h2 className="text-sm font-bold text-slate-500 mb-3">메모</h2>
        {problem.notes ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {problem.notes}
          </p>
        ) : (
          <p className="text-slate-400 text-sm">메모가 없습니다.</p>
        )}
      </section>
    </div>
  )
}
