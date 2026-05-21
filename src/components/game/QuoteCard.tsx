import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'

function KineticWord({ word, index }: { word: string; index: number }) {
  return (
    <motion.span
      className="inline-block mr-[0.25em]"
      initial={{ opacity: 0, y: 20, rotateX: -30, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      {word}
    </motion.span>
  )
}

function QuoteText({ text }: { text: string }) {
  const words = text.split(' ')
  return (
    <p
      className="font-display text-cream leading-snug text-center"
      style={{
        fontSize: 'clamp(1.15rem, 3vw, 2rem)',
        fontStyle: 'italic',
        textShadow: '0 2px 20px rgba(0,0,0,0.8)',
        perspective: '800px',
      }}
    >
      <span className="text-gold/70 text-xl mr-1" style={{ fontStyle: 'normal' }}>"</span>
      {words.map((word, i) => (
        <KineticWord key={`${word}-${i}`} word={word} index={i} />
      ))}
      <span className="text-gold/70 text-xl ml-1" style={{ fontStyle: 'normal' }}>"</span>
    </p>
  )
}

function IntensityDots({ intensity }: { intensity: number }) {
  return (
    <div className="flex gap-1.5 items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{
            width: 4,
            height: 4,
            background: i < intensity ? '#c9a84c' : 'rgba(201,168,76,0.15)',
            boxShadow: i < intensity ? '0 0 5px rgba(201,168,76,0.6)' : 'none',
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 + i * 0.05, type: 'spring', stiffness: 400 }}
        />
      ))}
    </div>
  )
}

function AmbiguityBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-cream/25 text-xs font-sans tracking-widest uppercase">Ambiguity</span>
      <div className="relative w-24 h-0.5 rounded-full overflow-hidden bg-cream/10">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            background: score > 7
              ? 'linear-gradient(90deg, #c9a84c, #e91e8c)'
              : 'linear-gradient(90deg, #c9a84c80, #c9a84c)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default function QuoteCard() {
  const currentQuote = useGameStore(s => s.currentQuote)
  const streak = useGameStore(s => s.streak)

  if (!currentQuote) return null

  const streakGlow = streak >= 5
    ? '0 0 60px rgba(201,168,76,0.2), 0 0 120px rgba(201,168,76,0.08)'
    : streak >= 3
    ? '0 0 40px rgba(201,168,76,0.1)'
    : 'none'

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentQuote.id}
        className="relative w-full"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -24, scale: 0.97 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Main card */}
        <div
          className="relative rounded-2xl p-6 md:p-8 overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.025)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), ${streakGlow}`,
          }}
        >
          <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at top left, rgba(201,168,76,0.08) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at bottom right, rgba(233,30,140,0.06) 0%, transparent 70%)' }} />

          <QuoteText text={currentQuote.text} />
        </div>

        {/* Footer row: tone tag + intensity + ambiguity */}
        <motion.div
          className="flex items-center justify-between mt-3 px-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span
            className="font-sans text-xs tracking-widest uppercase px-2.5 py-1 rounded-full"
            style={{ color: 'rgba(245,240,235,0.3)', border: '1px solid rgba(245,240,235,0.07)' }}
          >
            {currentQuote.tone}
          </span>
          <div className="flex items-center gap-3">
            <AmbiguityBar score={currentQuote.ambiguityScore} />
            <IntensityDots intensity={currentQuote.intensity} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
