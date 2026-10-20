/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Procedural Web Audio API Sound Engine for Alexandria Taxi 3D Simulator
// 100% zero external dependencies, robust and safe on mobile & desktop browsers.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private seaGain: GainNode | null = null;
  private hornGain: GainNode | null = null;
  private isEngineRunning: boolean = false;
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    // Initialized on first user interaction to comply with browser autoplay policies
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.buildNoiseBuffer();
      this.startSeaAmbience();
      this.startEngineAudio();
    } catch {
      // AudioContext unavailable in silent environments
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.engineGain && this.ctx) {
      this.engineGain.gain.setValueAtTime(muted ? 0 : 0.12, this.ctx.currentTime);
    }
    if (this.seaGain && this.ctx) {
      this.seaGain.gain.setValueAtTime(muted ? 0 : 0.08, this.ctx.currentTime);
    }
  }

  private buildNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  private startEngineAudio() {
    if (!this.ctx || this.isEngineRunning) return;
    try {
      // Dual oscillator engine model with waveshaper
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // Base idle RPM

      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(320, this.ctx.currentTime);

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(this.isMuted ? 0 : 0.1, this.ctx.currentTime);

      this.engineOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start();
      this.isEngineRunning = true;
    } catch {
      // ignore
    }
  }

  public updateEnginePitch(speedRatio: number, isAccelerating: boolean) {
    if (!this.ctx || !this.engineOsc || !this.engineFilter || !this.engineGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const clamped = Math.max(0, Math.min(1, Math.abs(speedRatio)));

    // RPM formula: idle 55Hz up to ~220Hz
    const targetFreq = 52 + clamped * 130 + (isAccelerating ? 25 : 0);
    const targetCutoff = 260 + clamped * 850 + (isAccelerating ? 300 : 0);
    const targetVol = isAccelerating ? 0.18 : 0.08 + clamped * 0.06;

    this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.08);
    this.engineFilter.frequency.setTargetAtTime(targetCutoff, now, 0.08);
    this.engineGain.gain.setTargetAtTime(targetVol, now, 0.08);
  }

  public playHorn() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    try {
      // Classic dual-tone Alexandria taxi horn (F4 349Hz + A4 440Hz)
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(370, now);
      osc2.frequency.setValueAtTime(466, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch {
      // fallback
    }
  }

  public playBrakeScreech() {
    if (!this.ctx || !this.noiseBuffer || this.isMuted) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      const source = this.ctx.createBufferSource();
      source.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(4, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      source.start(now);
      source.stop(now + 0.28);
    } catch {
      // ignore
    }
  }

  public playCollision() {
    if (!this.ctx || !this.noiseBuffer || this.isMuted) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      // Sub impact
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.3);
      oscGain.gain.setValueAtTime(0.4, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);

      // Metal crunch noise
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, now);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + 0.25);
    } catch {
      // ignore
    }
  }

  public playMeterBeep() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // ignore
    }
  }

  public playDoorThud() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.18);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // ignore
    }
  }

  public playCashRegister() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      [1046, 1318, 1567].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.12, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.15);
      });
    } catch {
      // ignore
    }
  }

  private startSeaAmbience() {
    if (!this.ctx || !this.noiseBuffer) return;
    try {
      const source = this.ctx.createBufferSource();
      source.buffer = this.noiseBuffer;
      source.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, this.ctx.currentTime);

      this.seaGain = this.ctx.createGain();
      this.seaGain.gain.setValueAtTime(this.isMuted ? 0 : 0.07, this.ctx.currentTime);

      // Low frequency wave modulation (swell)
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime); // ~5.5s wave period
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      source.connect(filter);
      filter.connect(this.seaGain);
      this.seaGain.connect(this.ctx.destination);

      lfo.start();
      source.start();
    } catch {
      // ignore
    }
  }
}

export const soundEngine = new SoundEngine();
