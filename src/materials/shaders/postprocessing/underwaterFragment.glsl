uniform sampler2D uDisplacementY;
uniform float uPatchSize;
uniform float uScale;
uniform vec3 uFogColor;
uniform float uWaterClarity;
uniform vec3 uCameraPosition;
uniform float uCameraNear;
uniform float uCameraFar;

// La libreria postprocessing inietta automaticamente inputColor, uv, e depth
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    
    float depth = readDepth(uv);

    // 1. Leggi l'altezza dell'onda ESATTAMENTE sopra la telecamera
    vec2 cameraFftUv = uCameraPosition.xz / uPatchSize;
    float waveHeightAtCamera = texture2D(uDisplacementY, cameraFftUv).r * uScale;

    // 2. Culling: Se la telecamera è sopra l'onda, mostra la scena normale
    if (uCameraPosition.y > waveHeightAtCamera) {
        outputColor = inputColor;
        return;
    }

    // 3. Ricostruzione Matematica della Profondità
    float ndcZ = depth * 2.0 - 1.0;
    float viewZ = (2.0 * uCameraNear * uCameraFar) / (uCameraFar + uCameraNear - ndcZ * (uCameraFar - uCameraNear));

    // Se stiamo guardando il vuoto assoluto (depth == 1.0), la distanza è virtualmente infinita
    if (depth >= 0.9999) {
        viewZ = 10000.0;
    }

    // 4. Assorbimento Volumetrico (Legge di Beer-Lambert)
    // Più il pixel è distante (es. il fondale marino), più viene assorbito dalla nebbia torbida
    float fogFactor = 1.0 - exp(-viewZ / uWaterClarity);
    fogFactor = clamp(fogFactor, 0.0, 1.0);

    // 5. Miscelazione finale
    vec3 finalColor = mix(inputColor.rgb, uFogColor, fogFactor);
    outputColor = vec4(finalColor, inputColor.a);
}