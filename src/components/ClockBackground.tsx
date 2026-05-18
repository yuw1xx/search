import { useClock } from '../hooks/useClock'
import type { ClockType } from '../types'

interface Props {
  type: ClockType
  visible: boolean
}

export default function ClockBackground({ type, visible }: Props) {
  const time = useClock()
  const s = time.getSeconds()
  const m = time.getMinutes()
  const h = time.getHours()

  const sDeg = (s / 60) * 360
  const mDeg = (m / 60) * 360 + (s / 60) * 6
  const hDeg = ((h % 12) / 12) * 360 + (m / 60) * 30

  const timeStr = time.toLocaleTimeString('en-GB')

  const baseClass =
    'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none transition-all duration-1000'

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  const clockVisible = visible && type === 'analog'
  const digitalVisible = visible && type === 'digital'

  return (
    <>
      {/* Analog */}
      <div
        className={`${baseClass} w-[85vh] h-[85vh] border border-white/[0.03] rounded-full
          ${clockVisible ? 'opacity-50 blur-[5px]' : 'opacity-0 blur-[30px]'}`}
      >
        <div className="relative w-full h-full">
          {/* Numbers */}
          {numbers.map((n) => (
            <div
              key={n}
              className="clock-number"
              style={{ transform: `rotate(${n * 30}deg)` }}
            >
              <b style={{ transform: `rotate(${n * -30}deg)` }}>{n}</b>
            </div>
          ))}

          {/* Hour hand */}
          <div
            className="clock-hand"
            style={{
              width: 10,
              height: '25%',
              marginLeft: -5,
              transform: `rotate(${hDeg}deg)`,
            }}
          />
          {/* Minute hand */}
          <div
            className="clock-hand"
            style={{
              width: 5,
              height: '38%',
              marginLeft: -2.5,
              opacity: 0.8,
              transform: `rotate(${mDeg}deg)`,
            }}
          />
          {/* Second hand */}
          <div
            className="clock-hand"
            style={{
              width: 2,
              height: '45%',
              marginLeft: -1,
              background: '#6366f1',
              transform: `rotate(${sDeg}deg)`,
            }}
          />
          <div className="clock-center-dot" />
        </div>
      </div>

      {/* Digital */}
      <div
        className={`${baseClass} text-[16vw] font-extrabold text-white/40 whitespace-nowrap
          [font-variant-numeric:tabular-nums]
          ${digitalVisible ? 'opacity-50 blur-[5px]' : 'opacity-0 blur-[30px]'}`}
      >
        {timeStr}
      </div>

      {/* Mobile analog */}
      <style>{`
        @media (max-width: 768px) {
          .clock-bg-analog { top: 29% !important; width: 70vw !important; height: 70vw !important; filter: blur(2.5px) !important; opacity: 0.35 !important; }
          .clock-bg-digital { top: 39% !important; font-size: 18vw !important; filter: blur(2.5px) !important; opacity: 0.35 !important; }
        }
      `}</style>
    </>
  )
}
