// 문제 CRUD + local-first 동기화 훅.
// 읽기는 Dexie useLiveQuery 로 반응형, 쓰기는 Dexie 즉시 반영 후 백그라운드 push.

import { useLiveQuery } from 'dexie-react-hooks'
import { db, pushProblem, deleteRemoteProblem, type LocalProblem } from '../lib/db'
import type { Problem, ProblemInput } from '../types'

const now = () => new Date().toISOString()

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  // 폴백 (구형 환경)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/** 전체 문제 목록 (삭제 대기 제외), updated_at 역순 정렬. */
export function useProblems(): Problem[] | undefined {
  return useLiveQuery(async () => {
    const all = await db.problems.filter((p) => p._deleted !== true).toArray()
    return all.sort((a, b) => b.updated_at.localeCompare(a.updated_at))
  }, [])
}

/** 단일 문제 조회. */
export function useProblem(id: string | undefined): Problem | undefined {
  return useLiveQuery(
    async () => (id ? await db.problems.get(id) : undefined),
    [id],
  )
}

/** 새 문제 생성. 생성된 id 반환. */
export async function createProblem(input: ProblemInput): Promise<string> {
  const ts = now()
  const record: LocalProblem = {
    id: newId(),
    ...input,
    first_solved_at:
      input.status === 'solved' || input.status === 'review' ? ts : null,
    ease_factor: 2.5,
    interval_days: 0,
    repetitions: 0,
    due_date: null,
    last_reviewed_at: null,
    created_at: ts,
    updated_at: ts,
    _synced: false,
    _deleted: false,
  }
  await db.problems.put(record)
  void pushProblem(record)
  return record.id
}

/** 기존 문제 수정. */
export async function updateProblem(
  id: string,
  patch: Partial<ProblemInput>,
): Promise<void> {
  const existing = await db.problems.get(id)
  if (!existing) return

  const becameSolved =
    !existing.first_solved_at &&
    (patch.status === 'solved' || patch.status === 'review')

  const updated: LocalProblem = {
    ...existing,
    ...patch,
    first_solved_at: becameSolved ? now() : existing.first_solved_at,
    updated_at: now(),
    _synced: false,
  }
  await db.problems.put(updated)
  void pushProblem(updated)
}

/** 문제 삭제 (로컬 즉시 + 클라우드 반영). */
export async function deleteProblem(id: string): Promise<void> {
  // 로컬에서는 _deleted 로 마킹 후 삭제 시도 → UI 에서 즉시 사라짐.
  await db.problems.update(id, { _deleted: true, updated_at: now() })
  void deleteRemoteProblem(id)
}
