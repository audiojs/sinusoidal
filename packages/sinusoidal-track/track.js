// Sinusoidal analysis — STFT peak picking with parabolic interpolation + nearest-frequency
// partial tracking (McAulay & Quatieri 1986). Returns partial trajectories for additive
// resynthesis (@audio/sinusoidal-synth) and residual extraction (@audio/sinusoidal-residual).

import { fft } from 'fourier-transform'
import window from '@audio/window'

// Cached per frameSize — hann window + its sum (used to normalize peak amplitudes).
let _hannCache = new Map()
export function hann (N) {
	let w = _hannCache.get(N)
	if (w) return w
	let win = window('hann', N, { periodic: true })
	let winSum = 0
	for (let i = 0; i < N; i++) winSum += win[i]
	w = { win, winSum }
	_hannCache.set(N, w)
	return w
}

/**
 * @param {Float32Array} data — mono PCM
 * @param {object} opts — { fs=44100, frameSize=2048, hop=512, maxPartials=40,
 *   threshold=-60 (dB rel max), maxJump=60 (cents partial continuation) }
 * @returns {{ partials: Array<{start:number, freqs:number[], amps:number[]}>,
 *   frames: number, hop: number, frameSize: number, fs: number }}
 */
export default function track (data, { fs = 44100, frameSize = 2048, hop = 512, maxPartials = 40, threshold = -60, maxJump = 60 } = {}) {
	let half = frameSize / 2
	let { win, winSum } = hann(frameSize)
	let buf = new Float64Array(frameSize)
	let nFrames = Math.max(0, Math.floor((data.length - frameSize) / hop) + 1)

	let live = []      // active partials
	let done = []
	for (let t = 0; t < nFrames; t++) {
		for (let i = 0; i < frameSize; i++) buf[i] = data[t * hop + i] * win[i]
		let [re, im] = fft(buf)
		let mag = new Float64Array(half + 1)
		let max = 0
		for (let k = 0; k <= half; k++) { mag[k] = Math.hypot(re[k], im[k]); if (mag[k] > max) max = mag[k] }
		let floor = max * 10 ** (threshold / 20)

		// peaks with parabolic interpolation (dB domain)
		let peaks = []
		for (let k = 2; k < half - 2; k++) {
			if (mag[k] > floor && mag[k] > mag[k - 1] && mag[k] >= mag[k + 1]) {
				let a = Math.log(mag[k - 1] + 1e-12), b = Math.log(mag[k] + 1e-12), c = Math.log(mag[k + 1] + 1e-12)
				let p = 0.5 * (a - c) / (a - 2 * b + c || 1e-12)
				if (!(p > -1 && p < 1)) p = 0
				peaks.push({ freq: (k + p) * fs / frameSize, amp: mag[k] * 2 / winSum })
			}
		}
		peaks.sort((a, b) => b.amp - a.amp)
		peaks = peaks.slice(0, maxPartials)

		// continuation: match each live partial to nearest unclaimed peak within maxJump cents
		let claimed = new Set()
		for (let p of live) {
			let last = p.freqs[p.freqs.length - 1]
			let best = -1, bestC = maxJump
			for (let j = 0; j < peaks.length; j++) {
				if (claimed.has(j)) continue
				let c = Math.abs(1200 * Math.log2(peaks[j].freq / last))
				if (c < bestC) { bestC = c; best = j }
			}
			if (best >= 0) {
				claimed.add(best)
				p.freqs.push(peaks[best].freq)
				p.amps.push(peaks[best].amp)
			} else p.dead = true
		}
		done.push(...live.filter(p => p.dead))
		live = live.filter(p => !p.dead)
		for (let j = 0; j < peaks.length; j++) {
			if (!claimed.has(j)) live.push({ start: t, freqs: [peaks[j].freq], amps: [peaks[j].amp] })
		}
	}
	done.push(...live)
	// keep partials lasting ≥ 3 frames
	let partials = done.filter(p => p.freqs.length >= 3)
	return { partials, frames: nFrames, hop, frameSize, fs }
}
