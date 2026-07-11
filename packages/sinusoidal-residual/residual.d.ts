import type { SinusoidalModel, TrackOptions } from '@audio/sinusoidal-track'

/** Residual noise layer — input minus additive resynthesis of tracked partials (Serra-Smith SMS). */
export interface ResidualOptions extends TrackOptions {
  /** reuse an existing analysis instead of re-tracking */
  model?: SinusoidalModel
}

/** data: mono PCM. Returns a Float32Array the same length as data. */
export default function residual(data: Float32Array, options?: ResidualOptions): Float32Array
