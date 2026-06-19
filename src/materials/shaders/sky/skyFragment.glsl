uniform vec3 uTopColor;
uniform vec3 uBottomColor;

uniform vec3 uSunPosition;
uniform vec3 uSunColor;
uniform float uSunDiskSize;
uniform float uSunGlowSize;
uniform float uSunDiskIntensity;
uniform float uSunGlowIntensity;

uniform float uTurbidity;
uniform float uRayleigh;

varying vec3 vWorldPosition;

void main() {

    //Retrive data
    vec3 viewDirection = normalize(vWorldPosition - cameraPosition);
    vec3 sunDirection = normalize(uSunPosition);

    //Gradient
    float height = max(normalize(viewDirection).y, 0.0);
    //Law of Beer-Lambert 
    float opticalDepth = exp(-height * (8.0 - uRayleigh)); //,deò the color of the horizon
    vec3 skyColor = mix(uTopColor, uBottomColor, opticalDepth);

    //Sun
    float sunDot = dot(viewDirection, sunDirection); // Are we looking at the sun?
    float sunDisk = smoothstep(uSunDiskSize, 1.0, sunDot); // Sun nucleus size
    float dynamicGlowSize = uSunGlowSize - (uTurbidity * 0.002); //The more turbidity there is in the air, the more photons bounce off it.
    float sunGlow = smoothstep(dynamicGlowSize, 1.0, sunDot); // Sun glow falloff

    float dynamicDiskIntensity = uSunDiskIntensity / (1.0 + (uTurbidity * 0.1));
    //Additive blending so the kernel is lighter
    vec3 finalColor = skyColor + 
                     (uSunColor * sunGlow * uSunGlowIntensity) + 
                     (uSunColor * sunDisk * dynamicDiskIntensity);

    finalColor = clamp(finalColor, 0.0, 1.0);

    gl_FragColor = vec4(finalColor, 1.0);
}