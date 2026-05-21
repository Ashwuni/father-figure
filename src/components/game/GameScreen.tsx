import { useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { audio } from '../../audio/audioEngine'
import QuoteCard from './QuoteCard'
import ChoiceButtons from './ChoiceButtons'
import StreakDisplay from './StreakDisplay'
import RevealOverlay from './RevealOverlay'
import HardcoreTimer from './HardcoreTimer'

function Modal({ children, onBackdropClick }: { children: React.ReactNode; onBackdropClick?: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ background: 'rgba(5,5,5,0.88)', backdropFilter: 'blur(14px)' }}
        onClick={onBackdropClick}
      />
      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ scale: 0.92, y: 10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 10, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

function ModalCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-full rounded-2xl px-8 py-10 flex flex-col items-center gap-5"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 0 60px rgba(0,0,0,0.6)',
      }}
    >
      {children}
    </div>
  )
}

function PauseModal({ onResume, onQuit }: { onResume: () => void; onQuit: () => void }) {
  return (
    <Modal onBackdropClick={onResume}>
      <ModalCard>
        <span className="text-4xl">⏸</span>
        <div className="text-center">
          <h2 className="font-display font-black text-cream text-2xl tracking-wide">Paused</h2>
          <p className="font-display italic text-cream/50 text-sm mt-2">"Even the don takes a breath."</p>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <motion.button
            className="w-full py-3.5 rounded-xl font-display font-bold tracking-wide cursor-pointer"
            style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)', color: '#e8cc7a', fontSize: '1rem' }}
            whileHover={{ background: 'rgba(201,168,76,0.14)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onResume}
          >
            Resume
          </motion.button>
          <motion.button
            className="w-full py-3 rounded-xl font-sans text-sm text-cream/35 tracking-widest uppercase cursor-pointer hover:text-cream/55 transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            whileHover={{ background: 'rgba(255,255,255,0.02)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onQuit}
          >
            Quit Round
          </motion.button>
        </div>
      </ModalCard>
    </Modal>
  )
}

function QuitModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal onBackdropClick={onCancel}>
      <ModalCard>
        <span className="text-4xl">🚪</span>
        <div className="text-center">
          <h2 className="font-display font-black text-cream text-2xl tracking-wide">Leave the Round?</h2>
          <p className="font-display italic text-cream/50 text-sm mt-2">"A man who runs is no man at all."</p>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <motion.button
            className="w-full py-3.5 rounded-xl font-display font-bold tracking-wide cursor-pointer"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', fontSize: '1rem' }}
            whileHover={{ background: 'rgba(239,68,68,0.14)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onConfirm}
          >
            End Round &amp; Return Home
          </motion.button>
          <motion.button
            className="w-full py-3.5 rounded-xl font-display font-bold tracking-wide cursor-pointer"
            style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', color: '#e8cc7a', fontSize: '1rem' }}
            whileHover={{ background: 'rgba(201,168,76,0.14)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onCancel}
          >
            Keep Playing
          </motion.button>
        </div>
      </ModalCard>
    </Modal>
  )
}

function IconButton({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <motion.button
      className="font-sans text-xs text-cream/30 tracking-widest uppercase cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-cream/60 transition-colors duration-200"
      style={{ border: '1px solid rgba(255,255,255,0.07)' }}
      whileHover={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)' }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      title={title}
    >
      {children}
    </motion.button>
  )
}

export default function GameScreen() {
  const phase = useGameStore(s => s.phase)
  const nextQuote = useGameStore(s => s.nextQuote)
  const submitAnswer = useGameStore(s => s.submitAnswer)
  const goToIntro = useGameStore(s => s.goToIntro)
  const togglePause = useGameStore(s => s.togglePause)
  const isPaused = useGameStore(s => s.isPaused)
  const currentIndex = useGameStore(s => s.currentIndex)
  const totalQuotes = useGameStore(s => s.quotes.length)
  const [showQuit, setShowQuit] = useState(false)

  const handleResume = () => { if (isPaused) togglePause() }
  const handleQuitFromPause = () => { handleResume(); audio.whoosh(); goToIntro() }
  const handleQuitConfirm = () => { audio.whoosh(); goToIntro() }
  const openQuit = () => { if (isPaused) togglePause(); setShowQuit(true) }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (showQuit) { if (e.code === 'Escape') setShowQuit(false); return }
    if (e.code === 'Escape') { if (phase === 'game') togglePause(); return }
    if (isPaused) return
    if (phase === 'reveal') {
      if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); audio.whoosh(); nextQuote() }
    } else if (phase === 'game') {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft' || e.code === 'Digit1') submitAnswer('taylor')
      else if (e.code === 'KeyD' || e.code === 'ArrowRight' || e.code === 'Digit2') submitAnswer('godfather')
    }
  }, [phase, nextQuote, submitAnswer, showQuit, isPaused, togglePause])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const progress = totalQuotes > 0 ? currentIndex / totalQuotes : 0

  return (
    <motion.div
      className="h-dvh flex flex-col overflow-hidden relative"
      style={{ paddingTop: 'clamp(1.5rem, 5vh, 3.5rem)', paddingBottom: 'clamp(1.5rem, 5vh, 3.5rem)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Header ── */}
      <div className="flex-none px-6 pb-2">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span
            className="font-display font-black text-gold tracking-wide"
            style={{ fontSize: '1.1rem', textShadow: '0 0 15px rgba(201,168,76,0.3)' }}
          >
            FATHER FIGURE
          </span>
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs text-cream/30 tracking-widest uppercase mr-1">
              {currentIndex + 1} / {totalQuotes}
            </span>
            <IconButton onClick={() => { if (!showQuit) togglePause() }} title={isPaused ? 'Resume' : 'Pause'}>
              <span>{isPaused ? '▶' : '⏸'}</span>
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </IconButton>
            <IconButton onClick={openQuit} title="Quit">
              <span>&#x2715;</span>
              <span>Quit</span>
            </IconButton>
          </div>
        </div>

        {/* Progress bar — full width under header */}
        <div className="max-w-2xl mx-auto mt-3 h-px bg-cream/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-gold to-gold/40 rounded-full"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* ── Hardcore timer ── */}
      <div className="flex-none px-6">
        <div className="max-w-2xl mx-auto">
          <HardcoreTimer />
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="flex-none px-6 py-0">
        <div className="max-w-2xl mx-auto">
          <StreakDisplay />
        </div>
      </div>

      {/* ── Quote — fills remaining space ── */}
      <div className="flex-1 min-h-0 px-6 flex items-start" style={{ paddingTop: 'clamp(3rem, 12vh, 7rem)' }}>
        <div className="w-full max-w-2xl mx-auto">
          <QuoteCard />
        </div>
      </div>

      {/* ── Keyboard hints + Choices ── */}
      <div className="flex-none px-6 pt-2">
        <div className="max-w-2xl mx-auto flex flex-col gap-2">
          <p className="text-cream/20 text-xs font-sans text-center tracking-wide hidden md:block">
            A / ← &nbsp;Taylor Swift &nbsp;&nbsp;·&nbsp;&nbsp; Godfather&nbsp; D / → &nbsp;&nbsp;·&nbsp;&nbsp; Esc to pause
          </p>
          <ChoiceButtons />
        </div>
      </div>

      {/* Spacer — pushes buttons up from the bottom edge */}
      <div style={{ height: 'clamp(2rem, 9vh, 6rem)' }} />

      {/* Reveal overlay */}
      <RevealOverlay />

      {/* Modals */}
      <AnimatePresence>
        {isPaused && !showQuit && (
          <PauseModal onResume={handleResume} onQuit={handleQuitFromPause} />
        )}
        {showQuit && (
          <QuitModal onConfirm={handleQuitConfirm} onCancel={() => setShowQuit(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
