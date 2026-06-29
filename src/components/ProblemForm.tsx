// 문제 생성/수정 폼. 생성과 수정 양쪽에서 재사용.
import { useState } from 'react'
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  STATUS_LABELS,
  STATUSES,
  type Problem,
  type ProblemInput,
} from '../types'

interface Props {
  initial?: Problem
  onSubmit: (input: ProblemInput) => void | Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

const field = 'input'
const label = 'field-label'

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
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label className={label}>번호</label>
          <input
            className={field}
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="예: 1"
            inputMode="numeric"
          />
        </div>
        <div className="sm:col-span-3">
          <label className={label}>제목 *</label>
          <input
            className={field}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Two Sum"
            required
          />
        </div>
      </div>

      <div>
        <label className={label}>URL</label>
        <input
          className={field}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://leetcode.com/problems/two-sum/"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className={label}>난이도</label>
          <select
            className={field}
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
          <label className={label}>상태</label>
          <select
            className={field}
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
          <label className={label}>언어</label>
          <input
            className={field}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="python"
          />
        </div>
        <div>
          <label className={label}>체감 난이도 (1~5)</label>
          <input
            className={field}
            value={perceived}
            onChange={(e) => setPerceived(e.target.value)}
            placeholder="3"
            inputMode="numeric"
          />
        </div>
      </div>

      <div>
        <label className={label}>태그 (쉼표로 구분)</label>
        <input
          className={field}
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="array, hash-table"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>시간 복잡도</label>
          <input
            className={field}
            value={timeC}
            onChange={(e) => setTimeC(e.target.value)}
            placeholder="O(n)"
          />
        </div>
        <div>
          <label className={label}>공간 복잡도</label>
          <input
            className={field}
            value={spaceC}
            onChange={(e) => setSpaceC(e.target.value)}
            placeholder="O(n)"
          />
        </div>
      </div>

      <div>
        <label className={label}>풀이 코드</label>
        <textarea
          className={`${field} font-mono`}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={8}
          placeholder="class Solution:&#10;    def twoSum(self, nums, target):"
        />
      </div>

      <div>
        <label className={label}>메모</label>
        <textarea
          className={field}
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
