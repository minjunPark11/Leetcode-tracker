// 문제 생성/수정 폼. 생성과 수정 양쪽에서 재사용.
// 검증 실패 시 "무엇이 / 왜 / 어떻게 고칠지"를 알려주는 구체적 메시지를 필드별로 표시한다.
import { useState } from 'react'
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  STATUS_LABELS,
  STATUSES,
  type Problem,
  type ProblemInput,
} from '../types'
import { toast } from './Toast'

interface Props {
  initial?: Problem
  onSubmit: (input: ProblemInput) => void | Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

type Errors = Partial<Record<'number' | 'title' | 'url' | 'perceived', string>>

export default function ProblemForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = '저장',
}: Props) {
  const [number, setNumber] = useState(initial?.number?.toString() ?? '')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [url, setUrl] = useState(initial?.url ?? '')
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? 'easy')
  const [status, setStatus] = useState(initial?.status ?? 'todo')
  const [tags, setTags] = useState(initial?.tags?.join(', ') ?? '')
  const [language, setLanguage] = useState(initial?.language ?? 'python')
  const [code, setCode] = useState(initial?.code ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [timeC, setTimeC] = useState(initial?.time_complexity ?? '')
  const [spaceC, setSpaceC] = useState(initial?.space_complexity ?? '')
  const [perceived, setPerceived] = useState(
    initial?.perceived_difficulty?.toString() ?? '',
  )
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)

  // 무엇이 잘못됐는지 + 어떻게 고치는지 구체적으로 안내.
  function validate(): Errors {
    const e: Errors = {}
    if (!title.trim()) {
      e.title = '제목을 입력해주세요. (예: Two Sum)'
    }
    if (number.trim()) {
      const n = Number(number)
      if (!Number.isInteger(n) || n <= 0) {
        e.number = '문제 번호는 1 이상의 정수로 입력해주세요. (예: 1)'
      }
    }
    if (url.trim() && !/^https?:\/\//i.test(url.trim())) {
      e.url = 'URL은 http:// 또는 https:// 로 시작해야 합니다.'
    }
    if (perceived.trim()) {
      const n = Number(perceived)
      if (!Number.isInteger(n) || n < 1 || n > 5) {
        e.perceived = '체감 난이도는 1부터 5 사이의 숫자로 입력해주세요.'
      }
    }
    return e
  }

  const clearError = (key: keyof Errors) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) {
      // 첫 번째 오류 필드로 포커스 이동 + 요약 토스트.
      const first = (Object.keys(e) as (keyof Errors)[])[0]
      document.getElementById(`field-${first}`)?.focus()
      toast.error('입력값을 확인해주세요. 표시된 항목을 수정하면 저장할 수 있어요.')
      return
    }

    setSaving(true)
    const input: ProblemInput = {
      number: number.trim() ? parseInt(number, 10) : null,
      title: title.trim(),
      url: url.trim() || null,
      difficulty,
      status,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      language: language.trim() || 'python',
      code: code || null,
      notes: notes || null,
      time_complexity: timeC.trim() || null,
      space_complexity: spaceC.trim() || null,
      perceived_difficulty: perceived ? parseInt(perceived, 10) : null,
    }
    try {
      await onSubmit(input)
    } finally {
      setSaving(false)
    }
  }

  const inputCls = (key?: keyof Errors) =>
    `input ${key && errors[key] ? 'input-error' : ''}`

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label htmlFor="field-number" className="field-label">
            번호
          </label>
          <input
            id="field-number"
            className={inputCls('number')}
            value={number}
            onChange={(e) => {
              setNumber(e.target.value)
              clearError('number')
            }}
            placeholder="예: 1"
            inputMode="numeric"
            aria-invalid={!!errors.number}
          />
          {errors.number && <p className="field-error">{errors.number}</p>}
        </div>
        <div className="sm:col-span-3">
          <label htmlFor="field-title" className="field-label">
            제목 <span className="text-rose-500">*</span>
          </label>
          <input
            id="field-title"
            className={inputCls('title')}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              clearError('title')
            }}
            placeholder="문제 제목 (예: Two Sum)"
            aria-invalid={!!errors.title}
          />
          {errors.title && <p className="field-error">{errors.title}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="field-url" className="field-label">
          URL
        </label>
        <input
          id="field-url"
          className={inputCls('url')}
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            clearError('url')
          }}
          placeholder="https://leetcode.com/problems/two-sum/"
          aria-invalid={!!errors.url}
        />
        {errors.url && <p className="field-error">{errors.url}</p>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label htmlFor="field-difficulty" className="field-label">
            난이도
          </label>
          <select
            id="field-difficulty"
            className="input"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {DIFFICULTY_LABELS[d]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="field-status" className="field-label">
            상태
          </label>
          <select
            id="field-status"
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="field-language" className="field-label">
            언어
          </label>
          <input
            id="field-language"
            className="input"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="python"
          />
        </div>
        <div>
          <label htmlFor="field-perceived" className="field-label">
            체감 난이도 (1~5)
          </label>
          <input
            id="field-perceived"
            className={inputCls('perceived')}
            value={perceived}
            onChange={(e) => {
              setPerceived(e.target.value)
              clearError('perceived')
            }}
            placeholder="예: 3"
            inputMode="numeric"
            aria-invalid={!!errors.perceived}
          />
          {errors.perceived && <p className="field-error">{errors.perceived}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="field-tags" className="field-label">
          태그 (쉼표로 구분)
        </label>
        <input
          id="field-tags"
          className="input"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="array, hash-table"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="field-time" className="field-label">
            시간 복잡도
          </label>
          <input
            id="field-time"
            className="input"
            value={timeC}
            onChange={(e) => setTimeC(e.target.value)}
            placeholder="O(n)"
          />
        </div>
        <div>
          <label htmlFor="field-space" className="field-label">
            공간 복잡도
          </label>
          <input
            id="field-space"
            className="input"
            value={spaceC}
            onChange={(e) => setSpaceC(e.target.value)}
            placeholder="O(n)"
          />
        </div>
      </div>

      <div>
        <label htmlFor="field-code" className="field-label">
          풀이 코드
        </label>
        <textarea
          id="field-code"
          className="input font-mono"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={8}
          placeholder={'class Solution:\n    def twoSum(self, nums, target):'}
        />
      </div>

      <div>
        <label htmlFor="field-notes" className="field-label">
          메모
        </label>
        <textarea
          id="field-notes"
          className="input"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="접근법, 막혔던 부분, 핵심 아이디어…"
        />
      </div>

      <div className="flex gap-2 justify-end pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost">
            취소
          </button>
        )}
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? '저장 중…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
