uniform sampler2D uDisplacementY;
uniform float uPatchSize;
uniform float uScale;
uniform vec3 uFogColor;
uniform float uWaterClarity;
uniform vec3 uCameraPosition;
uniform float uCameraNear;
uniform float uCameraFar;

// Postprocessing library automatically injects inputColor, uv, e depth
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 cameraFftUv = uCameraPosition.xz / uPatchSize; //limited only to one patchsize for performance
    float waveHeightAtCamera = texture2D(uDisplacementY, cameraFftUv).r * uScale;  //Read height of the wave over the camera


    // If the camera is over the height of the camera show normal scene
    if (uCameraPosition.y > waveHeightAtCamera) {
        outputColor = inputColor;
        return;
    }

    float depth = readDepth(uv);

    float ndcZ = depth * 2.0 - 1.0; //remapping to [0.0 -> 1.0]
    //Remap the WebGL depth buffer values for depth (it has not good precision for distnace objects)
    float viewZ = (2.0 * uCameraNear * uCameraFar) / (uCameraFar + uCameraNear - ndcZ * (uCameraFar - uCameraNear));
    //Now viewZ has the real linear meters

    // Security fixes
    if (depth >= 0.9999) {
        viewZ = 10000.0;
    }

    // Beer-Lambert Law
    float fogFactor = 1.0 - exp(-viewZ / uWaterClarity); //Distance pixel will be colore by fog
    fogFactor = clamp(fogFactor, 0.0, 1.0);

    //FINAL COLOR
    vec3 finalColor = mix(inputColor.rgb, uFogColor, fogFactor);
    outputColor = vec4(finalColor, inputColor.a);
}