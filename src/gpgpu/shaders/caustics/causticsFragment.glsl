uniform float uTime;
varying vec2 vUv;

vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
}

float voronoiSeamless(vec2 x, float period) {
    vec2 n = floor(x);
    vec2 f = fract(x);
    float min_dist = 8.0;
    
    for(int j = -1; j <= 1; j++) {
        for(int i = -1; i <= 1; i++) {
            vec2 b = vec2(float(i), float(j));
            vec2 wrapped = mod(n + b, period); 
            vec2 r = vec2(b) - f + hash(wrapped);
            
            // Animazione distorta nel tempo
            r += 0.3 * sin(uTime * 2.0 + hash(wrapped) * 6.2831);
            float d = dot(r, r);
            min_dist = min(min_dist, d);
        }
    }
    return min_dist; 
}

void main() {
    // LAYER 1: Veloce e scala media
    float p1 = 4.0;
    vec2 uv1 = vUv * p1 + vec2(uTime * 0.1, uTime * 0.05);
    float c1 = voronoiSeamless(uv1, p1);

    // LAYER 2: Lento, scala diversa, muove opposto
    float p2 = 5.0;
    vec2 uv2 = vUv * p2 - vec2(uTime * 0.05, uTime * 0.08);
    float c2 = voronoiSeamless(uv2, p2);

    // LAYER 3: Dettaglio piccolo per rompere la simmetria
    float p3 = 7.0;
    vec2 uv3 = vUv * p3 + vec2(-uTime * 0.07, uTime * 0.1);
    float c3 = voronoiSeamless(uv3, p3);

    // Moltiplicando i livelli creiamo "buchi" caotici
    float caustics = (c1 + c2 + c3) * 0.6;
    
    // Contrasto brutale per rendere le linee finissime e bianche
    caustics = pow(caustics, 2.5) * 3.5;

    caustics = clamp(caustics, 0.0, 1.0);
    
    gl_FragColor = vec4(vec3(caustics), 1.0);
}