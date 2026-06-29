// Dexie(IndexedDB) 로컬 스키마 + 로컬↔클라우드 동기화 계층.
//
// 동기화 패턴 (local-first):
//   1. 입력/수정 시 Dexie 에 즉시 저장 (_synced=false) → UI 즉시 반영
//   2. 백그라운드로 Supabase 에 upsert → 성공 시 _synced=true
//   3. 앱 시작 시 dirty 레코드 push 후 Supabase 에서 최신 데이터 pull
//   4. 충돌은 updated_at 최신 우선(last-write-wins)으로 단순 처리

import Dexie, { type Table } from 'dexie'
import type { Problem, ReviewLog } from '../types'
import { supabase, ensureSignedIn } from './supabase'

// Dexie 에 저장되는 레코드는 도메인 타입 + 로컬 동기화 메타데이터.
export interface LocalProblem extends Problem {
  _synced?: boolean
  _deleted?: boolean
}
export interface LocalReviewLog extends ReviewLog {
  _synced?: boolean
}

class TrackerDB extends Dexie {
  problems!: Table<LocalProblem, string>
  review_logs!: Table<LocalReviewLog, string>

  constructor() {
    super('leetcode-tracker')
    this.version(1).stores({
      problems: 'id, status, difficulty, updated_at, due_date, _synced, _deleted',
      review_logs: 'id, problem_id, reviewed_at, _synced',
    })
  }
}

export const db = new TrackerDB()

const PROBLEM_COLUMNS = [
  'id', 'user_id', 'number', 'title', 'url', 'difficulty', 'tags', 'status',
  'code', 'language', 'notes', 'time_complexity', 'space_complexity',
  'perceived_difficulty', 'first_solved_at', 'ease_factor', 'interval_days',
  'repetitions', 'due_date', 'last_reviewed_at', 'created_at', 'updated_at',
] as const

// 로컬 메타데이터(_synced/_deleted)를 제거하고 순수 Problem 행으로 변환.
function toRow(p: LocalProblem): Problem {
  const row = {} as Record<string, unknown>
  const src = p as unknown as Record<string, unknown>
  for (const key of PROBLEM_COLUMNS) row[key] = src[key]
  return row as unknown as Problem
}

function fromRow(row: Problem): LocalProblem {
  return { ...row, _synced: true, _deleted: false }
}

// ---------------------------------------------------------------------------
// 푸시: 아직 동기화되지 않은(dirty) 로컬 변경분을 Supabase 로 올린다.
// ---------------------------------------------------------------------------
async function pushDirty(userId: string): Promise<void> {
  if (!supabase) return

  // 삭제 대기 레코드 처리
  const deleted = await db.problems.filter((p) => p._deleted === true).toArray()
  for (const p of deleted) {
    const { error } = await supabase.from('problems').delete().eq('id', p.id)
    if (!error) await db.problems.delete(p.id)
  }

  // 업서트 대기 레코드 처리
  const dirty = await db.problems
    .filter((p) => p._synced !== true && p._deleted !== true)
    .toArray()
  if (dirty.length > 0) {
    const rows = dirty.map((p) => ({ ...toRow(p), user_id: userId }))
    const { error } = await supabase.from('problems').upsert(rows)
    if (!error) {
      await db.problems.bulkPut(dirty.map((p) => ({ ...p, _synced: true })))
    } else {
      console.error('[sync] problems 업서트 실패:', error.message)
    }
  }

  // review_logs (3단계에서 사용, 구조만 준비)
  const dirtyLogs = await db.review_logs
    .filter((l) => l._synced !== true)
    .toArray()
  if (dirtyLogs.length > 0) {
    const rows = dirtyLogs.map(({ _synced, ...l }) => ({ ...l, user_id: userId }))
    const { error } = await supabase.from('review_logs').upsert(rows)
    if (!error) {
      await db.review_logs.bulkPut(dirtyLogs.map((l) => ({ ...l, _synced: true })))
    }
  }
}

// ---------------------------------------------------------------------------
// 풀: Supabase 의 최신 데이터를 받아 로컬에 머지 (updated_at 최신 우선).
// ---------------------------------------------------------------------------
async function pullRemote(userId: string): Promise<void> {
  if (!supabase) return

  const { data, error } = await supabase
    .from('problems')
    .select('*')
    .eq('user_id', userId)
  if (error) {
    console.error('[sync] problems 조회 실패:', error.message)
    return
  }

  for (const remote of (data ?? []) as Problem[]) {
    const local = await db.problems.get(remote.id)
    // 로컬이 더 최신(미동기화 변경)이면 덮어쓰지 않는다.
    if (local && local._synced !== true && local.updated_at >= remote.updated_at) {
      continue
    }
    await db.problems.put(fromRow(remote))
  }

  const { data: logs } = await supabase
    .from('review_logs')
    .select('*')
    .eq('user_id', userId)
  for (const log of (logs ?? []) as ReviewLog[]) {
    await db.review_logs.put({ ...log, _synced: true })
  }
}

let syncing = false

/** 전체 동기화 사이클: 로그인 보장 → dirty push → remote pull. */
export async function syncAll(): Promise<void> {
  if (!supabase || syncing) return
  syncing = true
  try {
    const userId = await ensureSignedIn()
    if (!userId) return
    await pushDirty(userId)
    await pullRemote(userId)
  } catch (e) {
    console.error('[sync] 동기화 중 오류:', e)
  } finally {
    syncing = false
  }
}

/** 단일 문제를 백그라운드로 Supabase 에 upsert (UI 블로킹 없음). */
export async function pushProblem(p: LocalProblem): Promise<void> {
  if (!supabase) return
  try {
    const userId = await ensureSignedIn()
    if (!userId) return
    const { error } = await supabase
      .from('problems')
      .upsert({ ...toRow(p), user_id: userId })
    if (!error) await db.problems.update(p.id, { _synced: true })
  } catch (e) {
    console.error('[sync] pushProblem 실패:', e)
  }
}

/** 단일 문제 삭제를 백그라운드로 Supabase 에 반영. */
export async function deleteRemoteProblem(id: string): Promise<void> {
  if (!supabase) return
  try {
    const userId = await ensureSignedIn()
    if (!userId) return
    const { error } = await supabase.from('problems').delete().eq('id', id)
    if (!error) await db.problems.delete(id)
  } catch (e) {
    console.error('[sync] deleteRemoteProblem 실패:', e)
  }
}
