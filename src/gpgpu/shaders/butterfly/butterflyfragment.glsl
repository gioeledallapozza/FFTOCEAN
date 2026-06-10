 uniform float uStage;
 uniform float uStages;
 uniform int uDirection;
 uniform sampler2D uButterflyTexture; // RGBA = (evenIndex, oddIndex, twiddleReal, twiddleImag)
 uniform sampler2D uPingPongTextureY; // Height and JAcobian
 uniform sampler2D uPingPongTextureX; // choppy X Slop X
 uniform sampler2D uPingPongTextureZ; // choppy z Slop Z

 precision highp float;

in vec2 vUv; //Varying

layout(location = 0) out vec4 outHeightJacobian; //ouput texture for height (Y)
layout(location = 1) out vec4 outAxisX; //ouput texture for choppy X
layout(location = 2) out vec4 outAxisZ; //ouput texture for choppy Z

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
    //HEIGHT
    vec2 evenComplex_Y = texture(uPingPongTextureY, evenUv).rg;
    vec2 oddComplex_Y = texture(uPingPongTextureY, oddUv).rg;

    // AXIS X: choppy x, slop x
    vec4 evenData_X = texture(uPingPongTextureX, evenUv);
    vec4 oddData_X = texture(uPingPongTextureX, oddUv);
    
    vec2 evenChoppy_X = evenData_X.rg;
    vec2 oddChoppy_X = oddData_X.rg;
    vec2 evenSlope_X = evenData_X.ba;
    vec2 oddSlope_X = oddData_X.ba;

    //AXIS Z: choppy z, slop z
    vec4 evenData_Z = texture(uPingPongTextureZ, evenUv);
    vec4 oddData_Z = texture(uPingPongTextureZ, oddUv);

    vec2 evenChoppy_Z = evenData_Z.rg;
    vec2 oddChoppy_Z = oddData_Z.rg;
    vec2 evenSlope_Z = evenData_Z.ba;
    vec2 oddSlope_Z = oddData_Z.ba;

    // APPLY ROTATION : Rotate odd element to align with the even element
    vec2 rotatedOdd_Y = complexMultiply(twiddle, oddComplex_Y);
    
    vec2 rotatedOddChoppy_X = complexMultiply(twiddle, oddChoppy_X);
    vec2 rotatedOddSlope_X = complexMultiply(twiddle, oddSlope_X);

    vec2 rotatedOddChoppy_Z = complexMultiply(twiddle, oddChoppy_Z);
    vec2 rotatedOddSlope_Z = complexMultiply(twiddle, oddSlope_Z);
    
    // BUTTERFLY COMBINE: The CPU already handled the sign for the upper/lower half 
    vec2 result_Y = evenComplex_Y + rotatedOdd_Y; 
    
    vec2 resultChoppy_X = evenChoppy_X + rotatedOddChoppy_X;
    vec2 resultSlope_X = evenSlope_X + rotatedOddSlope_X;

    vec2 resultChoppy_Z = evenChoppy_Z + rotatedOddChoppy_Z;
    vec2 resultSlope_Z = evenSlope_Z + rotatedOddSlope_Z;

    //WRITE RESULT TO MRT
    outHeightJacobian = vec4(result_Y, 0.0, 0.0);
    outAxisX = vec4(resultChoppy_X, resultSlope_X);
    outAxisZ = vec4(resultChoppy_Z, resultSlope_Z);
}