import { Suspense, lazy } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from './store/gameStore'
import IntroScreen from './components/intro/IntroScreen'
import GameScreen from './components/game/GameScreen'
import GameOver from './components/game/GameOver'
import CinematicOverlay from './components/effects/CinematicOverlay'

const ParticleField = lazy(() => import('./components/canvas/ParticleField'))

function SceneTransition({ children, sceneKey }: { children: React.ReactNode; sceneKey: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sceneKey}
        className="min-h-screen w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  const phase = useGameStore(s => s.phase)

  return (
    <div className="relative min-h-screen bg-noir-950 overflow-hidden">
      <Suspense fallback={null}>
        <ParticleField />
      </Suspense>

      <CinematicOverlay />

      <div className="relative z-10">
        {phase === 'intro' && (
          <SceneTransition sceneKey="intro">
            <IntroScreen />
          </SceneTransition>
        )}

        {(phase === 'game' || phase === 'reveal') && (
          <SceneTransition sceneKey="game">
            <GameScreen />
          </SceneTransition>
        )}

        {phase === 'gameover' && (
          <SceneTransition sceneKey="gameover">
            <GameOver />
          </SceneTransition>
        )}
      </div>
    </div>
  )
}
