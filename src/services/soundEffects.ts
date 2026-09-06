// Web Audio API sound generator for LYX
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Som sutil de ativação: acorde harmônico suave e futurista em ascensão (pulsação suave).
 */
export function playPowerOnSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.setValueAtTime(0.001, now);
  masterGain.gain.exponentialRampToValueAtTime(0.14, now + 0.05);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

  // Frequências harmônicas suaves (392Hz - G4, 587.33Hz - D5, 783.99Hz - G5)
  const freqs = [392.0, 587.33, 783.99];
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 0.95, now);
    osc.frequency.exponentialRampToValueAtTime(freq, now + 0.12);

    oscGain.gain.setValueAtTime(0.001, now);
    oscGain.gain.linearRampToValueAtTime(0.15 / (idx + 1), now + 0.04 + idx * 0.02);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35 + idx * 0.04);

    osc.connect(oscGain);
    oscGain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.45);
  });
}

/**
 * Som sutil de desativação: pulsação descendente suave e tranquila.
 */
export function playPowerOffSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.setValueAtTime(0.001, now);
  masterGain.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(520, now);
  osc.frequency.exponentialRampToValueAtTime(260, now + 0.28);

  osc.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.35);
}
