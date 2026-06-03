
// Pseudo-Random Hash beetween 0.0 e 1.0.
float hash(vec2 uv) {
    return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Gaussian Random number (Box-Muller Transform)
vec2 gaussianRandom(vec2 uv) {
    float u1 = hash(uv);
    float u2 = hash(uv + vec2(1.234, 5.678)); 

    //Avoid log(0)
    u1 = max(1e-6, u1);

    // Box-Muller Transform
    float radius = sqrt(-2.0 * log(u1));
    float theta = 2.0 * 3.14159265359 * u2;

    //Real and imaginary part combined
    return vec2(radius * cos(theta), radius * sin(theta));
}