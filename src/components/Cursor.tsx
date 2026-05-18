import { useRef, useEffect } from 'react'

export default function Cursor() {
  const outlineRef = useRef<HTMLDivElement>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const pos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY }
    }
    const onDown = () => document.body.classList.add('cursor-clicking')
    const onUp = () => document.body.classList.remove('cursor-clicking')

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)

    let raf: number
    const animate = () => {
      pos.current.x += (mouse.current.x - pos.current.x) * 0.16
      pos.current.y += (mouse.current.y - pos.current.y) * 0.16
      if (outlineRef.current) {
        outlineRef.current.style.left = `${pos.current.x}px`
        outlineRef.current.style.top = `${pos.current.y}px`
      }
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <div ref={outlineRef} className="cursor-outline" />
}
