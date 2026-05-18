import { useState, useEffect } from 'react'
import type { ToastState } from '../types'

interface Props {
  toast: ToastState | null
}

export default function Toast({ toast }: Props) {
  const [visible, setVisible] = useState(false)
  const [displayed, setDisplayed] = useState<ToastState | null>(null)

  useEffect(() => {
    if (!toast) return
    setDisplayed(toast)
    setVisible(false)

    const show = requestAnimationFrame(() => setVisible(true))
    const hide = setTimeout(() => {
      setVisible(false)
      setTimeout(() => setDisplayed(null), 300)
    }, 3000)

    return () => {
      cancelAnimationFrame(show)
      clearTimeout(hide)
    }
  }, [toast?.id])

  if (!displayed) return null

  return (
    <div
      className={`fixed top-5 left-1/2 z-[10000] px-5 py-2.5 rounded-xl text-sm text-white border border-white/10
        bg-[rgba(20,20,22,0.9)] backdrop-blur-xl pointer-events-none transition-all duration-300
        ${visible ? 'opacity-100 -translate-x-1/2 translate-y-0' : 'opacity-0 -translate-x-1/2 -translate-y-5'}`}
    >
      {displayed.msg}
    </div>
  )
}
