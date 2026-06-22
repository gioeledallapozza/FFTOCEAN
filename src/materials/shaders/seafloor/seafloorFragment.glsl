uniform float uTime;
uniform vec3 uSandColor;
uniform vec3 uWaterDeepColor;
uniform vec3 uWaterShallowColor;
uniform float uMaxDepth;
uniform sampler2D uSandTexture;

uniform sampler2D uCausticsTexture;
uniform float uCausticsIntensity;
uniform float uCausticsSpeed;
uniform float uCausticsScale;

uniform float uProximityNear;
uniform float uProximityFar;
uniform float uMinWaterTint;

varying vec3 vWorldPosition;
varying vec2 vUv;

void main() {

    //Texture 
    vec4 texColor = texture2D(uSandTexture, vUv);
    vec3 baseSand = texColor.rgb * uSandColor;

    //BEER LAW
    float depthY = max(0.0, -vWorldPosition.y); 
    float verticalAttenuation = exp(-depthY / (uMaxDepth * 0.5));
    vec3 ambientWaterColor = mix(uWaterDeepColor, uWaterShallowColor, verticalAttenuation);

    //Project the texture on the floor animated by time
    vec2 projectedCausticsUv = vWorldPosition.xz * uCausticsScale;
    projectedCausticsUv += uTime * uCausticsSpeed * vec2(1.0, 0.5);

    float c1 = texture2D(uCausticsTexture, projectedCausticsUv).r;
    
    float angle = 0.65; // ~37 gradi
    mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    vec2 uv2 = rot * (projectedCausticsUv * 0.618);
    uv2 -= uTime * uCausticsSpeed * 0.3;

    float c2 = texture2D(uCausticsTexture, uv2).r;

    float causticsMask = c1 * c2 * 2.5;
    float cameraDist = length(cameraPosition - vWorldPosition);

    //Factor for defining if we see the full color of the sand or not (based on camera)
    float proximityFactor = smoothstep(uProximityNear, uProximityFar, cameraDist);

    proximityFactor = pow(proximityFactor, 3.0);

    proximityFactor = mix(uMinWaterTint, 1.0, proximityFactor);

    vec3 visibleSand = mix(baseSand, baseSand * ambientWaterColor, proximityFactor);

    vec3 causticTint = mix(vec3(1.0), uWaterShallowColor, 0.2); 
    vec3 tintedCaustics = causticTint * causticsMask * uCausticsIntensity;
    visibleSand += tintedCaustics * verticalAttenuation;

    //FINAL COLOR
    gl_FragColor = vec4(visibleSand, 1.0);
}