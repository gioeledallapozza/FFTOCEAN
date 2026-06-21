uniform float uTime;

uniform sampler2D uDisplacementY; // RG = Height (Y), BA = Jacobian
uniform sampler2D uDisplacementX; // RG = Choppy (X), BA = Slope (X)
uniform sampler2D uDisplacementZ; // RG = Choppy (Z), BA = Slope (Z)
uniform float uScale;

uniform vec3 uWaterDeep;
uniform vec3 uWaterShallow;
uniform float uColorMinHeight;
uniform float uColorMaxHeight;

uniform vec3 uSunPosition;
uniform vec3 uSunColor;
uniform float uSpecularPower;
uniform float uSpecularMin;
uniform float uSpecularMax;
uniform float uSpecularIntensity;
uniform float uFadeStart;
uniform float uFadeEnd;

uniform samplerCube uEnvMap;

uniform vec3 uWaterSSS;
uniform float uSssPower;
uniform float uSssScale;
uniform float uSssMinHeight;
uniform float uSssMaxHeight;
uniform float uSssWrap;
uniform float uSssDistortion;

uniform vec3 uFoamColor;
uniform sampler2D uFoamTexture;
uniform float uFoamThreshold;
uniform float uFoamScale;
uniform vec2 uFoamSpeed;
uniform float uFoamDistortion;
uniform float uFoamEdgeSoftness;
uniform float uFoamPower;
uniform float uFresnelSmoothness;

uniform vec3 uFogColor;
uniform float uFogDensity;
uniform float uFogSunScattering;
uniform float uTurbidity;
uniform float uGlowSize;
uniform float uSunDiskSize;
uniform float uSunGlowSize;
uniform float uSunDiskIntensity;
uniform float uSunGlowIntensity;

//Varying
in vec2 vUv; 
in vec3 vWorldPosition;
in vec3 vViewDirection;
in float vHeight;
in vec3 vNormal;
in float vJacobian;

out vec4 fragColor;

#include ../includes/fresnel.glsl
// #include <tonemapping_pars_fragment>

void main()
{  
    //NORMALS AND VECTORAL DIRECTIONS
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(vViewDirection); //We need to normalize again
    vec3 lightDirection = normalize(uSunPosition);
    vec3 upVector = vec3(0.0, 1.0, 0.0);

    // ANTI-ALIASING (DISTANCE FADE) 
    float dist = length(cameraPosition - vWorldPosition); //distance beetween current pixel and camera
    
    // Under 100m perfect details (0.0)
    // Over 1500m normals are reduced (1.0)
    float aaFade = smoothstep(uFadeStart, uFadeEnd, dist); //uFade start, uFadeEnd

    //Mix the normals with an up vector (to reduce the effect)
    normal = normalize(mix(normal, upVector, aaFade));
    float dynamicSpecularIntensity = mix(uSpecularIntensity, 0.0, aaFade);

    //UNDERWATER COLOR
    float heightMask = smoothstep(uColorMinHeight, uColorMaxHeight, vHeight);
    vec3 baseWaterColor = mix(uWaterDeep, uWaterShallow, heightMask);

    // SUBSURFACE SCATTERING (SSS)
    // float sunGlowRadiusY = sqrt(max(0.0, 1.0 - uSunGlowSize * uSunGlowSize));
    // float sunElevationMask = smoothstep(-sunGlowRadiusY, sunGlowRadiusY, lightDirection.y);

    vec3 distortedLight = normalize(-lightDirection + normal * uSssDistortion); //Deflect the lightDirection with wave normals
    float sssAlignment = max(0.0, dot(viewDirection, distortedLight)); //Allignement with view
    float sssTerm = pow(sssAlignment, uSssPower) * uSssScale;  //Elevate and scale
    
    float sssMask = smoothstep(uSssMinHeight, uSssMaxHeight, vHeight); //Mask, only for high waves (we could use uColorMaxHeight)
    // float sssLightEmmission = max(0.0, dot(normal, -lightDirection) + uSssWrap); //calculate if the sun is pointing to the back of the wave
    // sssMask *= sssLightEmmission; //multiply for enveloping lighting

    vec3 sssColor = uWaterSSS * sssTerm * sssMask; //* sunElevationMask

    vec3 waterInside = baseWaterColor + sssColor; //INTERNAL COLOR

    //SURFACE COLOR
    //EnvMap reflection
    vec3 fresnelNormal = normalize(mix(normal, upVector, uFresnelSmoothness));  //Dual normal (stylized)
    vec3 reflectionVector = reflect(-viewDirection, fresnelNormal);   //calculate rebound angle  
    vec3 envReflection = textureLod(uEnvMap, reflectionVector, 1.5).rgb;
    
    //FRESNEL
    float fresnelFactor = calculateFresnel(viewDirection, fresnelNormal, 0.02, 1.0);  //F0 for water is around 0.02, F90 is 1.0

    // SPECUALR (STYLEZED)
    vec3 halfVector = normalize(lightDirection + viewDirection); //Calculate half vector for specular highlights
    float specularTerm = pow(max(dot(halfVector, normal), 0.0), uSpecularPower); 
    float sunPathMask = smoothstep(uSpecularMin, uSpecularMax, specularTerm); 
    vec3 directSpecular = uSunColor * sunPathMask * dynamicSpecularIntensity;

    vec3 surfaceReflection = envReflection + directSpecular;

    vec3 finalColor = mix(waterInside, surfaceReflection, fresnelFactor);
    finalColor = clamp(finalColor, 0.0, 1.0);

    //FOAM
    vec2 foamUv1 = vUv * uFoamScale; 
    foamUv1 += uTime * (uFoamSpeed * 0.05);  

    vec2 foamUv2 = vUv * (uFoamScale * 1.2); 
    foamUv2 += uTime * (-uFoamSpeed * 0.07); 

    float foamNoise1 = texture(uFoamTexture, foamUv1).r; 
    float foamNoise2 = texture(uFoamTexture, foamUv2).r; 
    float foamNoise = foamNoise1 * foamNoise2;

    // Jacobian (approximation)
    float turbulence = max(0.0, vJacobian);
    turbulence *= uScale * uFoamPower * 10.0;

    float jacobianCoverage = smoothstep(uFoamThreshold, uFoamThreshold + uFoamEdgeSoftness, turbulence);
    
    float foamMask = jacobianCoverage * pow(foamNoise, 1.0 / uFoamDistortion); 
    
    foamMask = clamp(foamMask, 0.0, 1.0);
    
    finalColor = mix(finalColor, uFoamColor, foamMask);

    // FOG & ATMOSPHERIC SCATTERING
    float fogFactor = clamp(1.0 - exp(-pow(dist * uFogDensity, 2.0)), 0.0, 1.0); //exponential decay
    vec3 rayDirection = -viewDirection;

    //same logic as SKY
    float sunDot = dot(rayDirection, normalize(uSunPosition));
    float sunDisk = smoothstep(uSunDiskSize, 1.0, sunDot); 
    float dynamicGlowSize = uSunGlowSize - (uTurbidity * 0.002);
    float sunGlow = smoothstep(dynamicGlowSize, 1.0, sunDot); 

    float dynamicDiskIntensity = uSunDiskIntensity / (1.0 + (uTurbidity * 0.1));
    
    vec3 dynamicFogColor = uFogColor + //here change with fogcolor not skycolor
                           (uSunColor * sunGlow * uSunGlowIntensity) + 
                           (uSunColor * sunDisk * dynamicDiskIntensity);
                           
    finalColor = mix(finalColor, dynamicFogColor, fogFactor);

    // FINAL COLOR
    finalColor = clamp(finalColor, 0.0, 1.0);
    fragColor = vec4(finalColor, 1.0);

    //finalColor = toneMapping(finalColor); //convert tone mapping
    
    //Linear to sRGB space
    //fragColor = linearToOutputTexel(vec4(finalColor, 1.0));
}