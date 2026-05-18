import { useState } from 'react'
import type { Shortcut } from '../types'
import { iconLibrary } from '../data/icons'

interface Props {
  shortcuts: Shortcut[]
  onAdd: () => void
  onEdit: (index: number) => void
  onDelete: (index: number) => void
}

export default function ShortcutsBar({ shortcuts, onAdd, onEdit, onDelete }: Props) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  return (
    <div
      className="fixed bottom-[3vh] left-1/2 -translate-x-1/2 flex items-center justify-center gap-3
        px-3.5 py-2.5 rounded-[60px] z-10
        bg-[rgba(20,20,22,0.6)] border border-white/10
        backdrop-blur-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
    >
      {shortcuts.map((shortcut, i) => (
        <div
          key={`${shortcut.url}-${i}`}
          className="relative"
          onMouseEnter={() => setHoverIndex(i)}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Action popup */}
          {hoverIndex === i && (
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex gap-1 p-1
                rounded-xl bg-[rgba(30,30,35,0.95)] border border-white/10
                backdrop-blur-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.3)] z-20"
            >
              <button
                title="Edit"
                onClick={(e) => { e.stopPropagation(); onEdit(i) }}
                className="w-7 h-7 rounded-lg bg-transparent flex items-center justify-center
                  text-white/50 hover:bg-indigo-500/20 hover:text-indigo-400 transition-all"
              >
                <svg viewBox="0 0 24 24" width="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                </svg>
              </button>
              <button
                title="Delete"
                onClick={(e) => { e.stopPropagation(); onDelete(i) }}
                className="w-7 h-7 rounded-lg bg-transparent flex items-center justify-center
                  text-white/50 hover:bg-red-500/20 hover:text-red-400 transition-all"
              >
                <svg viewBox="0 0 24 24" width="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          )}

          {/* Shortcut button */}
          <button
            title={shortcut.name}
            onClick={() => { window.location.href = shortcut.url }}
            className="w-12 h-12 flex items-center justify-center rounded-full
              bg-white/5 border border-transparent text-white
              transition-all hover:bg-white/15 hover:-translate-y-1 hover:border-white/20
              [&_svg]:w-6 [&_svg]:h-6"
          >
            {iconLibrary[shortcut.icon] ?? iconLibrary.web}
          </button>
        </div>
      ))}

      {/* Add button */}
      <button
        onClick={onAdd}
        className="w-12 h-12 flex items-center justify-center rounded-full
          bg-transparent border border-dashed border-white/30 text-white/50
          text-[1.8rem] leading-none
          transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-indigo-500/10"
      >
        +
      </button>
    </div>
  )
}
