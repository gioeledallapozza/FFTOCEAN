import Complex from './Complex.js';
import { calculatePhillips, calculateH0 } from './Phillips.js';
import { computeIFFT2D } from './IFFT.js';

// OCEAN ENGINE FOR DYNAMIC HEIGHTMAP GENERATION
export class OceanEngine {
    constructor(N, patchSize, windSpeed, windDirection, amplitude) {
        this.N = N;
        this.h0Grid = new Array(N);    // Basic spectrum at T = 0 (complex numbers)
        this.omegaGrid = new Array(N); // Propagation velocities, precomputed for efficiency

        const dk = (2 * Math.PI) / patchSize;

        //Calculate initial spectrum and angular frequencies
        for (let y = 0; y < N; y++) {
            this.h0Grid[y] = new Array(N);
            this.omegaGrid[y] = new Float32Array(N);

            for (let x = 0; x < N; x++) {
                let nx = x < N / 2 ? x : x - N;
                let ny = y < N / 2 ? y : y - N;

                const kx = dk * nx;
                const ky = dk * ny;
                const kVector = { x: kx, y: ky };
            

                // magnitude of the wave
                const kMag = Math.sqrt(kx*kx + ky*ky);

                //Calculare the angular frequency = sqrt(g * kMag) 
                if (kMag < 0.000001) {
                    this.omegaGrid[y][x] = 0.0;
                } else {
                    this.omegaGrid[y][x] = Math.sqrt(9.81 * kMag); //It's always the same for the same wave vector, so we can precompute it
                }

                // Generate the spectrum at T=0
                const energy = calculatePhillips(amplitude, kVector, windSpeed, windDirection);
                this.h0Grid[y][x] = calculateH0(energy, dk);
            }
        }
    }

    generateFrame(time) {
        let spectrumTime = new Array(this.N);

        for (let y = 0; y < this.N; y++) {
            spectrumTime[y] = new Array(this.N);
            for (let x = 0; x < this.N; x++) {
                
                let h0 = this.h0Grid[y][x];
                let omega = this.omegaGrid[y][x];

                let phase = omega * time; //velocity * time = phase shift to apply

                //Rotate the spectrum by the phase to get the time-evolved spectrum
                let cosPhase = Math.cos(phase);
                let sinPhase = Math.sin(phase);
                let euler = new Complex(cosPhase, sinPhase);

                spectrumTime[y][x] = h0.multiply(euler);
            }
        }

        const spatialGrid = computeIFFT2D(spectrumTime); //Ricalculates the heightmap for the current time without recalculating the spectrum (h0) with phillips
        
        // Prepare buffer for Texture
        const floatBuffer = new Float32Array(this.N * this.N);

        for (let y = 0; y < this.N; y++) {
            for (let x = 0; x < this.N; x++) {
                const linearIndex = (y * this.N) + x;
                floatBuffer[linearIndex] = spatialGrid[y][x].re;
            }
        }

        return floatBuffer;
    }
}