import { useState, useEffect } from 'react'
import type { WallpaperKey } from '../types'
import { wallpaperLibrary } from '../data/wallpapers'

interface Props {
  id: WallpaperKey
}

export default function Wallpaper({ id }: Props) {
  const [current, setCurrent] = useState<WallpaperKey>(id)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (id === current) return
    setFading(true)
    const t = setTimeout(() => {
      setCurrent(id)
      setFading(false)
    }, 400)
    return () => clearTimeout(t)
  }, [id])

  return (
    <div
      className={`fixed inset-0 -z-20 pointer-events-none transition-opacity duration-[400ms] ${fading ? 'opacity-0' : 'opacity-100'}`}
      dangerouslySetInnerHTML={{ __html: wallpaperLibrary[current] }}
    />
  )
}
