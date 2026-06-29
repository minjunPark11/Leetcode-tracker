// 가벼운 토스트 알림. 모듈 스토어 + <Toaster/> 로 구성하며,
// 어디서든 toast.success(...) / toast.error(...) 로 호출한다.
import { useEffect, useState } from 'react'
import { CheckIcon, CloseIcon } from './icons'

type ToastKind = 'success' | 'error' | 'info'
interface ToastItem {
  id: number
  kind: ToastKind
  message: string
}

let counter = 0
let listeners: Array<(items: ToastItem[]) => void> = []
let items: ToastItem[] = []

function emit() {
  listeners.forEach((l) => l([...items]))
}

function push(kind: ToastKind, message: string) {
  const id = ++counter
  items = [...items, { id, kind, message }]
  emit()
  setTimeout(() => {
    items = items.filter((t) => t.id !== id)
    emit()
  }, 3200)
}

export const toast = {
  success: (m: string) => push('success', m),
  error: (m: string) => push('error', m),
  info: (m: string) => push('info', m),
}

const STYLES: Record<ToastKind, string> = {
  success: 'border-emerald-200 text-emerald-800',
  error: 'border-rose-200 text-rose-800',
  info: 'border-indigo-200 text-indigo-800',
}
const DOT: Record<ToastKind, string> = {
  success: 'bg-emerald-500',
  error: 'bg-rose-500',
  info: 'bg-indigo-500',
}

export function Toaster() {
  const [list, setList] = useState<ToastItem[]>([])

  useEffect(() => {
    listeners.push(setList)
    return () => {
      listeners = listeners.filter((l) => l !== setList)
    }
  }, [])

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-[min(92vw,340px)]">
      {list.map((t) => (
        <div
          key={t.id}
          className={`card border ${STYLES[t.kind]} flex items-center gap-3 px-4 py-3 animate-fade-up`}
        >
          <span
            className={`shrink-0 grid place-items-center w-6 h-6 rounded-full text-white ${DOT[t.kind]}`}
          >
            {t.kind === 'success' ? (
              <CheckIcon width={14} height={14} strokeWidth={3} />
            ) : (
              <CloseIcon width={14} height={14} strokeWidth={3} />
            )}
          </span>
          <span className="text-sm font-medium text-slate-700">{t.message}</span>
        </div>
      ))}
    </div>
  )
}
