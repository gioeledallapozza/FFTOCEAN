 uniform float uStage;
 uniform float uStages;
 uniform int uDirection;
 uniform sampler2D uPingPongTexture;
 uniform sampler2D uButterflyTexture; // RGBA = (evenIndex, oddIndex, twiddleReal, twiddleImag)

varying vec2 vUv;

#include "../includes/complex.glsl"

void main()
{

    // RETRIVE INDICES AND TWIDDLE FACTORS

    //Which axes are we processing? (0 = horizontal, 1 = vertical)
    float pixelIndex = (uDirection == 0) ? vUv.x : vUv.y;

    //Determinate the column of the texture to read
    //Convert from [0 -> stages] to [0.0 -> 1.0] for texture sampling
    float stageUv = (uStage + 0.5) / uStages; 

    // Read from texture to get the indices and twiddle factors for this stage and pixel
    vec4 instructions = texture2D(uButterflyTexture, vec2(stageUv, pixelIndex));

    float uEven = instructions.r;
    float uOdd = instructions.g;
    vec2 twiddle = instructions.ba; // b = real (cos), a = imaginary (sin)


    //BUTTERFLY OPERATION for 1D IFFT
    vec2 evenUv, oddUv;

    if (uDirection == 0) {
        // Horizontal pass (y fixed)
        evenUv = vec2(uEven, vUv.y);
        oddUv = vec2(uOdd, vUv.y);
    } else {
        // Vertical pass (x fixed)
        evenUv = vec2(vUv.x, uEven);
        oddUv = vec2(vUv.x, uOdd);
    }

    // Retrive data 
    vec2 evenComplex = texture2D(uPingPongTexture, evenUv).rg;
    vec2 oddComplex = texture2D(uPingPongTexture, oddUv).rg;

    //Rotate odd element to align with the even element
    vec2 rotatedOdd = complexMultiply(twiddle, oddComplex);

    // Butterfly combine
    vec2 result = evenComplex + rotatedOdd; //The CPU already handled the sign for the upper/lower half 

    //Result: processed 
    gl_FragColor = vec4(result.x, result.y, 0.0, 1.0);
}