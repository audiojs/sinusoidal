/** Sinusoidal analysis — STFT peak picking + nearest-frequency partial tracking (McAulay-Quatieri 1986). */
export interface TrackOptions {
  /** sample rate, default 44100 */
  fs?: number
  /** STFT frame, default 2048 */
  frameSize?: number
  /** STFT hop, default 512 */
  hop?: number
  /** peaks kept per frame, default 40 */
  maxPartials?: number
  /** peak floor, dB relative to frame max, default -60 */
  threshold?: number
  /** max cents jump for partial continuation, default 60 */
  maxJump?: number
}

export interface Partial {
  /** frame index where the partial starts */
  start: number
  freqs: number[]
  amps: number[]
}

export interface SinusoidalModel {
  /** trajectories lasting >= 3 frames */
  partials: Partial[]
  frames: number
  hop: number
  frameSize: number
  fs: number
}

/** Cached hann window + its sum, keyed by frame size (used to normalize peak amplitudes). */
export function hann(N: number): { win: Float64Array, winSum: number }

export default function track(data: Float32Array, options?: TrackOptions): SinusoidalModel
