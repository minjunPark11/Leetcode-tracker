// Supabase 클라이언트 초기화 + 단일 계정 자동 로그인.
//
// 로그인 UI 없이 개인용으로 쓰기 위해, .env 에 넣은 단일 계정 자격증명으로
// 앱 시작 시 자동 로그인한다. RLS(auth.uid() = user_id) 는 그대로 유지되어
// 본인 데이터만 접근/동기화된다.
//
// .env 값이 비어 있으면 Supabase 없이 로컬(Dexie)만으로 동작한다.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const appEmail = import.meta.env.VITE_APP_USER_EMAIL as string | undefined
const appPassword = import.meta.env.VITE_APP_USER_PASSWORD as string | undefined

/** Supabase 연동이 설정되어 있는지 여부. */
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null

let signInPromise: Promise<string | null> | null = null

/**
 * 자동 로그인을 보장하고 현재 user_id 를 반환한다.
 * - Supabase 미설정 또는 자격증명 없음 → null (로컬 전용 모드)
 * - 이미 세션 존재 → 해당 user id
 * - 세션 없음 → 단일 계정으로 signInWithPassword 후 user id
 */
export async function ensureSignedIn(): Promise<string | null> {
  if (!supabase) return null
  if (signInPromise) return signInPromise

  signInPromise = (async () => {
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData.session?.user) return sessionData.session.user.id

    if (!appEmail || !appPassword) {
      console.warn(
        '[supabase] VITE_APP_USER_EMAIL/PASSWORD 가 비어 있어 클라우드 동기화를 건너뜁니다 (로컬 전용 모드).',
      )
      return null
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: appEmail,
      password: appPassword,
    })
    if (error) {
      console.error('[supabase] 자동 로그인 실패:', error.message)
      return null
    }
    return data.user?.id ?? null
  })()

  return signInPromise
}
