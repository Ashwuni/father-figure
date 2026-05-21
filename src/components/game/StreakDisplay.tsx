import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'

function StreakFire({ count }: { count: number }) {
  if (count < 3) return null

  return (
    <motion.div
      className="flex items-center gap-1"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
    >
      {Array.from({ length: Math.min(Math.floor(count / 3), 5) }, (_, i) => (
        <motion.span
          key={i}
          className="text-sm"
          animate={{
            y: [0, -3, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 0.8,
            delay: i * 0.1,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          🔥
        </motion.span>
      ))}
    </motion.div>
  )
}

export default function StreakDisplay() {
  const streak = useGameStore(s => s.streak)
  const score = useGameStore(s => s.score)
  const comboMultiplier = useGameStore(s => s.comboMultiplier)
  const correctAnswers = useGameStore(s => s.correctAnswers)
  const totalAnswered = useGameStore(s => s.totalAnswered)

  const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0

  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto py-1 px-1">
      {/* Score */}
      <div className="flex flex-col items-start">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={score}
            className="font-display font-bold text-gold"
            style={{ fontSize: '1.4rem', lineHeight: 1, textShadow: '0 0 20px rgba(201,168,76,0.4)' }}
            initial={{ y: -15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 15, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {score.toLocaleString()}
          </motion.span>
        </AnimatePresence>
        <span className="font-sans text-xs text-cream/30 tracking-widest uppercase">Score</span>
      </div>

      {/* Streak + fire */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={streak}
              className="font-display font-bold text-cream text-xl"
              style={{
                color: streak >= 5 ? '#e8cc7a' : streak >= 3 ? '#f9fafb' : 'rgba(245,240,235,0.5)',
                textShadow: streak >= 5 ? '0 0 15px rgba(201,168,76,0.5)' : 'none',
                transition: 'color 0.3s, text-shadow 0.3s',
              }}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              {streak}
            </motion.span>
          </AnimatePresence>
          <StreakFire count={streak} />
        </div>
        <span className="font-sans text-xs text-cream/30 tracking-widest uppercase">Streak</span>
      </div>

      {/* Multiplier + Accuracy */}
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-1">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={comboMultiplier}
              className="font-display font-bold"
              style={{
                fontSize: '1.1rem',
                color: comboMultiplier > 1 ? '#e91e8c' : 'rgba(245,240,235,0.3)',
              }}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
            >
              {comboMultiplier.toFixed(1)}x
            </motion.span>
          </AnimatePresence>
        </div>
        <span className="font-sans text-xs text-cream/30 tracking-widest uppercase">{accuracy}% acc</span>
      </div>
    </div>
  )
}
