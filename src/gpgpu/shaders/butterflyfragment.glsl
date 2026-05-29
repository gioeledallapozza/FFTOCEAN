varying vec2 vUv;

#include "./includes/complex.glsl"

void main()
{
    gl_FragColor = vec4(vUv, 0.0, 1.0);
}