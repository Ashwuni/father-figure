import { create } from 'zustand'
import type { Quote } from '../data/quotes'
import { ALL_QUOTES, shuffleQuotes, getDailyQuotes } from '../data/quotes'

export type GamePhase = 'intro' | 'game' | 'reveal' | 'gameover'
export type GameMode = 'classic' | 'hardcore' | 'daily'
export type LastAnswer = 'correct' | 'wrong' | 'timeout' | null

const ROUND_SIZES: Record<GameMode, number> = {
  classic: 50,
  hardcore: 50,
  daily: 10,
}

const HARDCORE_TIME = 5

interface GameState {
  phase: GamePhase
  mode: GameMode
  quotes: Quote[]
  currentIndex: number
  score: number
  streak: number
  bestStreak: number
  totalAnswered: number
  correctAnswers: number
  comboMultiplier: number
  lastAnswer: LastAnswer
  lastChoice: 'taylor' | 'godfather' | null
  hardcoreTimeLeft: number
  isTimerRunning: boolean
  isPaused: boolean
  currentQuote: Quote | null

  startGame: (mode?: GameMode) => void
  submitAnswer: (choice: 'taylor' | 'godfather') => void
  timeExpired: () => void
  nextQuote: () => void
  restartGame: () => void
  goToIntro: () => void
  togglePause: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'intro',
  mode: 'classic',
  quotes: [],
  currentIndex: 0,
  score: 0,
  streak: 0,
  bestStreak: 0,
  totalAnswered: 0,
  correctAnswers: 0,
  comboMultiplier: 1,
  lastAnswer: null,
  lastChoice: null,
  hardcoreTimeLeft: HARDCORE_TIME,
  isTimerRunning: false,
  isPaused: false,
  currentQuote: null,

  startGame: (mode = 'classic') => {
    const size = ROUND_SIZES[mode]
    const quotes = mode === 'daily'
      ? getDailyQuotes()
      : shuffleQuotes(ALL_QUOTES).slice(0, size)
    set({
      phase: 'game',
      mode,
      quotes,
      currentIndex: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      totalAnswered: 0,
      correctAnswers: 0,
      comboMultiplier: 1,
      lastAnswer: null,
      lastChoice: null,
      hardcoreTimeLeft: HARDCORE_TIME,
      isTimerRunning: true,
      isPaused: false,
      currentQuote: quotes[0] ?? null,
    })
  },

  submitAnswer: (choice) => {
    const { currentQuote, streak, bestStreak, score, correctAnswers, totalAnswered, comboMultiplier } = get()
    if (!currentQuote) return

    const isCorrect = choice === currentQuote.source
    const newStreak = isCorrect ? streak + 1 : 0
    const newBestStreak = Math.max(newStreak, bestStreak)
    const newMultiplier = Math.min(1 + Math.floor(newStreak / 3) * 0.5, 4)
    const pointsEarned = isCorrect ? Math.round(100 * comboMultiplier) : 0

    set({
      phase: 'reveal',
      lastAnswer: isCorrect ? 'correct' : 'wrong',
      lastChoice: choice,
      streak: newStreak,
      bestStreak: newBestStreak,
      score: score + pointsEarned,
      correctAnswers: isCorrect ? correctAnswers + 1 : correctAnswers,
      totalAnswered: totalAnswered + 1,
      comboMultiplier: newMultiplier,
      isTimerRunning: false,
    })
  },

  timeExpired: () => {
    const { currentQuote, bestStreak, totalAnswered } = get()
    if (!currentQuote) return
    set({
      phase: 'reveal',
      lastAnswer: 'timeout',
      lastChoice: null,
      streak: 0,
      bestStreak,
      totalAnswered: totalAnswered + 1,
      comboMultiplier: 1,
      isTimerRunning: false,
    })
  },

  nextQuote: () => {
    const { quotes, currentIndex, mode } = get()
    const nextIndex = currentIndex + 1

    if (nextIndex >= quotes.length) {
      set({ phase: 'gameover', isTimerRunning: false })
      return
    }

    set({
      phase: 'game',
      currentIndex: nextIndex,
      currentQuote: quotes[nextIndex],
      lastAnswer: null,
      lastChoice: null,
      hardcoreTimeLeft: HARDCORE_TIME,
      isTimerRunning: mode === 'hardcore',
    })
  },

  restartGame: () => get().startGame(get().mode),

  goToIntro: () => set({
    phase: 'intro',
    isTimerRunning: false,
    isPaused: false,
    lastAnswer: null,
    lastChoice: null,
  }),

  togglePause: () => set(s => ({ isPaused: !s.isPaused })),
}))

export { HARDCORE_TIME }
