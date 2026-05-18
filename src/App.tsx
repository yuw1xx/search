import { useCallback, useEffect, useRef } from 'react'
import type { Shortcut, WallpaperKey, ClockType, UnitType, ToastState } from './types'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useWeather } from './hooks/useWeather'
import { brightWallpapers } from './data/wallpapers'

import Toast from './components/Toast'
import Cursor from './components/Cursor'
import Wallpaper from './components/Wallpaper'
import ClockBackground from './components/ClockBackground'
import WeatherWidget from './components/WeatherWidget'
import SearchBar from './components/SearchBar'
import ShortcutsBar from './components/ShortcutsBar'
import ShortcutModal from './components/ShortcutModal'
import SettingsModal from './components/SettingsModal'
import { useState } from 'react'

export default function App() {
  /* ── Persistent settings ───────────────────────────── */
  const [wallpaper, setWallpaper] = useLocalStorage<WallpaperKey>('preferredWallpaper', 'wall-default')
  const [clockType, setClockType] = useLocalStorage<ClockType>('preferredClock', 'analog')
  const [hideClock, setHideClock] = useLocalStorage<boolean>('hideClock', false)
  const [font, setFont] = useLocalStorage<string>('preferredFont', "'Inter', sans-serif")
  const [hideWeather, setHideWeather] = useLocalStorage<boolean>('hideWeather', false)
  const [weatherUnits, setWeatherUnits] = useLocalStorage<UnitType>('preferredUnits', 'metric')
  const [manualLocation, setManualLocation] = useLocalStorage<string>('manualWeatherLocation', '')
  const [engineName, setEngineName] = useLocalStorage<string>('preferredEngineName', 'DuckDuckGo')
  const [engineUrl, setEngineUrl] = useLocalStorage<string>('preferredEngineUrl', 'https://duckduckgo.com/?q=')
  const [shortcuts, setShortcuts] = useLocalStorage<Shortcut[]>('myShortcuts', [])

  /* ── UI state ──────────────────────────────────────── */
  const [toast, setToast] = useState<ToastState | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [shortcutModal, setShortcutModal] = useState<{ open: boolean; editIndex: number | null }>({
    open: false,
    editIndex: null,
  })

  /* ── Weather ───────────────────────────────────────── */
  const { weather, statusText, refresh: refreshWeather } = useWeather(weatherUnits, manualLocation)

  /* ── Toast ─────────────────────────────────────────── */
  const showToast = useCallback((msg: string) => {
    setToast({ msg, id: Date.now() })
  }, [])

  /* ── CSS side-effects ──────────────────────────────── */
  useEffect(() => {
    document.documentElement.style.setProperty('--main-font', font)
  }, [font])

  useEffect(() => {
    document.body.classList.toggle('light-theme', brightWallpapers.includes(wallpaper))
  }, [wallpaper])

  /* ── Shortcut handlers ─────────────────────────────── */
  const handleSaveShortcut = useCallback(
    (shortcut: Shortcut, index: number | null) => {
      setShortcuts((prev) => {
        const next = [...prev]
        if (index !== null) next[index] = shortcut
        else next.push(shortcut)
        return next
      })
      showToast(index !== null ? 'Shortcut updated' : 'Shortcut added')
    },
    [setShortcuts, showToast],
  )

  const handleDeleteShortcut = useCallback(
    (index: number) => {
      setShortcuts((prev) => prev.filter((_, i) => i !== index))
      showToast('Shortcut removed')
    },
    [setShortcuts, showToast],
  )

  /* ── Close modals on Escape ────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSettingsOpen(false)
        setShortcutModal({ open: false, editIndex: null })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <Toast toast={toast} />
      <Cursor />
      <Wallpaper id={wallpaper} />
      <ClockBackground type={clockType} visible={!hideClock} />
      <WeatherWidget weather={weather} units={weatherUnits} visible={!hideWeather} />

      {/* Center search area */}
      <div className="flex flex-col items-center w-full max-w-[480px] px-4 z-10">
        <SearchBar
          engineName={engineName}
          engineUrl={engineUrl}
          onEngineChange={(eng) => {
            setEngineName(eng.name)
            setEngineUrl(eng.url)
          }}
          showToast={showToast}
        />
      </div>

      <ShortcutsBar
        shortcuts={shortcuts}
        onAdd={() => setShortcutModal({ open: true, editIndex: null })}
        onEdit={(i) => setShortcutModal({ open: true, editIndex: i })}
        onDelete={handleDeleteShortcut}
      />

      {/* Settings button */}
      <button
        onClick={() => setSettingsOpen(true)}
        className="fixed bottom-8 right-8 w-[42px] h-[42px] flex items-center justify-center
          rounded-full bg-[rgba(20,20,22,0.6)] border border-white/10 backdrop-blur-[15px]
          text-[var(--text-dim)] transition-all hover:text-white hover:rotate-90 hover:scale-110 z-10"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
        </svg>
      </button>

      <ShortcutModal
        open={shortcutModal.open}
        editIndex={shortcutModal.editIndex}
        shortcuts={shortcuts}
        onSave={handleSaveShortcut}
        onDelete={handleDeleteShortcut}
        onClose={() => setShortcutModal({ open: false, editIndex: null })}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        wallpaper={wallpaper}
        onWallpaperChange={(w) => { setWallpaper(w); showToast('Wallpaper updated') }}
        font={font}
        onFontChange={(f) => { setFont(f); showToast('Font updated') }}
        clockType={clockType}
        onClockTypeChange={(t) => { setClockType(t); showToast(`Clock: ${t}`) }}
        hideClock={hideClock}
        onHideClockChange={(v) => { setHideClock(v); showToast(v ? 'Clock hidden' : 'Clock visible') }}
        weatherStatus={statusText}
        weatherUnits={weatherUnits}
        onWeatherUnitsChange={setWeatherUnits}
        hideWeather={hideWeather}
        onHideWeatherChange={setHideWeather}
        manualLocation={manualLocation}
        onLocationChange={setManualLocation}
        onRefreshWeather={refreshWeather}
        showToast={showToast}
      />
    </>
  )
}
