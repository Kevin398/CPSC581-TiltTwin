let audio: AudioContext | null = null

// Short rising two-note chime. Silent if the browser blocks audio.
export function chime() {
  try {
    audio ??= new AudioContext()
    const start = audio.currentTime
    for (const [i, frequency] of [660, 990].entries()) {
      const osc = audio.createOscillator()
      const gain = audio.createGain()
      osc.frequency.value = frequency
      gain.gain.setValueAtTime(0.15, start + i * 0.12)
      gain.gain.exponentialRampToValueAtTime(0.001, start + i * 0.12 + 0.35)
      osc.connect(gain).connect(audio.destination)
      osc.start(start + i * 0.12)
      osc.stop(start + i * 0.12 + 0.35)
    }
  } catch {
    // Audio is a nice-to-have.
  }
}

// Android only; iOS Safari has no vibration API.
export function buzz(pattern: number | number[]) {
  // Browsers refuse (and log an error) before the first tap.
  if (navigator.userActivation?.hasBeenActive === false) return
  navigator.vibrate?.(pattern)
}
