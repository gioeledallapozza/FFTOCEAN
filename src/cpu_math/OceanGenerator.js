import Complex from './Complex.js';
import { calculatePhillips, calculateH0 } from './Phillips.js';
import { computeIFFT2D } from './IFFT.js';

//STATIC OCEAN GENERATOR

/**
 * Generates the initial ocean spectrum (Heightmap at T=0).
 * @param {Number} N - Grid resolution (must be power of 2).
 * @param {Number} patchSize - Physical size of the patch in meters.
 * @param {Number} windSpeed - Wind speed in m/s.
 * @param {Object} windDirection - Normalized wind direction {x, y}.
 * @param {Number} amplitude - Global amplitude scaling factor.
 * @returns {Complex[][]} 2D grid of complex numbers in frequency domain.
 */
export function generateInitialSpectrum(N, patchSize, windSpeed, windDirection, amplitude) {
    let spectrum = new Array(N);

    for (let y = 0; y < N; y++) {
        spectrum[y] = new Array(N);
        for (let x = 0; x < N; x++) {
            
            // Center the wave vectors around (0,0) by shifting the indices
            let nx = x < N / 2 ? x : x - N;
            let ny = y < N / 2 ? y : y - N;

            const kx = (2 * Math.PI / patchSize) * nx;
            const ky = (2 * Math.PI / patchSize) * ny;
            const kVector = { x: kx, y: ky };

            // Phillips Spectrum Energy
            const energy = calculatePhillips(amplitude, kVector, windSpeed, windDirection);

            // Initial Gaussian Phase
            let h0 = calculateH0(energy);

            spectrum[y][x] = h0;
        }
    }

    return spectrum;
}

/**
 * High-level helper to get the final spatial heightmap (real values).
 */
export function generateOceanHeightBuffer(N, patchSize, windSpeed, windDirection, amplitude) {
    const initialSpectrum = generateInitialSpectrum(N, patchSize, windSpeed, windDirection, amplitude);
    const spatialGrid = computeIFFT2D(initialSpectrum);

    // Allocate GPU memory
    const floatBuffer = new Float32Array(N * N);

    // Transform the matrix in a Float array for texture
    for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
            const linearIndex = (y * N) + x;
            floatBuffer[linearIndex] = spatialGrid[y][x].re;
        }
    }

    return floatBuffer;
}