import * as THREE from 'three';

// Bit reversal utility function
function reverseBits(index, bits) {
    let reversed = 0;
    for (let i = 0; i < bits; i++) {
        if ((index & (1 << i)) !== 0) {
            reversed |= (1 << ((bits - 1) - i));
        }
    }
    return reversed;
}

// Generates a butterfly texture for the IFFT stages. 
// Height = resolution, Width = stages, RGBA = (uEven, uOdd, twiddleReal, twiddleImag)
export default function generateButterflyTexture(resolution) {
    const stages = Math.log2(resolution);
    const data = new Float32Array(resolution * stages * 4); // RGBA for each pixel

    for (let i = 0; i < stages; i++) {
        const span = Math.pow(2, i); // Distance between even and odd indices for this stage

        for (let j = 0; j < resolution; j++) {
            //Local index within the current span
            const k = j % (span * 2);
            const theta = (2.0 * Math.PI * k) / (span * 2.0); // Angle IFFT

            let evenIndex, oddIndex;

            if (i === 0) {
                // Standard bit reversal for the first stage 
                evenIndex = reverseBits(j - (j % 2), stages); // Only even indices 
                oddIndex = reverseBits(j - (j % 2) + 1, stages); // Only odd indices 
            } else {
                // For subsequent stages, we group indices in pairs of 'span' and determine even/odd based on the local index k
                if (k < span) {
                    evenIndex = j;
                    oddIndex = j + span;
                } else {
                    evenIndex = j - span;
                    oddIndex = j;
                }
            }

            // Mapping from index to [0.0 -> 1.0] for Uv coordinates
            const uEven = (evenIndex + 0.5) / resolution;
            const uOdd = (oddIndex + 0.5) / resolution;

            // Twiddle Factor
            const twiddleReal = Math.cos(theta);
            const twiddleImag = Math.sin(theta);

            // Linear position in the texture
            const pixelIndex = (i + j * stages) * 4;

            data[pixelIndex + 0] = uEven;      // R
            data[pixelIndex + 1] = uOdd;       // G
            data[pixelIndex + 2] = twiddleReal;// B
            data[pixelIndex + 3] = twiddleImag;// A
        }
    }

    //Export
    const texture = new THREE.DataTexture(
        data, 
        stages, 
        resolution, 
        THREE.RGBAFormat, 
        THREE.FloatType
    );
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;

    return texture;
}