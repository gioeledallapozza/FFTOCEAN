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

uniform samplerCube uEnvMap;

uniform vec3 uWaterSSS;
uniform float uSssPower;
uniform float uSssScale;
uniform float uSssMinHeight;
uniform float uSssMaxHeight;
uniform float uSssWrap;

uniform vec3 uFoamColor;
uniform sampler2D uFoamTexture;
uniform float uFoamThreshold;
uniform float uFoamScale;
uniform vec2 uFoamSpeed;
uniform float uFoamDistortion;
uniform float uFoamEdgeSoftness;
uniform float uFoamPower;
uniform float uFresnelSmoothness;

//Varying
in vec2 vUv; 
in vec3 vWorldPosition;
in vec3 vViewDirection;
in float vHeight;
in vec3 vNormal;
in float vJacobian;

out vec4 fragColor;

#include ../includes/fresnel.glsl

void main()
{  
    //NORMALS AND VECTORAL DIRECTIONS
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(vViewDirection); //We need to normalize again
    vec3 lightDirection = normalize(uSunPosition);

    //UNDERWATER COLOR
    float heightMask = smoothstep(uColorMinHeight, uColorMaxHeight, vHeight);
    vec3 baseWaterColor = mix(uWaterDeep, uWaterShallow, heightMask);

    // SUBSURFACE SCATTERING (SSS)
    float sssAlignment = max(0.0, dot(viewDirection, -lightDirection)); //Opposite direction of the sun. 
    float sssTerm = pow(sssAlignment, uSssPower) * uSssScale;  //Elevate and scale
    
    float sssMask = smoothstep(uSssMinHeight, uSssMaxHeight, vHeight); //Mask, only for high waves (we could use uColorMaxHeight)
    float sssLightEmmission = max(0.0, dot(normal, -lightDirection) + uSssWrap); //calculate if the sun is pointing to the back of the wave
    sssMask *= sssLightEmmission; //multiply for enveloping lighting

    vec3 sssColor = uWaterSSS * sssTerm * sssMask;

    vec3 waterInside = baseWaterColor + sssColor; //INTERNAL COLOR

    //SURFACE COLOR
    //EnvMap reflection
    vec3 upVector = vec3(0.0, 1.0, 0.0); //Dual normal (stylized)
    vec3 fresnelNormal = normalize(mix(normal, upVector, uFresnelSmoothness)); 
    vec3 reflectionVector = reflect(-viewDirection, fresnelNormal);   //calculate rebound angle  
    vec3 envReflection = textureLod(uEnvMap, reflectionVector, 1.5).rgb;
    
    //FRESNEL
    float fresnelFactor = calculateFresnel(viewDirection, fresnelNormal, 0.02, 1.0);  //F0 for water is around 0.02, F90 is 1.0

    // SPECUALR (STYLEZED)
    vec3 halfVector = normalize(lightDirection + viewDirection); //Calculate half vector for specular highlights
    float specularTerm = pow(max(dot(halfVector, normal), 0.0), uSpecularPower); 
    float sunPathMask = smoothstep(uSpecularMin, uSpecularMax, specularTerm); 
    vec3 directSpecular = uSunColor * sunPathMask * uSpecularIntensity;

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
    
    // FINAL COLOR
    finalColor = mix(finalColor, uFoamColor, foamMask);
    fragColor = vec4(finalColor, 1.0);
}