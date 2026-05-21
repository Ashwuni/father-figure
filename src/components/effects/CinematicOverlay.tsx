import { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'

// Film grain canvas overlay
function FilmGrain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let frame = 0

    const draw = () => {
      frame++
      if (frame % 3 !== 0) { // Only update every 3 frames for performance
        animId = requestAnimationFrame(draw)
        return
      }

      const w = canvas.width
      const h = canvas.height
      const imageData = ctx.createImageData(w, h)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 30
        data[i] = noise
        data[i + 1] = noise
        data[i + 2] = noise
        data[i + 3] = 18 // Very subtle
      }

      ctx.putImageData(imageData, 0, 0)
      animId = requestAnimationFrame(draw)
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    window.addEventListener('resize', resize)
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999, mixBlendMode: 'overlay' }}
    />
  )
}

// Vignette
function Vignette() {
  const streak = useGameStore(s => s.streak)
  const intensity = Math.min(0.3 + streak * 0.02, 0.65)

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 9998,
        background: `radial-gradient(ellipse at center,
          transparent 35%,
          rgba(5,5,5,${intensity * 0.5}) 60%,
          rgba(5,5,5,${intensity}) 100%
        )`,
        transition: 'background 1s ease',
      }}
    />
  )
}

// Scanlines
function Scanlines() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 9997,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px)',
      }}
    />
  )
}

// Streak-driven screen pulse
function StreakPulse() {
  const streak = useGameStore(s => s.streak)
  const lastAnswer = useGameStore(s => s.lastAnswer)

  if (lastAnswer !== 'correct' || streak < 3) return null

  const glowColor = streak >= 10 ? 'rgba(233,30,140,0.15)' : 'rgba(201,168,76,0.12)'

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 9996,
        background: `radial-gradient(ellipse at center, ${glowColor} 0%, transparent 70%)`,
        animation: 'streak-glow 2s ease-in-out infinite',
      }}
    />
  )
}

export default function CinematicOverlay() {
  return (
    <>
      <FilmGrain />
      <Vignette />
      <Scanlines />
      <StreakPulse />
    </>
  )
}
