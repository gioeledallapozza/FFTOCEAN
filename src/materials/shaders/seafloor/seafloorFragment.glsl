uniform vec3 uSandColor;
uniform vec3 uWaterDeepColor;
uniform float uMaxDepth;
uniform sampler2D uSandTexture;

varying vec3 vWorldPosition;
varying vec2 vUv;

void main() {
    //Texture 
    vec4 texColor = texture2D(uSandTexture, vUv);
    
    //Base color
    vec3 baseFloorColor = texColor.rgb * uSandColor;

    //TO REDEFINE 
    float depthFactor = clamp(-vWorldPosition.y / uMaxDepth, 0.0, 1.0);
    
    //FINAL COLOR
    vec3 finalColor = mix(baseFloorColor, uWaterDeepColor, depthFactor);

    gl_FragColor = vec4(finalColor, 1.0);
}