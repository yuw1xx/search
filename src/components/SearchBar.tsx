import { useState, useRef, useCallback, useEffect } from 'react'
import type { SearchEngine } from '../types'
import { searchEngines } from '../data/engines'

interface Props {
  engineName: string
  engineUrl: string
  onEngineChange: (engine: SearchEngine) => void
  showToast: (msg: string) => void
}

function isUrl(text: string) {
  return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i.test(text)
}

function saveHistory(query: string) {
  const history: string[] = JSON.parse(localStorage.getItem('searchHistory') || '[]')
  const next = [query, ...history.filter((h) => h !== query)].slice(0, 5)
  localStorage.setItem('searchHistory', JSON.stringify(next))
}

type SuggestionItem =
  | { kind: 'history'; text: string }
  | { kind: 'suggest'; text: string }

export default function SearchBar({ engineName, engineUrl, onEngineChange, showToast }: Props) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [showSuggest, setShowSuggest] = useState(false)
  const [engineOpen, setEngineOpen] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const getHistory = (): string[] =>
    JSON.parse(localStorage.getItem('searchHistory') || '[]')

  const showHistory = useCallback(() => {
    const h = getHistory()
    if (h.length > 0) {
      setSuggestions(h.map((text) => ({ kind: 'history', text })))
      setShowSuggest(true)
    }
  }, [])

  const fetchSuggestions = useCallback((term: string) => {
    const cbName = `__gs_${Date.now()}`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any)[cbName] = (data: [string, string[]]) => {
      const list = data?.[1] ?? []
      setSuggestions(list.slice(0, 6).map((text) => ({ kind: 'suggest', text })))
      setShowSuggest(list.length > 0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any)[cbName]
    }
    const old = document.getElementById('jsonp-sg')
    old?.remove()
    const s = document.createElement('script')
    s.id = 'jsonp-sg'
    s.src = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(term)}&callback=${cbName}`
    document.body.appendChild(s)
  }, [])

  const handleInput = (value: string) => {
    setQuery(value)
    clearTimeout(debounceRef.current)
    if (!value.trim()) {
      showHistory()
      return
    }
    if (value.length < 2) {
      setShowSuggest(false)
      return
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 150)
  }

  const executeSearch = useCallback(
    (q: string) => {
      if (!q.trim()) return
      saveHistory(q)
      if (isUrl(q)) {
        window.location.href = /^https?:\/\//i.test(q) ? q : `https://${q}`
      } else {
        window.location.href = engineUrl + encodeURIComponent(q)
      }
    },
    [engineUrl],
  )

  const deleteHistoryItem = (term: string) => {
    const h = getHistory().filter((t) => t !== term)
    localStorage.setItem('searchHistory', JSON.stringify(h))
    setSuggestions((s) => s.filter((i) => i.text !== term))
    if (h.length === 0) setShowSuggest(false)
  }

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.search-container-inner')) {
        setShowSuggest(false)
        setEngineOpen(false)
      }
    }
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [])


  return (
    <div className="search-container-inner w-full max-w-[480px] z-10 text-center">
      {/* Engine selector */}
      <div className="relative mb-4 inline-block z-[1001]">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setEngineOpen((o) => !o)
          }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[0.75rem] uppercase tracking-[2px]
            bg-black/45 backdrop-blur-[15px] backdrop-saturate-[160%]
            border border-white/15 text-white/50
            transition-all hover:border-white/30 hover:-translate-y-0.5 hover:text-white"
        >
          {engineName}
        </button>

        {engineOpen && (
          <div
            className="absolute top-[130%] left-1/2 -translate-x-1/2
              w-[200px] rounded-[24px] p-3
              bg-black/45 backdrop-blur-[20px]
              border border-white/10 z-[9997]"
          >
            {searchEngines.map((eng) => (
              <button
                key={eng.name}
                onClick={() => {
                  onEngineChange(eng)
                  setEngineOpen(false)
                }}
                className="w-full text-left px-4 py-2.5 rounded-full text-white font-medium text-sm
                  hover:bg-white/12 transition-all"
              >
                {eng.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search box */}
      <form
        className="relative flex items-center gap-4 px-5 py-3 rounded-[20px]
          bg-black/45 backdrop-blur-[15px] backdrop-saturate-[160%]
          border border-white/15
          shadow-[0_20px_50px_rgba(0,0,0,0.3)]
          transition-all duration-300 focus-within:border-white/30 focus-within:scale-[1.02]"
        onSubmit={(e) => {
          e.preventDefault()
          executeSearch(query)
        }}
      >
        {/* Status dot */}
        <div
          className="w-2 h-2 rounded-full bg-[#34d399] shadow-[0_0_10px_#34d399] shrink-0"
          style={{ animation: 'pulse 2s infinite' }}
        />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => {
            if (!query) showHistory()
          }}
          placeholder="Search the web..."
          autoComplete="off"
          className="flex-1 bg-transparent border-none outline-none text-[1.1rem]
            text-white placeholder-white/50"
        />

        {/* Suggestions dropdown */}
        {showSuggest && suggestions.length > 0 && (
          <div
            className="absolute top-full left-[-1px] right-[-1px] mt-2 z-[9999]
              rounded-[20px] overflow-hidden
              bg-black/45 backdrop-blur-[15px] backdrop-saturate-[160%]
              border border-white/15
              shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
          >
            {suggestions.map((item, i) => (
              <div
                key={`${item.kind}-${item.text}-${i}`}
                className="flex items-center justify-between px-10 py-3 text-white text-left
                  border-b border-white/5 last:border-0
                  hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => {
                  setQuery(item.text)
                  setShowSuggest(false)
                  executeSearch(item.text)
                }}
              >
                <span className="flex items-center gap-3">
                  {item.kind === 'history' && (
                    <span className="text-white/40 text-xs">🕒</span>
                  )}
                  {item.text}
                </span>
                {item.kind === 'history' && (
                  <button
                    className="opacity-0 hover:opacity-100 px-2 py-1 text-white/40
                      hover:text-red-400 hover:scale-110 transition-all text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteHistoryItem(item.text)
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  )
}

