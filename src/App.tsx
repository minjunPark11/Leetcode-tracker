import { useEffect, useState } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { syncAll } from './lib/db'
import { isSupabaseConfigured } from './lib/supabase'
import { Toaster } from './components/Toast'
import ProblemSidebar from './components/ProblemSidebar'
import { BookIcon, GridIcon, TargetIcon } from './components/icons'
import Dashboard from './pages/Dashboard'
import Problems from './pages/Problems'
import ProblemDetail from './pages/ProblemDetail'

const RAIL = [
  { to: '/', label: '대시보드', Icon: GridIcon, match: (p: string) => p === '/' },
  {
    to: '/problems',
    label: '문제',
    Icon: TargetIcon,
    match: (p: string) => p.startsWith('/problems'),
  },
]

function RailIcon({
  to,
  label,
  active,
  children,
}: {
  to: string
  label: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      title={label}
      aria-label={label}
      className={`grid place-items-center w-11 h-11 rounded-2xl transition ${
        active
          ? 'bg-white/15 text-white shadow-lg'
          : 'text-slate-500 hover:text-white hover:bg-white/10'
      }`}
    >
      {children}
    </Link>
  )
}

export default function App() {
  const [synced, setSynced] = useState(false)
  const location = useLocation()
  const showFilterPanel = location.pathname.startsWith('/problems')

  // 앱 시작 시 1회 동기화 (push dirty → pull remote).
  useEffect(() => {
    syncAll().finally(() => setSynced(true))
  }, [])

  const syncColor = !isSupabaseConfigured
    ? 'bg-slate-500'
    : synced
      ? 'bg-emerald-400'
      : 'bg-amber-400 animate-pulse'

  return (
    <div className="min-h-screen flex">
      {/* 다크 아이콘 레일 */}
      <aside className="shrink-0 p-3 h-screen sticky top-0">
        <div className="bg-slate-900 rounded-[26px] h-full w-[68px] flex flex-col items-center py-4">
          <span className="grid place-items-center w-11 h-11 rounded-2xl text-white bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30">
            <BookIcon width={22} height={22} />
          </span>
          <nav className="mt-6 flex flex-col gap-2">
            {RAIL.map(({ to, label, Icon, match }) => (
              <RailIcon key={to} to={to} label={label} active={match(location.pathname)}>
                <Icon width={20} height={20} />
              </RailIcon>
            ))}
          </nav>
          <div
            className="mt-auto w-2.5 h-2.5 rounded-full"
            title={isSupabaseConfigured ? (synced ? '동기화됨' : '동기화 중') : '로컬 전용'}
          >
            <span className={`block w-2.5 h-2.5 rounded-full ${syncColor}`} />
          </div>
        </div>
      </aside>

      {/* 필터 패널 (문제 화면에서만) */}
      {showFilterPanel && (
        <aside className="shrink-0 w-72 py-3 h-screen sticky top-0">
          <ProblemSidebar />
        </aside>
      )}

      {/* 콘텐츠 */}
      <main className="flex-1 min-w-0 px-6 py-6">
        <div className="max-w-5xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/problems/:id" element={<ProblemDetail />} />
          </Routes>
        </div>
      </main>

      <Toaster />
    </div>
  )
}
