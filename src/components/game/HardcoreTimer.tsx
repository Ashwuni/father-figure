import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, HARDCORE_TIME } from '../../store/gameStore'
import { audio } from '../../audio/audioEngine'

export default function HardcoreTimer() {
  const phase = useGameStore(s => s.phase)
  const mode = useGameStore(s => s.mode)
  const hardcoreTimeLeft = useGameStore(s => s.hardcoreTimeLeft)
  const isTimerRunning = useGameStore(s => s.isTimerRunning)
  const isPaused = useGameStore(s => s.isPaused)
  const timeExpired = useGameStore(s => s.timeExpired)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeRef = useRef(hardcoreTimeLeft)

  useEffect(() => {
    timeRef.current = hardcoreTimeLeft
  }, [hardcoreTimeLeft])

  // Tick the timer down in the store
  useEffect(() => {
    if (mode !== 'hardcore' || !isTimerRunning || phase !== 'game' || isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      const next = useGameStore.getState().hardcoreTimeLeft - 0.1
      if (next <= 0) {
        clearInterval(intervalRef.current!)
        audio.wrong()
        timeExpired()
      } else {
        useGameStore.setState({ hardcoreTimeLeft: Math.max(0, next) })
      }
    }, 100)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [mode, isTimerRunning, isPaused, phase, timeExpired])

  if (mode !== 'hardcore') return null

  const pct = hardcoreTimeLeft / HARDCORE_TIME           // 1 → 0
  const danger = pct < 0.4                               // last 40%
  const critical = pct < 0.2                             // last 20%
  const redOpacity = Math.max(0, (1 - pct) * 0.55)      // 0 → 0.55

  return (
    <>
      {/* Red screen bleed */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 20,
          background: `radial-gradient(ellipse at center, transparent 30%, rgba(220,38,38,${redOpacity}) 100%)`,
        }}
        animate={{ opacity: phase === 'game' ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Pulsing red vignette when critical */}
      {critical && phase === 'game' && (
        <motion.div
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 21, background: 'rgba(220,38,38,0.08)' }}
          animate={{ opacity: [0.08, 0.2, 0.08] }}
          transition={{ duration: 0.4, repeat: Infinity }}
        />
      )}

      {/* Timer bar + number */}
      <AnimatePresence>
        {phase === 'game' && (
          <motion.div
            className="w-full max-w-2xl mx-auto flex flex-col gap-2"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Number */}
            <div className="flex justify-between items-baseline px-1">
              <span
                className="font-sans text-xs tracking-widest uppercase"
                style={{ color: danger ? '#ef4444' : 'rgba(245,240,235,0.3)' }}
              >
                Time
              </span>
              <motion.span
                className="font-display font-black tabular-nums"
                style={{
                  fontSize: 'clamp(1.4rem, 4vw, 2rem)',
                  color: critical ? '#ef4444' : danger ? '#f97316' : '#e8cc7a',
                  textShadow: critical ? '0 0 20px rgba(239,68,68,0.6)' : danger ? '0 0 15px rgba(249,115,22,0.4)' : 'none',
                  lineHeight: 1,
                }}
                animate={critical ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 0.3, repeat: critical ? Infinity : 0 }}
              >
                {Math.ceil(hardcoreTimeLeft)}
              </motion.span>
            </div>

            {/* Progress bar */}
            <div
              className="relative w-full h-2 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <motion.div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width: `${pct * 100}%`,
                  background: critical
                    ? 'linear-gradient(90deg, #991b1b, #ef4444)'
                    : danger
                    ? 'linear-gradient(90deg, #c2410c, #f97316)'
                    : 'linear-gradient(90deg, #92400e, #c9a84c)',
                  boxShadow: critical
                    ? '0 0 12px rgba(239,68,68,0.7)'
                    : danger
                    ? '0 0 8px rgba(249,115,22,0.5)'
                    : '0 0 6px rgba(201,168,76,0.3)',
                  transition: 'width 0.1s linear, background 0.5s, box-shadow 0.5s',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
