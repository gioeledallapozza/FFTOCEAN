uniform sampler2D uH0Target; //R = REAL, G = IMG, B = OMEGA
uniform float uResolution;
uniform float uTime;

varying vec2 vUv;

#include "../includes/complex.glsl"

void main()
{
    // Tessendorf formula: H(k,t) = H0(k)e^ikt + H0*(-k)e^-iwt

    
    vec2 h0 = texture2D(uH0Target, vUv).rg; //Wave vector: Get the real and imgaginary 
    vec2 negUv = mod(1.0 - vUv + (1.0 / uResolution), 1.0);
    vec2 h0_minus_k = texture2D(uH0Target, negUv).rg; //Opposite wave vector

    //complex coniugate
    vec2 h0_minus_k_conj = vec2(h0_minus_k.x, -h0_minus_k.y);

    float omega = texture2D(uH0Target, vUv).b; //Angular frequency. (How fast a wave moves based on how heavy is it)
    float phase = omega * uTime;  //shift to apply: velocity * time = phase 

    //Rotation angle
    vec2 eulerRotation = complexExp(phase); // vec2(cos(phase), sin(phase));
    vec2 eulerRotationNeg = complexExp(-phase);

    //Rotate the spectrum by the phase to get the time-evolved spectrum 
    vec2 h0_t_pos = complexMultiply(h0, eulerRotation);
    vec2 h0_t_neg = complexMultiply(h0_minus_k_conj, eulerRotationNeg);

    // Final resoult describes: energy, direction, phase
    vec2 final_h0 = h0_t_pos + h0_t_neg; //Hermitian symmetry

    gl_FragColor = vec4(final_h0.x, final_h0.y, 0.0, 1.0);
}