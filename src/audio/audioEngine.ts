// Procedural audio engine using Web Audio API
// No external files needed — all sounds synthesized

let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function createReverb(ctx: AudioContext, duration = 1.5, decay = 2): ConvolverNode {
  const convolver = ctx.createConvolver()
  const rate = ctx.sampleRate
  const length = rate * duration
  const impulse = ctx.createBuffer(2, length, rate)
  for (let c = 0; c < 2; c++) {
    const channel = impulse.getChannelData(c)
    for (let i = 0; i < length; i++) {
      channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
    }
  }
  convolver.buffer = impulse
  return convolver
}

function playTone(
  frequency: number,
  type: OscillatorType,
  duration: number,
  volume: number,
  attack = 0.01,
  release = 0.1,
  delay = 0
) {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(frequency, ctx.currentTime)

  gain.gain.setValueAtTime(0, ctx.currentTime + delay)
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + attack)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration - release)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime + delay)
  osc.stop(ctx.currentTime + delay + duration)
}

function playNoise(duration: number, volume: number, lowpass: number, delay = 0) {
  const ctx = getCtx()
  const bufSize = ctx.sampleRate * duration
  const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1

  const source = ctx.createBufferSource()
  source.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = lowpass

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, ctx.currentTime + delay)
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start(ctx.currentTime + delay)
}

export const audio = {
  correct() {
    // Triumphant chord sweep
    const notes = [261.63, 329.63, 392.0, 523.25] // C major chord
    notes.forEach((freq, i) => {
      playTone(freq, 'sine', 0.6, 0.12, 0.02, 0.4, i * 0.04)
    })
    playTone(523.25, 'triangle', 0.4, 0.08, 0.01, 0.3, 0.16)
    playNoise(0.08, 0.03, 2000)
  },

  wrong() {
    // Dissonant drop
    playTone(180, 'sawtooth', 0.3, 0.15, 0.01, 0.25)
    playTone(170, 'sawtooth', 0.3, 0.1, 0.01, 0.25, 0.02)
    playTone(120, 'sine', 0.4, 0.12, 0.01, 0.3, 0.1)
    playNoise(0.15, 0.05, 800)
  },

  choose() {
    // Tactile click + soft tone
    playNoise(0.03, 0.08, 4000)
    playTone(600, 'sine', 0.08, 0.05, 0.001, 0.07)
  },

  streak(count: number) {
    // Escalating triumph based on streak
    const base = 261.63
    const mul = 1 + (count / 20)
    const notes = [base * mul, base * mul * 1.25, base * mul * 1.5]
    notes.forEach((freq, i) => {
      playTone(freq, 'triangle', 0.5, 0.1, 0.02, 0.35, i * 0.06)
    })
    // Cinematic swell
    playTone(base * mul * 2, 'sine', 0.6, 0.08, 0.05, 0.5, 0.18)
  },

  whoosh() {
    // Scene transition
    const ctx = getCtx()
    const bufSize = ctx.sampleRate * 0.6
    const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1

    const source = ctx.createBufferSource()
    source.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(200, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 0.3)
    filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.6)
    filter.Q.value = 2

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start()
  },

  intro() {
    // Cinematic boom + reverb tail
    const ctx = getCtx()
    const reverb = createReverb(ctx, 2.5, 3)

    const boom = ctx.createOscillator()
    const boomGain = ctx.createGain()
    boom.type = 'sine'
    boom.frequency.setValueAtTime(60, ctx.currentTime)
    boom.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.5)
    boomGain.gain.setValueAtTime(0.4, ctx.currentTime)
    boomGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5)
    boom.connect(boomGain)
    boomGain.connect(reverb)
    reverb.connect(ctx.destination)
    boom.start()
    boom.stop(ctx.currentTime + 1.5)

    // High shimmer
    setTimeout(() => {
      playTone(1200, 'sine', 2, 0.04, 0.5, 1.5)
      playTone(900, 'sine', 2, 0.03, 0.5, 1.5, 0.2)
    }, 500)
  },

  gameover() {
    // Descending dramatic close
    const notes = [392, 349, 311, 261]
    notes.forEach((freq, i) => {
      playTone(freq, 'triangle', 1, 0.1, 0.05, 0.8, i * 0.3)
    })
    setTimeout(() => playTone(130, 'sine', 2, 0.15, 0.1, 1.8), 1200)
  },

  vinylCrackle() {
    // Ambient vinyl noise loop (call repeatedly)
    playNoise(0.1, 0.006, 3000)
  },
}
