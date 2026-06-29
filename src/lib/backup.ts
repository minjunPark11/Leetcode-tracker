// JSON 백업: 내보내기 / 불러오기.
// 로컬(Dexie) 데이터를 단일 JSON 파일로 내보내고, 같은 형식을 불러와 복원한다.
// 불러오기 후에는 syncAll() 로 클라우드에도 반영할 수 있다.

import { db, type LocalProblem, type LocalReviewLog } from './db'
import type { Problem, ReviewLog } from '../types'

export interface BackupFile {
  version: number
  exported_at: string
  problems: Problem[]
  review_logs: ReviewLog[]
}

const stripMeta = <T extends object>(obj: T): T => {
  const { _synced, _deleted, ...rest } = obj as Record<string, unknown>
  void _synced
  void _deleted
  return rest as T
}

/** 현재 로컬 데이터를 JSON 파일로 내려받는다. */
export async function exportBackup(): Promise<void> {
  const problems = (await db.problems.filter((p) => p._deleted !== true).toArray())
    .map(stripMeta) as Problem[]
  const review_logs = (await db.review_logs.toArray()).map(stripMeta) as ReviewLog[]

  const payload: BackupFile = {
    version: 1,
    exported_at: new Date().toISOString(),
    problems,
    review_logs,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `leetcode-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * JSON 파일을 읽어 로컬에 병합한다 (updated_at 최신 우선).
 * 불러온 레코드는 _synced=false 로 표시되어 다음 동기화 때 업로드된다.
 * @returns 가져온 문제 수
 */
export async function importBackup(file: File): Promise<number> {
  const text = await file.text()
  const parsed = JSON.parse(text) as BackupFile

  if (!parsed || !Array.isArray(parsed.problems)) {
    throw new Error('올바른 백업 파일이 아닙니다.')
  }

  let imported = 0
  for (const p of parsed.problems) {
    const existing = await db.problems.get(p.id)
    if (existing && existing.updated_at >= p.updated_at) continue
    const record: LocalProblem = { ...p, _synced: false, _deleted: false }
    await db.problems.put(record)
    imported++
  }

  for (const log of parsed.review_logs ?? []) {
    const record: LocalReviewLog = { ...log, _synced: false }
    await db.review_logs.put(record)
  }

  return imported
}
