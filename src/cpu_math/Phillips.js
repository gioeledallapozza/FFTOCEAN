import Complex from './Complex.js';

/**
 * Calculates the Phillips spectrum energy for a given wave vector.
 * @param {Number} amplitudeA - Global amplitude constant (Ocean volume).
 * @param {Object} kVector - The wave vector {x, y}.
 * @param {Number} windSpeed - Speed of the wind in m/s.
 * @param {Object} windDirection - Normalized unit vector {x, y} representing wind direction.
 * @returns {Number} The energy value for this specific wave.
 */
export function calculatePhillips(amplitudeA, kVector, windSpeed, windDirection) {
    const kMagnitude = Math.sqrt(kVector.x * kVector.x + kVector.y * kVector.y);

    // Prevent division by zero at the center of the grid (k=0)
    if (kMagnitude < 0.000001) {
        return 0.0;
    }

    const L = (windSpeed ** 2) / 9.81; // Largest possible wave size
    
    // Normalize wave vector to get wave direction
    const kHat = {
        x: kVector.x / kMagnitude,
        y: kVector.y / kMagnitude
    };

    // Dot product between wave direction and wind direction
    const kDotW = (kHat.x * windDirection.x) + (kHat.y * windDirection.y);

    const kMagnitude2 = kMagnitude ** 2;
    const kMagnitude4 = kMagnitude2 ** 2;

    // Exponential filter: suppresses waves larger than the maximum possible (L)
    const damping = Math.exp(-1 / (kMagnitude2 * L * L));

    // Phillips spectrum formula: A * (exp / k^4) * (dot_product^2)
    const phillipsEnergy = amplitudeA * (damping / kMagnitude4) * (kDotW ** 2);

    return phillipsEnergy;
}

/**
 * Generates a random number with a Gaussian distribution (Mean 0, Std Dev 1).
 * Uses the Box-Muller transform.
 * @returns {Number} Random gaussian number.
 */
function generateGaussianNoise() {
    let u1 = Math.random();
    let u2 = Math.random();
    
    // Security: Avoid log(0)
    if (u1 < 0.000001) u1 = 0.000001; 

    const r = Math.sqrt(-2.0 * Math.log(u1));
    const theta = 2.0 * Math.PI * u2;
    
    return r * Math.cos(theta);
}

/**
 * Calculates the initial complex amplitude (h0) for the FFT grid.
 * @param {Number} phillipsEnergy - Energy output from the Phillips spectrum.
 * @returns {Complex} Complex number representing frequency and phase.
 */
export function calculateH0(phillipsEnergy, dk) {
    if (phillipsEnergy <= 0.0) {
        return new Complex(0, 0);
    }

    // Generate real and imaginary parts using Gaussian distribution
    const real = generateGaussianNoise();
    const imag = generateGaussianNoise();

    const energySqrt = Math.sqrt(phillipsEnergy * dk * dk); // dk is the grid spacing in frequency domain, often dk = 2 * PI / patchSize
    
    const constant = energySqrt / Math.SQRT2;


    return new Complex(real * constant, imag * constant);
}