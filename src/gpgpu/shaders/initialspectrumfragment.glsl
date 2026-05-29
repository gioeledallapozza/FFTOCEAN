uniform float uResolution;
uniform float uPatchSize;
uniform float uAmplitude;
uniform float uWindSpeed;
uniform vec2 uWindDirection;

varying vec2 vUv;

#include "./includes/complex.glsl"
#include "./includes/random.glsl"

float calculatePhillips(vec2 k, float windSpeed, vec2 windDir, float amplitude, float kMagnitude) {

    //Prevent 0 as a value
    kMagnitude = max(1e-6, kMagnitude);

    float L = (windSpeed * windSpeed) / 9.81; // Largest possible wave size
    
    // Normalize wave vector to get wave direction
    vec2 kHat = k / kMagnitude;

    // Dot product between wave direction and wind direction, skip kDotW < 0.0 because the sea does not generate wave in direction opposite to the wind
    float kDotW = max(0.0, dot(kHat, windDir)); //(kHat.x * windDirection.x) + (kHat.y * windDirection.y);


    float kMagnitude2 = kMagnitude * kMagnitude;
    float kMagnitude4 = kMagnitude2 * kMagnitude2;

    // Exponential filter: suppresses waves larger than the maximum possible (L)
    float damping = exp(-1.0 / (kMagnitude2 * L * L));

    // Phillips spectrum formula: A * (exp / k^4) * (dot_product^2)
   float phillipsEnergy = amplitude * (damping / kMagnitude4) * (kDotW * kDotW);

    return phillipsEnergy;
}

void main()
{
    //From 0.0 - 1.0 range to X - Y range
    vec2 pixelCoord = floor(vUv * uResolution);
 
    //Determinate the dial of the pixel (top-right, bottom-left, ect...)
    float halfResolution = uResolution / 2.0;
    
    //Resolution = 8: x < 4 = 4 else x - 8.     X MAX is resolution - 1  beacuse of approximation
    float nx = pixelCoord.x < halfResolution ? pixelCoord.x : pixelCoord.x - uResolution; 
    float ny = pixelCoord.y < halfResolution ? pixelCoord.y : pixelCoord.y - uResolution;
    
    vec2 nVector = vec2(nx, ny); //Direction of the current wave (pixel = elemental wave)

    //Frequency of the biggest wave possibile
    float dk = (2.0 * 3.14159265359) / uPatchSize; //float dk = (2 * math.pi) / uPatchSize;  

    vec2 kVector = nVector * dk; //Recalculate the frequency based on the size of a tile
    float kMagnitude = length(kVector); //Vector lenght (wave number)

    //Angular frequency. (How fast a wave moves based on how heavy is it)
    float omega = sqrt(9.81 * kMagnitude);

    float phillipsEnergy = calculatePhillips(kVector, uWindSpeed, uWindDirection, uAmplitude, kMagnitude);

    //H0 Calculation
    vec2 h0 = vec2(0.0);
    if (phillipsEnergy > 0.0) {

        //gaussian random complex number based in current pixel
        vec2 gauss = gaussianRandom(vUv);

        float energySqrt = sqrt(phillipsEnergy * dk * dk);
        float constant = energySqrt * sqrt(0.5);

        h0 = vec2(gauss.x * constant, gauss.y * constant);
    }

    // VRAM save
    // Canale R: Real H0
    // Canale G: Img H0
    // Canale B: Omega
    gl_FragColor = vec4(h0.x, h0.y, omega, 1.0);
}