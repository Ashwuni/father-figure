import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { audio } from '../../audio/audioEngine'

function getPersonality(correct: number, total: number, bestStreak: number) {
  const acc = total > 0 ? correct / total : 0
  if (acc === 1 && bestStreak >= 10) return { title: 'THE GODSWIFT', desc: 'Perfect score. The families bow. The Eras Tour opens for you.', emoji: '👑', color: '#e8cc7a' }
  if (acc === 1) return { title: 'FLAWLESS WITNESS', desc: '10 for 10. No lawyer needed. The truth simply bends to your will.', emoji: '✨', color: '#e8cc7a' }
  if (acc >= 0.9) return { title: 'THE CONSIGLIERE', desc: 'Sharp. Precise. Tom Hagen energy. You advise both empires.', emoji: '🎩', color: '#c9a84c' }
  if (acc >= 0.8) return { title: 'MADE MEMBER', desc: 'Solid. Reliable. The don keeps you around for a reason.', emoji: '🌹', color: '#c9a84c' }
  if (acc >= 0.7) return { title: 'THE SWIFTIE DON', desc: '70% mafia, 30% sequined cardigan. Dangerous combination.', emoji: '🎸', color: '#f472b6' }
  if (acc >= 0.6) return { title: 'LEAVE THE GUN', desc: 'Take the cannoli. You survived. Barely, but still.', emoji: '🥮', color: '#9ca3af' }
  if (acc >= 0.5) return { title: 'FREDO ENERGY', desc: 'You mean well. You really do. But Michael is watching.', emoji: '😬', color: '#9ca3af' }
  return { title: 'CONFUSED CIVILIAN', desc: 'You stumbled into the wrong social club. Shake it off.', emoji: '🫠', color: '#6b7280' }
}

function ScoreRing({ correct, total }: { correct: number; total: number }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const progress = total > 0 ? correct / total : 0
  const offset = circumference * (1 - progress)

  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" className="absolute" style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        {/* Progress */}
        <motion.circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c9a84c" />
            <stop offset="100%" stopColor="#e91e8c" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex flex-col items-center">
        <motion.span
          className="font-display font-black text-cream"
          style={{ fontSize: '2rem', lineHeight: 1 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 400 }}
        >
          {correct}
          <span className="text-cream/30 text-lg">/{total}</span>
        </motion.span>
        <span className="font-sans text-xs text-cream/40 tracking-widest uppercase mt-1">correct</span>
      </div>
    </div>
  )
}

function StatPill({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-1 px-5 py-3 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <span className="font-display font-bold text-gold text-xl">{value}</span>
      <span className="font-sans text-cream/35 text-xs tracking-widest uppercase">{label}</span>
    </motion.div>
  )
}

export default function GameOver() {
  const score = useGameStore(s => s.score)
  const correctAnswers = useGameStore(s => s.correctAnswers)
  const totalAnswered = useGameStore(s => s.totalAnswered)
  const bestStreak = useGameStore(s => s.bestStreak)
  const goToIntro = useGameStore(s => s.goToIntro)
  const restartGame = useGameStore(s => s.restartGame)

  const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0
  const personality = getPersonality(correctAnswers, totalAnswered, bestStreak)

  useEffect(() => {
    audio.gameover()
  }, [])

  const shareText = `FATHER FIGURE — Can you tell Taylor Swift from The Godfather?\n\n${correctAnswers}/${totalAnswered} correct · ${accuracy}% accuracy\n\nVerdict: "${personality.title}"\n\nPlay at father-figure.vercel.app`

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ text: shareText }).catch(() => {})
    } else {
      navigator.clipboard.writeText(shareText)
    }
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-md flex flex-col items-center gap-7">

        {/* Header */}
        <motion.div
          className="flex flex-col items-center gap-2 text-center"
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="font-sans text-xs text-cream/30 tracking-[0.3em] uppercase">Trial complete</span>
          <h1 className="font-display font-black text-cream" style={{ fontSize: 'clamp(2.2rem, 8vw, 3.5rem)', lineHeight: 1 }}>
            THE VERDICT
          </h1>
        </motion.div>

        {/* Score ring + personality card */}
        <motion.div
          className="w-full rounded-2xl px-8 py-8 flex flex-col items-center gap-5"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 0 80px rgba(201,168,76,0.06)',
          }}
          initial={{ scale: 0.93, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 280, damping: 28 }}
        >
          <ScoreRing correct={correctAnswers} total={totalAnswered} />

          <div className="flex flex-col items-center gap-2 text-center">
            <span className="text-4xl">{personality.emoji}</span>
            <h2
              className="font-display font-black tracking-wide text-2xl"
              style={{ color: personality.color, textShadow: `0 0 20px ${personality.color}60` }}
            >
              {personality.title}
            </h2>
            <p className="font-display italic text-cream/50 text-sm leading-relaxed max-w-xs">
              "{personality.desc}"
            </p>
          </div>
        </motion.div>

        {/* Stat pills */}
        <div className="grid grid-cols-3 gap-3 w-full">
          <StatPill label="Score" value={score.toLocaleString()} delay={0.6} />
          <StatPill label="Accuracy" value={`${accuracy}%`} delay={0.7} />
          <StatPill label="Streak" value={`${bestStreak}x`} delay={0.8} />
        </div>

        {/* Divider */}
        <motion.div
          className="w-full h-px"
          style={{ background: 'rgba(255,255,255,0.06)' }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        />

        {/* Action buttons */}
        <div className="flex flex-col gap-3 w-full">
          {/* Play again - primary */}
          <motion.button
            className="w-full py-4 rounded-xl font-display font-bold text-lg tracking-wide cursor-pointer relative overflow-hidden"
            style={{
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.4)',
              color: '#e8cc7a',
              boxShadow: '0 0 30px rgba(201,168,76,0.08)',
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            whileHover={{ boxShadow: '0 0 50px rgba(201,168,76,0.18)', background: 'rgba(201,168,76,0.15)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { audio.whoosh(); restartGame() }}
          >
            Play Again
          </motion.button>

          {/* Share */}
          <motion.button
            className="w-full py-3.5 rounded-xl font-display font-bold tracking-wide cursor-pointer"
            style={{
              background: 'rgba(233,30,140,0.06)',
              border: '1px solid rgba(233,30,140,0.2)',
              color: '#f472b6',
              fontSize: '1rem',
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            whileHover={{ background: 'rgba(233,30,140,0.1)' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleShare}
          >
            Share My Verdict
          </motion.button>

          {/* Return to home */}
          <motion.button
            className="w-full py-3 rounded-xl font-sans text-sm text-cream/35 tracking-widest uppercase cursor-pointer transition-colors duration-200 hover:text-cream/60"
            style={{ border: '1px solid rgba(255,255,255,0.05)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            whileHover={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { audio.whoosh(); goToIntro() }}
          >
            Return to Home
          </motion.button>
        </div>

        {/* Closing line */}
        <motion.p
          className="text-cream/15 text-xs font-sans text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          Every score is a confession. What does yours say about you?
        </motion.p>

      </div>
    </motion.div>
  )
}
