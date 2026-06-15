uniform float uTime;

uniform sampler2D uDisplacementY;
uniform sampler2D uDisplacementX;
uniform sampler2D uDisplacementZ;

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
uniform float uFoamThreshold;
uniform float uFoamScale;
uniform vec2 uFoamSpeed;
uniform float uFoamDistortion;
uniform float uFoamEdgeSoftness;

//Varying
in vec2 vUv; 
in vec3 vWorldPosition;
in vec3 vViewDirection;
in float vHeight;
in vec3 vNormal;

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
    vec3 reflectionVector = reflect(-viewDirection, normal);   //calculate rebound angle  
    vec3 envReflection = textureLod(uEnvMap, reflectionVector, 1.5).rgb;

    // SPECUALR (STYLEZED)
    vec3 halfVector = normalize(lightDirection + viewDirection); //Calculate half vector for specular highlights
    float specularTerm = pow(max(dot(halfVector, normal), 0.0), uSpecularPower); 
    float sunPathMask = smoothstep(uSpecularMin, uSpecularMax, specularTerm); 
    vec3 directSpecular = uSunColor * sunPathMask * uSpecularIntensity;

    vec3 surfaceReflection = envReflection + directSpecular;

    //FRESNEL
    float fresnelFactor = calculateFresnel(viewDirection, normal, 0.02, 0.5); //F0 for water is around 0.02, F90 is 1.0
    vec3 finalColor = mix(waterInside, surfaceReflection, fresnelFactor);
    finalColor = clamp(finalColor, 0.0, 1.0);

    //FOAM
    vec2 foamUv = vUv * uFoamScale; // Texture Scale
    foamUv += uTime * uFoamSpeed;  // Scroll through Y and X

    // Texture Voronoi
    float foamNoise = sin(foamUv.x) * cos(foamUv.y) + sin(foamUv.x * 2.5 + uTime) * cos(foamUv.y * 2.5);
    foamNoise = (foamNoise + 2.0) / 4.0; // Normalize values [0.0, 1.0]
    
    float foamMask = vHeight + (foamNoise * uFoamDistortion);  // Mask, in the future should be handled by the jacobian
     
    foamMask = smoothstep(uFoamThreshold, uFoamThreshold + uFoamEdgeSoftness, foamMask); //Smoothstep for look very ripid
    finalColor = mix(finalColor, uFoamColor, foamMask);

    fragColor = vec4(finalColor, 1.0);
}