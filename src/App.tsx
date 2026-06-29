import { useEffect, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { syncAll } from './lib/db'
import { isSupabaseConfigured } from './lib/supabase'
import Dashboard from './pages/Dashboard'
import Problems from './pages/Problems'
import ProblemDetail from './pages/ProblemDetail'

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? 'bg-slate-900 text-white'
            : 'text-slate-600 hover:bg-slate-200'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

export default function App() {
  const [synced, setSynced] = useState(false)

  // 앱 시작 시 1회 동기화 (push dirty → pull remote).
  useEffect(() => {
    syncAll().finally(() => setSynced(true))
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-2">
          <span className="font-bold text-lg mr-4">📘 LeetCode 트래커</span>
          <nav className="flex gap-1">
            <NavItem to="/" label="대시보드" />
            <NavItem to="/problems" label="문제" />
          </nav>
          <div className="ml-auto text-xs text-slate-400">
            {isSupabaseConfigured
              ? synced
                ? '☁️ 동기화됨'
                : '동기화 중…'
              : '💾 로컬 전용'}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/problems/:id" element={<ProblemDetail />} />
        </Routes>
      </main>
    </div>
  )
}
