uniform sampler2D uH0Target; //R = REAL, G = IMG, B = OMEGA
uniform float uResolution;
uniform float uTime;
uniform float uPatchSize; 

precision highp float;

in vec2 vUv; //Varying

layout(location = 0) out vec4 outHeightJacobian; // RG = Height (Y), BA = Vuoto (Future Jacobian)
layout(location = 1) out vec4 outAxisX;          // RG = Choppy (X), BA = Slope (X)
layout(location = 2) out vec4 outAxisZ;          // RG = Choppy (Z), BA = Slope (Z)

#include "../includes/complex.glsl"

void main()
{
    // Tessendorf formula: H(k,t) = H0(k)e^ikt + H0*(-k)e^-iwt
    vec2 h0 = texture(uH0Target, vUv).rg; //Wave vector: Get the real and imgaginary 
    vec2 negUv = mod(1.0 - vUv + (1.0 / uResolution), 1.0);
    vec2 h0_minus_k = texture(uH0Target, negUv).rg; //Opposite wave vector

    //complex coniugate
    vec2 h0_minus_k_conj = vec2(h0_minus_k.x, -h0_minus_k.y);

    float omega = texture(uH0Target, vUv).b; //Angular frequency. (How fast a wave moves based on how heavy is it)
    float phase = omega * uTime;  //shift to apply: velocity * time = phase 

    //Rotation angle
    vec2 eulerRotation = complexExp(phase); // vec2(cos(phase), sin(phase));
    vec2 eulerRotationNeg = complexExp(-phase);

    //Rotate the spectrum by the phase to get the time-evolved spectrum 
    vec2 h0_t_pos = complexMultiply(h0, eulerRotation);
    vec2 h0_t_neg = complexMultiply(h0_minus_k_conj, eulerRotationNeg);

    // Final resoult describes: energy, direction, phase
    vec2 finalHeight = h0_t_pos + h0_t_neg; //Hermitian symmetry


    //WAVE VECTOR
    
    // Ricalculate k vector in pixel space (centered at zero)
    vec2 k = vec2(
        (vUv.x - 0.5) * uResolution * (2.0 * 3.14159265 / uPatchSize),
        (vUv.y - 0.5) * uResolution * (2.0 * 3.14159265 / uPatchSize)
    );

    // Normalize k vector
    float kLength = length(k);
    if (kLength < 0.00001) kLength = 1.0; 
    vec2 kNormal = k / kLength;

    // CHOPPINESS

    // Rotate the height by 90 degrees (multiply by -i) to get the choppy displacement direction
    // (a + bi) * -i = b - ai
    vec2 h_choppy = vec2(finalHeight.y, -finalHeight.x);
  
    vec2 choppyX = h_choppy * kNormal.x;  //Choppy X
    vec2 choppyZ = h_choppy * kNormal.y;  //Choppy Z

    // SLOPE (Analytics Normals)
    
    //Spatial derivate, multiply hieght for (i*k)
    //(a + bi) * -i = b - ai
    vec2 slopeX = vec2(-finalHeight.y * k.x, finalHeight.x * k.x);
    vec2 slopeZ = vec2(-finalHeight.y * k.y, finalHeight.x * k.y);



    //TEXTURE PACKING MRT
    // Index 0 = Y (Height.xy, Jacobian.xy)
    // Index 1 = X (ChoppinessX.xy, SlopeX.xy)
    // Index 2 = Z (ChoppinessZ.xy, SlopeZ.xy)

    outHeightJacobian = vec4(finalHeight, 0.0, 1.0); 
    outAxisX = vec4(choppyX, slopeX);
    outAxisZ = vec4(choppyZ, slopeZ); 
}