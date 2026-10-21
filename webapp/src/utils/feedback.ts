let audio: AudioContext | null = null

// iOS only plays Web Audio after a tap has resumed the context: call from a click.
export function unlockAudio() {
  try {
    audio ??= new AudioContext()
    void audio.resume()
  } catch {
    // Audio is a nice-to-have.
  }
}

function tone(frequency: number, at: number, length: number, volume: number) {
  if (!audio) return
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(volume, at)
  gain.gain.exponentialRampToValueAtTime(0.001, at + length)
  osc.connect(gain).connect(audio.destination)
  osc.start(at)
  osc.stop(at + length)
}

// Short rising two-note chime.
export function chime() {
  unlockAudio()
  if (!audio) return
  tone(660, audio.currentTime, 0.35, 0.15)
  tone(990, audio.currentTime + 0.12, 0.35, 0.15)
}

// Hot/cold tick: `closeness` 0 (far) → 1 (on target) raises the pitch.
export function tick(closeness: number) {
  if (audio) tone(300 + closeness * 900, audio.currentTime, 0.05, 0.08)
  buzz(12)
}

// iOS Safari has no vibration API, but since iOS 18 toggling a native switch
// control gives a light haptic tap, even when toggled from script.
// ponytail: undocumented WebKit behaviour; sound is the guaranteed channel.
function iosHaptic() {
  const label = document.createElement('label')
  label.ariaHidden = 'true'
  label.style.display = 'none'
  const input = document.createElement('input')
  input.type = 'checkbox'
  input.setAttribute('switch', '')
  label.appendChild(input)
  document.head.appendChild(label)
  label.click()
  label.remove()
}

export function buzz(pattern: number | number[]) {
  // Browsers refuse (and log an error) before the first tap.
  if (navigator.userActivation?.hasBeenActive === false) return
  if (navigator.vibrate) {
    navigator.vibrate(pattern)
  } else {
    iosHaptic()
  }
}
