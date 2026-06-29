import { useEffect, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { syncAll } from './lib/db'
import { isSupabaseConfigured } from './lib/supabase'
import { Toaster } from './components/Toast'
import { BookIcon, GridIcon, ListIcon } from './components/icons'
import Dashboard from './pages/Dashboard'
import Problems from './pages/Problems'
import ProblemDetail from './pages/ProblemDetail'

const NAV = [
  { to: '/', label: '대시보드', Icon: GridIcon, end: true },
  { to: '/problems', label: '문제', Icon: ListIcon, end: false },
]

function SyncBadge({ synced }: { synced: boolean }) {
  return (
    <div className="chip gap-1.5">
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          !isSupabaseConfigured
            ? 'bg-slate-400'
            : synced
              ? 'bg-emerald-500'
              : 'bg-amber-400 animate-pulse'
        }`}
      />
      {isSupabaseConfigured ? (synced ? '동기화됨' : '동기화 중') : '로컬 전용'}
    </div>
  )
}

export default function App() {
  const [synced, setSynced] = useState(false)

  // 앱 시작 시 1회 동기화 (push dirty → pull remote).
  useEffect(() => {
    syncAll().finally(() => setSynced(true))
  }, [])

  return (
    <div className="min-h-screen flex">
      {/* 사이드바 */}
      <aside className="flex flex-col w-64 shrink-0 h-screen sticky top-0 p-4">
        <div className="card h-full flex flex-col p-4">
          <div className="flex items-center gap-2.5 px-2 py-3">
            <span className="grid place-items-center w-10 h-10 rounded-xl text-white bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-lg shadow-violet-400/30">
              <BookIcon width={22} height={22} />
            </span>
            <div className="leading-tight">
              <div className="font-bold gradient-text">LeetCode</div>
              <div className="text-xs text-slate-400 font-medium">트래커</div>
            </div>
          </div>

          <nav className="mt-4 flex flex-col gap-1">
            {NAV.map(({ to, label, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg shadow-violet-400/30'
                      : 'text-slate-500 hover:bg-white/70 hover:text-slate-800'
                  }`
                }
              >
                <Icon width={18} height={18} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto px-1">
            <SyncBadge synced={synced} />
          </div>
        </div>
      </aside>

      {/* 콘텐츠 */}
      <main className="flex-1 min-w-0 px-4 py-6 lg:px-8">
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
