import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { audio } from '../../audio/audioEngine'
import { COMBO_COMMENTARY } from '../../data/quotes'

function CorrectBurst() {
  return (
    <>
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const distance = 60 + Math.random() * 40
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full pointer-events-none"
            style={{
              background: i % 2 === 0 ? '#c9a84c' : '#e91e8c',
              left: '50%',
              top: '50%',
              boxShadow: `0 0 6px ${i % 2 === 0 ? '#c9a84c' : '#e91e8c'}`,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
          />
        )
      })}
    </>
  )
}

function ResultBadge({ lastAnswer }: { lastAnswer: 'correct' | 'wrong' | 'timeout' }) {
  return (
    <motion.div
      className="relative flex items-center justify-center"
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.1 }}
    >
      {lastAnswer === 'correct' ? (
        <div
          className="relative px-8 py-4 rounded-xl flex flex-col items-center gap-1"
          style={{
            background: 'rgba(201,168,76,0.12)',
            border: '1px solid rgba(201,168,76,0.4)',
            boxShadow: '0 0 40px rgba(201,168,76,0.2), 0 0 80px rgba(201,168,76,0.08)',
          }}
        >
          <CorrectBurst />
          <span className="text-3xl">✓</span>
          <span className="font-display font-black tracking-wide text-gold" style={{ fontSize: '1.5rem', textShadow: '0 0 20px rgba(201,168,76,0.6)' }}>
            CORRECT
          </span>
        </div>
      ) : lastAnswer === 'timeout' ? (
        <motion.div
          className="px-8 py-4 rounded-xl flex flex-col items-center gap-1"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)' }}
          animate={{ x: [-6, 6, -4, 4, -2, 2, 0] }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <span className="text-3xl">⏱</span>
          <span className="font-display font-black tracking-wide text-red-400" style={{ fontSize: '1.5rem' }}>
            TOO SLOW
          </span>
        </motion.div>
      ) : (
        <motion.div
          className="px-8 py-4 rounded-xl flex flex-col items-center gap-1"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}
          animate={{ x: [-6, 6, -4, 4, -2, 2, 0] }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <span className="text-3xl">✗</span>
          <span className="font-display font-black tracking-wide text-red-400" style={{ fontSize: '1.5rem' }}>
            WRONG
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}

function SourceReveal({ source, context }: { source: 'taylor' | 'godfather'; context: string }) {
  const isTaylor = source === 'taylor'
  const color = isTaylor ? '#f472b6' : '#c9a84c'
  const label = isTaylor ? '🎸 Taylor Swift' : '🌹 The Godfather'

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.4 }}
    >
      <span
        className="font-display font-bold text-lg"
        style={{ color, textShadow: `0 0 15px ${color}60` }}
      >
        {label}
      </span>
      <span className="font-sans text-sm text-cream/40 italic">{context}</span>
    </motion.div>
  )
}

function Commentary({ text }: { text: string }) {
  return (
    <motion.div
      className="max-w-sm text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.55 }}
    >
      <p className="font-display italic text-cream/60 text-sm leading-relaxed">
        "{text}"
      </p>
    </motion.div>
  )
}

function ComboAnnouncer({ streak }: { streak: number }) {
  const message = COMBO_COMMENTARY[streak]
  if (!message || streak < 3) return null

  return (
    <motion.div
      className="flex flex-col items-center gap-1"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 400 }}
    >
      <div
        className="px-4 py-2 rounded-full text-sm font-sans font-semibold tracking-widest uppercase"
        style={{
          background: 'rgba(201,168,76,0.1)',
          border: '1px solid rgba(201,168,76,0.3)',
          color: '#e8cc7a',
          boxShadow: '0 0 20px rgba(201,168,76,0.15)',
        }}
      >
        🔥 {streak}x STREAK
      </div>
      <span className="text-cream/50 text-xs font-sans">{message}</span>
    </motion.div>
  )
}

export default function RevealOverlay() {
  const phase = useGameStore(s => s.phase)
  const lastAnswer = useGameStore(s => s.lastAnswer)
  const currentQuote = useGameStore(s => s.currentQuote)
  const streak = useGameStore(s => s.streak)
  const nextQuote = useGameStore(s => s.nextQuote)

  const isCorrect = lastAnswer === 'correct'

  useEffect(() => {
    if (phase !== 'reveal') return
    // audio is already played by HardcoreTimer on timeout
    if (lastAnswer === 'timeout') return

    if (isCorrect) {
      if (streak > 0 && streak % 3 === 0) {
        audio.streak(streak)
      } else {
        audio.correct()
      }
    } else {
      audio.wrong()
    }
  }, [phase, isCorrect, lastAnswer, streak])

  if (phase !== 'reveal' || !currentQuote) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex flex-col items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: 'rgba(5,5,5,0.88)',
            backdropFilter: 'blur(8px)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-6 px-6 max-w-lg w-full text-center">
          <ResultBadge lastAnswer={lastAnswer ?? 'wrong'} />
          <SourceReveal source={currentQuote.source} context={currentQuote.context} />
          <Commentary text={currentQuote.commentary} />
          {lastAnswer !== 'timeout' && <ComboAnnouncer streak={streak} />}

          {/* Continue button */}
          <motion.button
            className="mt-4 px-10 py-4 rounded-xl font-display font-bold tracking-wide cursor-pointer relative overflow-hidden group"
            style={{
              background: 'rgba(201,168,76,0.08)',
              border: '1px solid rgba(201,168,76,0.3)',
              color: '#e8cc7a',
              fontSize: '1rem',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{
              background: 'rgba(201,168,76,0.15)',
              boxShadow: '0 0 30px rgba(201,168,76,0.2)',
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              audio.whoosh()
              nextQuote()
            }}
          >
            <span className="relative z-10">Next Quote →</span>
          </motion.button>

          {/* Keyboard hint */}
          <motion.p
            className="text-cream/20 text-xs font-sans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            Press Space or Enter to continue
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
