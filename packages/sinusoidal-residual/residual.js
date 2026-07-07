// Residual — input minus additive resynthesis of its tracked partials: the noise layer
// of the sinusoids+noise model (Serra-Smith SMS). Phase-blind subtraction is imperfect
// per partial, so the sinusoidal layer is estimated and the residual computed spectrally:
// per frame, subtract the tracked partials' magnitude from the input magnitude (Wiener-style
// soft mask), then resynthesize with the input phase — robust without original-phase tracking.

import { fft, ifft } from 'fourier-transform'
import track from '@audio/sinusoidal-track'

/**
 * @param {Float32Array} data — mono PCM
 * @param {object} opts — track options; also { model } to reuse an existing analysis
 * @returns {Float32Array} residual (same length)
 */
export default function residual (data, opts = {}) {
	let model = opts.model || track(data, opts)
	let { frames, hop, frameSize, fs } = model
	let half = frameSize / 2

	// per-frame set of partial (freq, amp)
	let perFrame = Array.from({ length: frames }, () => [])
	for (let p of model.partials) {
		for (let j = 0; j < p.freqs.length; j++) {
			let t = p.start + j
			if (t < frames) perFrame[t].push([p.freqs[j], p.amps[j]])
		}
	}

	let win = new Float64Array(frameSize)
	let winSum = 0
	for (let i = 0; i < frameSize; i++) { win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / frameSize); winSum += win[i] }
	let buf = new Float64Array(frameSize)
	let out = new Float64Array(data.length)
	let norm = new Float64Array(data.length)

	for (let t = 0; t < frames; t++) {
		for (let i = 0; i < frameSize; i++) buf[i] = (data[t * hop + i] || 0) * win[i]
		let fr = fft(buf)
		let re = Float64Array.from(fr[0]), im = Float64Array.from(fr[1])
		// sinusoidal magnitude estimate per bin (hann mainlobe ≈ 2 bins wide)
		for (let [f, a] of perFrame[t]) {
			let kc = f * frameSize / fs
			let k0 = Math.max(0, Math.floor(kc - 3)), k1 = Math.min(half, Math.ceil(kc + 3))
			let peakMag = a * winSum / 2
			for (let k = k0; k <= k1; k++) {
				let d = Math.abs(k - kc)
				let lobe = d < 1 ? 1 : d < 2 ? 0.35 : d < 3 ? 0.08 : 0.02
				let m = Math.hypot(re[k], im[k])
				let sub = Math.min(m, peakMag * lobe)
				if (m > 1e-12) {
					let g = (m - sub) / m
					re[k] *= g; im[k] *= g
				}
			}
		}
		let y = ifft(re, im)
		for (let i = 0; i < frameSize; i++) {
			let j = t * hop + i
			if (j >= data.length) break
			out[j] += y[i] * win[i]
			norm[j] += win[i] * win[i]
		}
	}
	let res = new Float32Array(data.length)
	for (let i = 0; i < data.length; i++) res[i] = norm[i] > 1e-9 ? out[i] / norm[i] : data[i]
	return res
}
