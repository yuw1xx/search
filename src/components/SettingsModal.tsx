import { useState, useRef } from 'react'
import type { SettingsTab, ClockType, WallpaperKey, UnitType } from '../types'
import { wallpaperPreviews } from '../data/wallpapers'

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '23b6d102b049f8bd45b89327abfa9d24'

const WALLPAPERS = Object.keys(wallpaperPreviews) as WallpaperKey[]

const FONTS = [
  { label: "Inter (Modern)", value: "'Inter', sans-serif" },
  { label: "Poppins (Geometric)", value: "'Poppins', sans-serif" },
  { label: "JetBrains Mono (Tech)", value: "'JetBrains Mono', monospace" },
  { label: "Playfair (Elegant)", value: "'Playfair Display', serif" },
  { label: "Roboto (Clean)", value: "'Roboto', sans-serif" },
]

interface CitySuggestion {
  name: string
  country: string
}

interface Props {
  open: boolean
  onClose: () => void
  // appearance
  wallpaper: WallpaperKey
  onWallpaperChange: (w: WallpaperKey) => void
  font: string
  onFontChange: (f: string) => void
  clockType: ClockType
  onClockTypeChange: (t: ClockType) => void
  hideClock: boolean
  onHideClockChange: (v: boolean) => void
  // weather
  weatherStatus: string
  weatherUnits: UnitType
  onWeatherUnitsChange: (u: UnitType) => void
  hideWeather: boolean
  onHideWeatherChange: (v: boolean) => void
  manualLocation: string
  onLocationChange: (loc: string) => void
  onRefreshWeather: () => void
  // search
  showToast: (msg: string) => void
}

export default function SettingsModal(props: Props) {
  const {
    open, onClose,
    wallpaper, onWallpaperChange,
    font, onFontChange,
    clockType, onClockTypeChange,
    hideClock, onHideClockChange,
    weatherStatus, weatherUnits, onWeatherUnitsChange,
    hideWeather, onHideWeatherChange,
    manualLocation, onLocationChange, onRefreshWeather,
    showToast,
  } = props

  const [tab, setTab] = useState<SettingsTab>('appearance')
  const [cityInput, setCityInput] = useState(manualLocation)
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([])
  const cityDebounce = useRef<ReturnType<typeof setTimeout>>()

  if (!open) return null

  const handleCityInput = (val: string) => {
    setCityInput(val)
    clearTimeout(cityDebounce.current)
    if (val.length < 3) { setCitySuggestions([]); return }
    cityDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(val)}&limit=5&appid=${API_KEY}`,
        )
        const locs: { name: string; country: string }[] = await res.json()
        const seen = new Set<string>()
        const unique = locs.filter((l) => {
          const k = `${l.name.toLowerCase()},${l.country.toLowerCase()}`
          if (seen.has(k)) return false
          seen.add(k)
          return true
        })
        setCitySuggestions(unique.slice(0, 3))
      } catch { /* ignore */ }
    }, 400)
  }

  const saveLocation = async () => {
    const city = cityInput.trim()
    if (!city) { showToast('Please enter a city name.'); return }
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`,
      )
      const data = await res.json()
      if (data.cod === 200) {
        onLocationChange(city)
        showToast(`Location confirmed: ${data.name as string}`)
        setCitySuggestions([])
      } else {
        showToast('City not found.')
      }
    } catch {
      showToast('Error connecting to weather service.')
    }
  }

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'appearance', label: 'Appearance' },
    { id: 'search', label: 'Search' },
    { id: 'weather', label: 'Weather' },
    { id: 'misc', label: 'Misc' },
  ]

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[5px] flex items-center justify-center z-[2000]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="flex flex-col overflow-hidden rounded-[24px] border border-white/10
          bg-[#1a1a1e] shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
        style={{ width: 520, height: 520 }}
      >
        {/* Tab bar */}
        <nav className="flex justify-around border-b border-white/10 bg-white/[0.03] shrink-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-2.5 py-[18px] text-[0.65rem] font-bold uppercase tracking-[1.2px] transition-all border-b-2
                ${tab === t.id
                  ? 'text-white border-[var(--clock-color)]'
                  : 'text-[var(--text-dim)] border-transparent hover:text-white'
                }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Pane content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">

          {/* ── APPEARANCE ── */}
          {tab === 'appearance' && (
            <div className="pane-enter space-y-6">
              <Section label="Wallpapers">
                <div className="grid grid-cols-5 gap-2 px-2 py-1">
                  {WALLPAPERS.map((w) => (
                    <button
                      key={w}
                      onClick={() => onWallpaperChange(w)}
                      className={`w-8 h-8 rounded-full transition-all hover:scale-110
                        ${wallpaper === w ? 'scale-[1.15] ring-2 ring-white shadow-[0_8px_20px_rgba(0,0,0,0.4)]' : ''}`}
                      style={{ ...parseStyle(wallpaperPreviews[w]) }}
                    />
                  ))}
                </div>
              </Section>

              <Section label="Dashboard Font">
                <select
                  value={font}
                  onChange={(e) => onFontChange(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 rounded-xl
                    outline-none text-sm hover:bg-white/10 transition-all"
                >
                  {FONTS.map((f) => (
                    <option key={f.value} value={f.value} style={{ background: '#1a1a1c' }}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </Section>

              <Section label="Clock Style">
                <div className="flex gap-2.5">
                  <ModalBtn active={clockType === 'analog'} onClick={() => onClockTypeChange('analog')}>Analog</ModalBtn>
                  <ModalBtn active={clockType === 'digital'} onClick={() => onClockTypeChange('digital')}>Digital</ModalBtn>
                </div>
              </Section>

              <Section label="Display Clock">
                <Toggle checked={!hideClock} onChange={(v) => onHideClockChange(!v)} />
              </Section>
            </div>
          )}

          {/* ── SEARCH ── */}
          {tab === 'search' && (
            <div className="pane-enter">
              <Section label="Search History">
                <button
                  onClick={() => {
                    localStorage.removeItem('searchHistory')
                    showToast('History cleared!')
                  }}
                  className="px-4 py-2.5 rounded-xl border border-red-500/40 bg-red-500/15
                    text-red-400 font-semibold text-sm hover:bg-red-500/30 transition-all"
                >
                  Clear All History
                </button>
              </Section>
            </div>
          )}

          {/* ── WEATHER ── */}
          {tab === 'weather' && (
            <div className="pane-enter space-y-6">
              <Section label="Location Services">
                <p className="text-[0.8rem] text-[var(--text-dim)] text-center mb-3">{weatherStatus}</p>
                <div className="relative w-full max-w-[320px] mx-auto flex flex-col gap-2.5">
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => handleCityInput(e.target.value)}
                    placeholder="Enter City (e.g. Brno)"
                    autoComplete="off"
                    className="w-full bg-black/20 px-3 py-3 rounded-xl border border-white/10
                      text-white placeholder-white/30 outline-none focus:border-[var(--accent)]
                      transition-colors box-border"
                  />

                  {/* City autocomplete */}
                  {citySuggestions.length > 0 && (
                    <div className="absolute top-[52px] left-0 right-0 z-10 rounded-xl overflow-hidden
                      bg-[rgba(30,30,35,0.95)] border border-white/10 shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
                      {citySuggestions.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setCityInput(c.name)
                            onLocationChange(c.name)
                            setCitySuggestions([])
                            showToast(`Location set: ${c.name}`)
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-white
                            hover:bg-white/10 transition-all border-b border-white/5 last:border-0"
                        >
                          {c.name}, {c.country}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <ModalBtn primary onClick={saveLocation}>Save</ModalBtn>
                    <ModalBtn onClick={() => { onLocationChange(''); showToast('Requesting GPS access...') }}>GPS</ModalBtn>
                    <ModalBtn onClick={() => { onRefreshWeather(); showToast('Refreshing weather data...') }}>Refresh</ModalBtn>
                  </div>
                </div>
              </Section>

              <Section label="Units">
                <div className="flex gap-2.5">
                  <ModalBtn active={weatherUnits === 'metric'} onClick={() => { onWeatherUnitsChange('metric'); showToast('Units set to Celsius') }}>
                    Celsius (°C)
                  </ModalBtn>
                  <ModalBtn active={weatherUnits === 'imperial'} onClick={() => { onWeatherUnitsChange('imperial'); showToast('Units set to Fahrenheit') }}>
                    Fahrenheit (°F)
                  </ModalBtn>
                </div>
              </Section>

              <Section label="Display Weather">
                <Toggle checked={!hideWeather} onChange={(v) => { onHideWeatherChange(!v); showToast(v ? 'Weather visible' : 'Weather hidden') }} />
              </Section>
            </div>
          )}

          {/* ── MISC ── */}
          {tab === 'misc' && (
            <div className="pane-enter">
              <Section label="Dashboard">
                <p className="text-[0.8rem] text-[var(--text-dim)] text-center mb-3 opacity-50">Version 5.0</p>
                <ModalBtn onClick={() => location.reload()}>Reload App</ModalBtn>
              </Section>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Small helpers ──────────────────────────────────────── */

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="block text-center text-[0.9rem] text-[var(--text-dim)] mb-3">{label}</span>
      <div className="flex flex-col items-center">{children}</div>
    </div>
  )
}

function ModalBtn({
  children, onClick, primary, active,
}: {
  children: React.ReactNode
  onClick?: () => void
  primary?: boolean
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl border font-semibold text-sm transition-all
        ${primary
          ? 'bg-[var(--accent)] border-[var(--accent)] text-white hover:bg-indigo-500'
          : active
            ? 'bg-white/15 border-white/30 text-white'
            : 'bg-white/5 border-white/10 text-white hover:bg-white/15'
        }`}
    >
      {children}
    </button>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex w-[46px] h-6 rounded-full border transition-all duration-300
        ${checked ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-white/10 border-white/10'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300
          ${checked ? 'translate-x-[22px]' : 'translate-x-0'}`}
      />
    </button>
  )
}

function parseStyle(styleStr: string): React.CSSProperties {
  const result: Record<string, string> = {}
  styleStr.split(';').forEach((part) => {
    const [key, ...rest] = part.split(':')
    if (key && rest.length) {
      const camel = key.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
      result[camel] = rest.join(':').trim()
    }
  })
  return result as React.CSSProperties
}
