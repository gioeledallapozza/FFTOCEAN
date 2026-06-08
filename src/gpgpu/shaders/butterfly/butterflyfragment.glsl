 uniform float uStage;
 uniform float uStages;
 uniform int uDirection;
 uniform sampler2D uButterflyTexture; // RGBA = (evenIndex, oddIndex, twiddleReal, twiddleImag)
 uniform sampler2D uPingPongTextureY;
 uniform sampler2D uPingPongTextureX;
 uniform sampler2D uPingPongTextureZ;

 precision highp float;

in vec2 vUv; //Varying

layout(location = 0) out vec4 outHeight; //ouput texture for height (Y)
layout(location = 1) out vec4 outChoppyX; //ouput texture for choppy X
layout(location = 2) out vec4 outChoppyZ; //ouput texture for choppy Z

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
    vec4 instructions = texture(uButterflyTexture, vec2(stageUv, pixelIndex));

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
    vec2 evenComplex_Y = texture(uPingPongTextureY, evenUv).rg;
    vec2 oddComplex_Y = texture(uPingPongTextureY, oddUv).rg;

    vec2 evenComplex_X = texture(uPingPongTextureX, evenUv).rg;
    vec2 oddComplex_X = texture(uPingPongTextureX, oddUv).rg;

    vec2 evenComplex_Z = texture(uPingPongTextureZ, evenUv).rg;
    vec2 oddComplex_Z = texture(uPingPongTextureZ, oddUv).rg;

    //Rotate odd element to align with the even element
    vec2 rotatedOdd_Y = complexMultiply(twiddle, oddComplex_Y);
    vec2 rotatedOdd_X = complexMultiply(twiddle, oddComplex_X);
    vec2 rotatedOdd_Z = complexMultiply(twiddle, oddComplex_Z);

    // Butterfly combine
    vec2 result_Y = evenComplex_Y + rotatedOdd_Y; //The CPU already handled the sign for the upper/lower half 
    vec2 result_X = evenComplex_X + rotatedOdd_X;
    vec2 result_Z = evenComplex_Z + rotatedOdd_Z;

    //Result: processed 
    outHeight = vec4(result_Y, 0.0, 1.0);
    outChoppyX = vec4(result_X, 0.0, 1.0);
    outChoppyZ = vec4(result_Z, 0.0, 1.0);
}