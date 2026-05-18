import { useState, useEffect, useCallback, useRef } from 'react'
import type { WeatherData, UnitType } from '../types'

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '23b6d102b049f8bd45b89327abfa9d24'

async function fetchWeatherUrl(url: string): Promise<WeatherData | null> {
  try {
    const res = await fetch(url)
    const data = await res.json()
    if (data.cod === 200) {
      return {
        city: data.name as string,
        temp: Math.round(data.main.temp as number),
        desc: data.weather[0].description as string,
        iconCode: data.weather[0].id as number,
      }
    }
  } catch {
    // network error
  }
  return null
}

export function useWeather(units: UnitType, manualLocation: string) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [statusText, setStatusText] = useState('Detecting...')
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  const latestUnits = useRef(units)
  const latestLocation = useRef(manualLocation)
  latestUnits.current = units
  latestLocation.current = manualLocation

  useEffect(() => {
    const u = latestUnits.current
    const loc = latestLocation.current

    const go = async (url: string) => {
      const data = await fetchWeatherUrl(url)
      if (data) {
        setWeather(data)
        setStatusText(`Weather for ${data.city}`)
      }
    }

    if (loc) {
      go(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(loc)}&units=${u}&appid=${API_KEY}`)
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) =>
          go(
            `https://api.openweathermap.org/data/2.5/weather?lat=${p.coords.latitude}&lon=${p.coords.longitude}&units=${u}&appid=${API_KEY}`,
          ),
        () =>
          go(
            `https://api.openweathermap.org/data/2.5/weather?lat=49.1951&lon=16.6068&units=${u}&appid=${API_KEY}`,
          ),
        { enableHighAccuracy: true, timeout: 5000 },
      )
    }
  }, [units, manualLocation, refreshKey])

  return { weather, statusText, refresh }
}
