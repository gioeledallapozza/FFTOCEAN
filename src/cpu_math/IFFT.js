import Complex from "./Complex.js";

/**
 * Performs a 1D Inverse Fast Fourier Transform recursively.
 * @param {Complex[]} inputArray - Array of complex numbers (frequency domain)
 * @returns {Complex[]} Array of complex numbers (spatial domain)
 */
function recursiveIFFT1D(inputArray) {
    const N = inputArray.length;

    // Base case: The transform of a single element is itself
    if (N <= 1) {
        return inputArray;
    }

    let even = [];
    let odd = [];

    for (let i = 0; i < N; i++) {
        if (i % 2 === 0) {
            even.push(inputArray[i]);
        } else {
            odd.push(inputArray[i]);
        }
    }

    let evenResult = recursiveIFFT1D(even);
    let oddResult = recursiveIFFT1D(odd);

    let output = new Array(N);

    // Butterfly operation
    for (let n = 0; n < N / 2; n++) {
        // IDFT angle: positive (for IFFT)
        let theta = (2 * Math.PI * n) / N;
        let twiddle = new Complex(Math.cos(theta), Math.sin(theta));

        // Rotate the odd element
        let t = oddResult[n].multiply(twiddle);

        // Butterfly:
        // Top half = Even + (Twiddle * Odd)
        output[n] = evenResult[n].add(t);
        
        // Bottom half = Even - (Twiddle * Odd)
        output[n + N / 2] = evenResult[n].subtract(t);
    }

    return output;
}

/**
 * Wrapper for the 1D IFFT with normalization.
 */
export function computeIFFT1D(inputArray) {
    return recursiveIFFT1D(inputArray);
    // const N = inputArray.length;
    // let rawResult = recursiveIFFT1D(inputArray);

    // let output = new Array(N);

    // // Normalize by N
    // for (let i = 0; i < N; i++) {
    //     output[i] = new Complex(rawResult[i].re / N, rawResult[i].im / N);
    // }

    // return output;
}

/**
 * Performs a 2D IFFT on a grid of complex numbers.
 * @param {Complex[][]} matrixInput - 2D grid of complex numbers
 * @returns {Complex[][]} Spatial domain grid (heightmap)
 */
export function computeIFFT2D(matrixInput) {
    const rows = matrixInput.length;
    const cols = matrixInput[0].length;

    let tempMatrix = new Array(rows);

    // PASS 1: Horizontal IFFT
    // Apply 1D IFFT to every row
    for (let y = 0; y < rows; y++) {
        tempMatrix[y] = computeIFFT1D(matrixInput[y]);
    }

    let finalOutput = new Array(rows);
    for (let y = 0; y < rows; y++) {
        finalOutput[y] = new Array(cols);
    }

    // PASS 2: Vertical IFFT
    // Apply 1D IFFT to every column
    for (let x = 0; x < cols; x++) {
        let currentColumn = new Array(rows);

        // Extract column
        for (let y = 0; y < rows; y++) {
            currentColumn[y] = tempMatrix[y][x];
        }

        // Calculate IFFT for this column
        let calculatedColumn = computeIFFT1D(currentColumn);

        // Reinsert into final grid
        for (let y = 0; y < rows; y++) {
            finalOutput[y][x] = calculatedColumn[y];
        }
    }

    return finalOutput;
}