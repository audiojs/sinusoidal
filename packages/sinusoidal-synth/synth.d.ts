/** Additive resynthesis from partial trajectories — interpolated freq/amp, integrated phase (McAulay-Quatieri 1986). */
export interface SinusoidalPartial {
  /** frame index where the partial starts */
  start: number
  freqs: number[]
  amps: number[]
}

/** Shape produced by @audio/sinusoidal-track. */
export interface SinusoidalModel {
  partials: SinusoidalPartial[]
  frames: number
  hop: number
  frameSize: number
  fs: number
}

export interface SynthOptions {
  /** output length, samples; default frames*hop + frameSize */
  length?: number
}

export default function synth(model: SinusoidalModel, options?: SynthOptions): Float32Array
