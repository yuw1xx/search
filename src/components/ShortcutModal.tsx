import { useState, useEffect } from 'react'
import type { Shortcut, IconKey } from '../types'
import { iconLibrary } from '../data/icons'

interface Props {
  open: boolean
  editIndex: number | null
  shortcuts: Shortcut[]
  onSave: (shortcut: Shortcut, index: number | null) => void
  onDelete: (index: number) => void
  onClose: () => void
}

export default function ShortcutModal({ open, editIndex, shortcuts, onSave, onDelete, onClose }: Props) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [icon, setIcon] = useState<IconKey>('web')

  useEffect(() => {
    if (!open) return
    if (editIndex !== null && shortcuts[editIndex]) {
      const s = shortcuts[editIndex]
      setName(s.name)
      setUrl(s.url)
      setIcon(s.icon)
    } else {
      setName('')
      setUrl('')
      setIcon('web')
    }
  }, [open, editIndex])

  if (!open) return null

  const handleSave = () => {
    if (!name.trim() || !url.trim()) return
    const finalUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`
    onSave({ name: name.trim(), url: finalUrl, icon }, editIndex)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[5px] flex items-center justify-center z-[2000]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-[#1a1a1e] p-8 rounded-[24px] border border-white/10 w-[360px]
        shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col items-center">
        <h3 className="text-white font-semibold text-lg mb-6 w-full text-center">
          Manage Shortcut
        </h3>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (e.g. GitHub)"
          className="w-[90%] bg-black/20 px-3 py-3 mb-3 rounded-xl border border-white/10
            text-white placeholder-white/30 outline-none focus:border-[var(--accent)]
            transition-colors"
        />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL (https://...)"
          className="w-[90%] bg-black/20 px-3 py-3 mb-4 rounded-xl border border-white/10
            text-white placeholder-white/30 outline-none focus:border-[var(--accent)]
            transition-colors"
        />

        <span className="block w-full text-center text-[0.9rem] text-[var(--text-dim)] mb-3">
          Select Icon
        </span>
        <div className="grid grid-cols-4 gap-3 max-h-[150px] overflow-y-auto p-0.5 w-full mb-5">
          {(Object.entries(iconLibrary) as [IconKey, React.ReactElement][]).map(([key, svg]) => (
            <button
              key={key}
              onClick={() => setIcon(key)}
              className={`p-2 rounded-[10px] flex items-center justify-center transition-all
                [&_svg]:w-6 [&_svg]:h-6
                ${icon === key
                  ? 'border border-[var(--accent)] bg-indigo-500/15 text-[var(--accent)]'
                  : 'border border-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                }`}
            >
              {svg}
            </button>
          ))}
        </div>

        <div className="w-full flex items-center gap-2 mt-2">
          {editIndex !== null && (
            <button
              onClick={() => { onDelete(editIndex); onClose() }}
              className="px-4 py-2.5 rounded-xl border border-red-500/40 bg-red-500/15
                text-red-400 font-semibold text-sm hover:bg-red-500/30 transition-all"
            >
              Delete
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5
              text-white font-semibold text-sm hover:bg-white/15 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2.5 rounded-xl bg-[var(--accent)] border-[var(--accent)]
              text-white font-semibold text-sm hover:bg-indigo-500 transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
