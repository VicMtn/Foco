let context: AudioContext | null = null

function ctx(): AudioContext {
  if (context === null) context = new AudioContext()
  if (context.state === 'suspended') void context.resume()
  return context
}

export function playCompletionChime(): void {
  const audio = ctx()
  const now = audio.currentTime
  ping(audio, now, 880)
  ping(audio, now + 0.18, 1175)
}

function ping(audio: AudioContext, at: number, frequency: number) {
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = 'sine'
  osc.frequency.value = frequency
  osc.connect(gain)
  gain.connect(audio.destination)
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(0.25, at + 0.03)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.45)
  osc.start(at)
  osc.stop(at + 0.5)
}
