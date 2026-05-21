import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { audio } from '../../audio/audioEngine'

interface ChoiceButtonProps {
  label: string
  sublabel: string
  emoji: string
  color: string
  glowColor: string
  borderColor: string
  onClick: () => void
  disabled: boolean
  index: number
}

function ChoiceButton({
  label, sublabel, emoji, color, glowColor, borderColor, onClick, disabled, index,
}: ChoiceButtonProps) {
  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)

  const handleClick = () => {
    if (disabled) return
    setPressed(true)
    audio.choose()
    setTimeout(() => onClick(), 80)
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => !disabled && setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={handleClick}
      disabled={disabled}
      whileTap={!disabled ? { scale: 0.96 } : {}}
      className="relative flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl py-4 px-6 cursor-pointer overflow-hidden transition-all duration-200 select-none"
      style={{
        background: hovered
          ? `rgba(${color}, 0.1)`
          : `rgba(${color}, 0.04)`,
        border: `1px solid ${hovered ? borderColor.replace('0.2', '0.5') : borderColor}`,
        boxShadow: hovered
          ? `0 0 40px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.05)`
          : 'inset 0 1px 0 rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {/* Shimmer sweep on hover */}
      {hovered && !disabled && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: '100%', opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            background: `linear-gradient(90deg, transparent, rgba(${color}, 0.08), transparent)`,
          }}
        />
      )}

      {/* Corner glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 60% at 50% 50%, rgba(${color}, ${hovered ? 0.06 : 0.02}) 0%, transparent 70%)`,
          transition: 'all 0.3s',
        }}
      />

      {/* Emoji */}
      <motion.span
        className="text-2xl"
        animate={hovered ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {emoji}
      </motion.span>

      {/* Label */}
      <div className="flex flex-col items-center gap-1">
        <span
          className="font-display font-bold tracking-wide"
          style={{
            fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
            color: hovered ? `rgba(${color}, 1)` : `rgba(${color}, 0.85)`,
            textShadow: hovered ? `0 0 20px rgba(${color}, 0.5)` : 'none',
            transition: 'all 0.2s',
          }}
        >
          {label}
        </span>
        <span className="font-sans text-xs text-cream/30 tracking-widest uppercase">
          {sublabel}
        </span>
      </div>

      {/* Press ripple */}
      {pressed && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{ background: `rgba(${color}, 0.15)` }}
        />
      )}
    </motion.button>
  )
}

function OrDivider() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-2">
      <div className="w-px flex-1 bg-gradient-to-b from-transparent via-cream/15 to-transparent" />
      <motion.span
        className="font-display italic text-cream/30 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        or
      </motion.span>
      <div className="w-px flex-1 bg-gradient-to-b from-transparent via-cream/15 to-transparent" />
    </div>
  )
}

export default function ChoiceButtons() {
  const phase = useGameStore(s => s.phase)
  const submitAnswer = useGameStore(s => s.submitAnswer)

  const disabled = phase !== 'game'

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {/* Buttons */}
      <div className="flex gap-3 items-stretch h-28">
        <ChoiceButton
          label="Taylor Swift"
          sublabel="Swiftie energy"
          emoji="🎸"
          color="233,30,140"
          glowColor="rgba(233,30,140,0.2)"
          borderColor="rgba(233,30,140,0.2)"
          onClick={() => submitAnswer('taylor')}
          disabled={disabled}
          index={0}
        />

        <OrDivider />

        <ChoiceButton
          label="The Godfather"
          sublabel="Family business"
          emoji="🌹"
          color="201,168,76"
          glowColor="rgba(201,168,76,0.2)"
          borderColor="rgba(201,168,76,0.2)"
          onClick={() => submitAnswer('godfather')}
          disabled={disabled}
          index={1}
        />
      </div>
    </motion.div>
  )
}
