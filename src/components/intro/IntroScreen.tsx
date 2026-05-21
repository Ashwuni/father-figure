import { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { audio } from '../../audio/audioEngine'

const FLOATING_FRAGMENTS = [
  "It's not personal.",
  "Shake it off.",
  "Leave the gun.",
  "Bad blood.",
  "Keep your enemies closer.",
  "Look what you made me do.",
  "Strictly business.",
  "I knew you were trouble.",
  "An offer he can't refuse.",
  "Don't say I didn't warn ya.",
  "Never hate your enemies.",
  "Bandaids don't fix bullet holes.",
  "The Family.",
  "Reputation.",
]

function FloatingFragment({ text, delay, x, y }: { text: string; delay: number; x: string; y: string }) {
  return (
    <motion.div
      className="absolute font-display text-white/10 text-sm pointer-events-none select-none"
      style={{ left: x, top: y }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.15, 0.08, 0.15, 0] }}
      transition={{ duration: 8 + Math.random() * 4, delay, repeat: Infinity, repeatDelay: Math.random() * 6 }}
    >
      {text}
    </motion.div>
  )
}

function Title() {
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.p
        className="font-sans text-gold/60 text-xs tracking-[0.4em] uppercase"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        A cinematic experience
      </motion.p>

      {/* Title — both words on one line, no wrap */}
      <div className="flex items-baseline gap-4 flex-nowrap">
        {['FATHER', 'FIGURE'].map((word, wi) => (
          <span key={word} className="inline-flex whitespace-nowrap">
            {word.split('').map((char, ci) => (
              <motion.span
                key={ci}
                className="inline-block font-display font-black text-cream"
                style={{
                  fontSize: 'clamp(2.6rem, 9vw, 6.5rem)',
                  letterSpacing: '-0.02em',
                  textShadow: '0 0 40px rgba(201,168,76,0.3), 0 0 80px rgba(201,168,76,0.1)',
                }}
                initial={{ opacity: 0, y: 60, rotateX: -60 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.65, delay: 0.7 + (wi * 7 + ci) * 0.04, ease: [0.22, 1, 0.36, 1] }}
              >
                {char}
              </motion.span>
            ))}
          </span>
        ))}
      </div>

      {/* Divider */}
      <motion.div
        className="h-px bg-gradient-to-r from-transparent via-gold to-transparent w-3/4"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
      />

      {/* Subtitle */}
      <motion.p
        className="font-display italic text-cream/50 text-center"
        style={{ fontSize: 'clamp(0.8rem, 1.8vw, 1.05rem)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.7 }}
      >
        Can You Tell Taylor Swift From The Godfather?
      </motion.p>
    </div>
  )
}

function ModeButton({
  label, sublabel, onClick, delay, variant = 'gold',
}: {
  label: string; sublabel: string; onClick: () => void; delay: number; variant?: 'gold' | 'ghost' | 'rose'
}) {
  const [hovered, setHovered] = useState(false)

  const styles = {
    gold: {
      bg: hovered ? 'rgba(201,168,76,0.14)' : 'rgba(201,168,76,0.06)',
      border: hovered ? 'rgba(201,168,76,0.6)' : 'rgba(201,168,76,0.25)',
      shadow: hovered ? '0 0 30px rgba(201,168,76,0.2)' : 'none',
      labelColor: '#e8cc7a',
    },
    rose: {
      bg: hovered ? 'rgba(233,30,140,0.1)' : 'rgba(233,30,140,0.04)',
      border: hovered ? 'rgba(233,30,140,0.5)' : 'rgba(233,30,140,0.18)',
      shadow: hovered ? '0 0 25px rgba(233,30,140,0.18)' : 'none',
      labelColor: '#f472b6',
    },
    ghost: {
      bg: hovered ? 'rgba(245,240,235,0.04)' : 'transparent',
      border: hovered ? 'rgba(245,240,235,0.18)' : 'rgba(245,240,235,0.07)',
      shadow: 'none',
      labelColor: '#9ca3af',
    },
  }[variant]

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className="relative flex items-center justify-between w-full rounded-xl px-5 py-3.5 cursor-pointer overflow-hidden"
      style={{
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        boxShadow: styles.shadow,
        backdropFilter: 'blur(10px)',
        transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
      }}
    >
      <span className="font-display font-bold tracking-wide text-base" style={{ color: styles.labelColor }}>
        {label}
      </span>
      <span className="font-sans text-xs text-cream/35 tracking-wide">{sublabel}</span>

      {hovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 0.5 }}
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)' }}
        />
      )}
    </motion.button>
  )
}

export default function IntroScreen() {
  const startGame = useGameStore(s => s.startGame)
  const [audioStarted, setAudioStarted] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-300, 300], [1.5, -1.5])
  const rotateY = useTransform(mouseX, [-500, 500], [-2.5, 2.5])

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2)
      mouseY.set(e.clientY - window.innerHeight / 2)
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [mouseX, mouseY])

  const handleStart = (mode: 'classic' | 'daily' | 'hardcore') => {
    if (!audioStarted) { audio.intro(); setAudioStarted(true) } else { audio.whoosh() }
    setTimeout(() => startGame(mode), 300)
  }

  return (
    <div className="h-dvh flex flex-col overflow-hidden relative">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 60% 50% at 25% 35%, rgba(201,168,76,0.07) 0%, transparent 60%)',
            'radial-gradient(ellipse 60% 50% at 75% 65%, rgba(233,30,140,0.05) 0%, transparent 60%)',
            '#050505',
          ].join(', '),
        }}
      />

      {/* Floating fragments */}
      {FLOATING_FRAGMENTS.map((text, i) => (
        <FloatingFragment
          key={i} text={text} delay={i * 0.4}
          x={`${5 + (i * 37 + 13) % 85}%`}
          y={`${5 + (i * 29 + 7) % 85}%`}
        />
      ))}

      {/* Content — centred, with consistent side padding */}
      <motion.div
        className="relative z-10 flex flex-col justify-start flex-1 px-6 gap-3"
        style={{
          rotateX, rotateY, perspective: '1000px',
          maxWidth: '36rem', margin: '0 auto', width: '100%',
          paddingTop: 'clamp(3rem, 10vh, 6rem)',
          paddingBottom: 'clamp(2rem, 6vh, 5rem)',
        }}
      >
        {/* Title block */}
        <Title />

        {/* Opening line */}
        <motion.p
          className="font-display italic text-cream/35 text-center leading-relaxed"
          style={{ fontSize: 'clamp(0.8rem, 1.6vw, 0.95rem)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.2 }}
        >
          "In a world where heartbreak and organized crime sound identical..."
        </motion.p>

        {/* Mode buttons */}
        <div className="flex flex-col gap-2.5" style={{ marginTop: 'clamp(1rem, 3.5vh, 2.5rem)' }}>
          <ModeButton label="PLAY" sublabel="50 questions · fresh shuffle" onClick={() => handleStart('classic')} delay={2.6} variant="gold" />
          <ModeButton label="DAILY CHALLENGE" sublabel="10 questions · same for everyone" onClick={() => handleStart('daily')} delay={2.8} variant="rose" />
          <ModeButton label="HARDCORE" sublabel="5s timer · screen bleeds red" onClick={() => handleStart('hardcore')} delay={3.0} variant="ghost" />
        </div>

        {/* Disclaimer */}
        <motion.p
          className="text-xs font-sans text-center"
          style={{ color: 'rgba(245,240,235,0.18)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.4 }}
        >
          Not affiliated with Taylor Swift or Paramount Pictures. Satirical. Obviously. :)
        </motion.p>
      </motion.div>
    </div>
  )
}
