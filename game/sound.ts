// Web Audio API procedural sound engine for Relic Capital
// Zero external assets: runs entirely client-side with 0 latency, 0 bandwidth, and full offline support.

let audioCtx: AudioContext | null = null;
let muted: boolean = false;
let ambientGain: GainNode | null = null;
let ambientRunning: boolean = false;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isMuted(): boolean {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("relic_capital_muted");
    if (saved !== null) muted = saved === "true";
  }
  return muted;
}

export function setMuted(m: boolean): boolean {
  muted = m;
  if (typeof window !== "undefined") {
    localStorage.setItem("relic_capital_muted", String(m));
  }
  if (ambientGain) {
    ambientGain.gain.value = m ? 0 : 0.05;
  }
  return muted;
}

export function toggleMute(): boolean {
  return setMuted(!isMuted());
}

/** Crisp metallic coin chime for payments, grants, and market transactions */
export function playCoinSound() {
  if (isMuted()) return;
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = "sine";
  osc1.frequency.setValueAtTime(987.77, now); // B5
  osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08); // E6

  osc2.type = "sine";
  osc2.frequency.setValueAtTime(1318.51, now + 0.06);
  osc2.frequency.exponentialRampToValueAtTime(1975.53, now + 0.22); // B6

  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now + 0.06);
  osc1.stop(now + 0.35);
  osc2.stop(now + 0.35);
}

/** Textured soil scrape / trowel sound for excavation actions */
export function playDigSound() {
  if (isMuted()) return;
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const bufferSize = ctx.sampleRate * 0.18;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.45));
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(450, now);
  filter.frequency.linearRampToValueAtTime(220, now + 0.18);
  filter.Q.value = 3.0;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.22, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + 0.18);
}

/** Resonant bronze bell chime for recovering rare artifacts */
export function playDiscoverySound() {
  if (isMuted()) return;
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const freqs = [392.0, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6 (harmonious pentatonic bell)

  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + idx * 0.04);

    const startTime = now + idx * 0.04;
    gain.gain.setValueAtTime(0.12 / (idx + 1), startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 1.25);
  });
}

/** Scholarly paper rustle & celebratory stamp when publishing a monograph */
export function playPublishSound() {
  if (isMuted()) return;
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Deep stamp impact
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.25);
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.3);

  // High brass fanfare chime
  [587.33, 880.0, 1174.66].forEach((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(f, now + 0.1 + i * 0.08);
    g.gain.setValueAtTime(0.1, now + 0.1 + i * 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.8 + i * 0.08);

    o.connect(g);
    g.connect(ctx.destination);
    o.start(now + 0.1 + i * 0.08);
    o.stop(now + 0.85 + i * 0.08);
  });
}

/** Glass harmonic tone when scientific verification passes */
export function playVerifySound() {
  if (isMuted()) return;
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  [880.0, 1108.73, 1318.51].forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + idx * 0.05);
    gain.gain.setValueAtTime(0.08, now + idx * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.05);
    osc.stop(now + 0.65);
  });
}

/** Subtle tactile wooden click for UI navigation */
export function playClickSound() {
  if (isMuted()) return;
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.04);
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.04);
}
