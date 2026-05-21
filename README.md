<div align="center">

# Father Figure

**A cinematic quote game — can you tell Taylor Swift from The Godfather?**

[![Live Demo](https://img.shields.io/badge/▶_Play_Live-father--figure.vercel.app-c9a84c?style=for-the-badge&labelColor=0a0a0a)](https://father-figure.vercel.app)

<!-- Replace this line with your GIF: ![Gameplay](./demo.gif) -->

</div>

---

## Overview

One quote at a time. Two suspects. You decide: Taylor Swift or The Godfather trilogy?

The humor comes from how strangely similar they sound — revenge energy, betrayal, family loyalty, heartbreak, power. The game presents 320 curated quotes across three modes: a 50-question classic run, a 10-question daily challenge seeded by date (same quotes for everyone on the same day), and a hardcore mode with a 5-second countdown timer and a screen that bleeds red as time runs out.

The goal was to build something that feels cinematic and overengineered in the best possible way.

---

## Tech Stack

| | |
|---|---|
| **Framework** | React 18 + TypeScript |
| **Build** | Vite |
| **Styling** | Tailwind CSS v3 |
| **Animation** | Framer Motion — spring physics, kinetic typography, AnimatePresence |
| **3D Effects** | React Three Fiber + Three.js — particle field that intensifies with streak |
| **State** | Zustand |
| **Audio** | Web Audio API — fully synthesized, zero audio files |

---

## Architecture

```
src/
├── audio/
│   └── audioEngine.ts       # Procedural sound — correct answers, wrong, streaks, whooshes
├── components/
│   ├── canvas/              # React Three Fiber particle background
│   ├── effects/             # Film grain (canvas), vignette, red screen bleed (hardcore)
│   ├── game/                # QuoteCard, ChoiceButtons, StreakDisplay, RevealOverlay, HardcoreTimer
│   └── intro/               # Cinematic intro with parallax mouse tracking
├── data/
│   └── quotes.ts            # 320 quotes with metadata — tone, intensity, ambiguity score, commentary
├── store/
│   └── gameStore.ts         # Zustand — game phase, scoring, streak, timer, pause state
└── App.tsx                  # Scene router with AnimatePresence transitions
```

---

## Quote Schema

Each quote carries metadata that drives the UI:

```typescript
interface Quote {
  id: string
  text: string
  source: 'taylor' | 'godfather'
  context: string        // album / film + year
  tone: QuoteTone        // romantic | threatening | vengeful | family | power | heartbreak | ...
  intensity: 1 | 2 | 3 | 4 | 5
  ambiguityScore: number // 0–10 — higher means harder to identify
  commentary: string     // shown after reveal — the comedy layer
}
```

Quotes were selected for maximum thematic overlap: lines where revenge sounds like heartbreak, loyalty sounds like a mob oath, and power sounds like a bridge drop.

---

## Features

**Gameplay**
- 320 curated quotes — 160 Taylor Swift, 160 Godfather
- Classic mode: 50 questions, reshuffled every run
- Daily challenge: 10 questions, deterministically seeded by date — same for everyone
- Hardcore: 5-second countdown per question, auto-wrong on timeout
- Streak + combo multiplier system — 3x streak unlocks 1.5× score multiplier, up to 4×
- Pause / quit with cinematic modal overlays

**Visuals**
- Kinetic word-by-word typography animation on every quote
- React Three Fiber particle field that reacts to streak count
- Real-time film grain rendered on a canvas overlay
- Radial vignette that intensifies with streak
- Hardcore mode: timer bar shifts gold → orange → red, screen bleeds red from the edges, number pulses when critical
- All scene transitions via Framer Motion AnimatePresence

**Audio**
- All sounds synthesized at runtime using the Web Audio API — no audio files
- Correct answer: ascending major chord sweep
- Wrong answer: dissonant sawtooth drop with noise burst
- Streak: escalating harmonic swell scaled to combo count
- Scene transitions: filtered noise whoosh
- Intro: cinematic low boom with reverb tail

**End screen**
- Personality verdict based on accuracy + best streak (8 tiers from "THE GODSWIFT" to "CONFUSED CIVILIAN")
- Animated score ring
- Shareable result card via Web Share API with clipboard fallback

---

## Controls

`A` / `←` — Taylor Swift &nbsp;·&nbsp; `D` / `→` — The Godfather &nbsp;·&nbsp; `Space` / `Enter` — next quote &nbsp;·&nbsp; `Esc` — pause

---

## Run locally

```bash
npm install
npm run dev      # → http://localhost:5173
npm run build    # production build → dist/
```

---

<div align="center">
  <sub>Built with React · TypeScript · Vite · Tailwind · Framer Motion · Three.js · Zustand</sub>
</div>
