//Schlick Approximation
float calculateFresnel(vec3 viewDir, vec3 normal, float f0, float f90) {
    float cosTheta = max(dot(viewDir, normal), 0.0);
    float fresnel = f0 + (f90 - f0) * pow(1.0 - cosTheta, 5.0);
    return fresnel;
}