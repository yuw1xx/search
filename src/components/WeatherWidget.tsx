import type { WeatherData, UnitType } from '../types'

interface Props {
  weather: WeatherData | null
  units: UnitType
  visible: boolean
}

function WeatherIcon({ code }: { code: number }) {
  const props = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }

  if (code >= 200 && code < 300)
    return <svg {...props}><path d="M19 11h-4.91L17 3h-8l-4 10h5l-2 8l11-10z" /></svg>
  if (code >= 300 && code < 600)
    return <svg {...props}><path d="M16 13a4 4 0 0 1-8 0" /><path d="M8 19v2M12 21v2M16 19v2" /></svg>
  if (code >= 600 && code < 700)
    return <svg {...props}><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" /></svg>
  if (code >= 700 && code < 800)
    return <svg {...props}><path d="M4 10h16M4 14h16M4 18h16M4 6h16" /></svg>
  if (code === 800)
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    )
  return <svg {...props}><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></svg>
}

export default function WeatherWidget({ weather, units, visible }: Props) {
  if (!visible || !weather) return null

  const unitLabel = units === 'metric' ? '°C' : '°F'

  return (
    <div
      className="fixed top-[25px] right-[25px] z-[1000] flex flex-col items-center
        px-[22px] py-4 rounded-[28px]
        bg-black/45 backdrop-blur-[15px] backdrop-saturate-[160%]
        border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.3)]
        transition-all duration-500"
    >
      {/* Top row: icon + temperature */}
      <div className="flex items-center gap-[15px]">
        <div
          className="w-[42px] h-[42px] [&_svg]:w-full [&_svg]:h-full
            [&_svg]:drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
          style={{ color: 'var(--clock-color)' }}
        >
          <WeatherIcon code={weather.iconCode} />
        </div>
        <span
          className="text-[2.8rem] font-extrabold leading-none"
          style={{ color: 'var(--clock-color)' }}
        >
          {weather.temp}{unitLabel}
        </span>
      </div>

      {/* Bottom row */}
      <div className="mt-2 text-center">
        <span
          className="block text-[0.8rem] font-semibold uppercase tracking-[2px]"
          style={{ color: 'var(--clock-color)' }}
        >
          {weather.city}
        </span>
        <span className="block text-[0.65rem] text-[var(--text-dim)] mt-0.5 md:block hidden">
          {weather.desc}
        </span>
      </div>
    </div>
  )
}
