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

uniform vec3 uSkyColor;

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

out vec4 fragColor;

#include ./includes/fresnel.glsl

void main()
{  
    //BASIC COLOR
    float heightMask = smoothstep(uColorMinHeight, uColorMaxHeight, vHeight);
    vec3 waterColor = mix(uWaterDeep, uWaterShallow, heightMask);

    vec3 finalColor = waterColor; //Initalize final color

    //NORMALS
    //Calculate normal based on partial derivatives (TODO: use GPGPU for REAL normal calculation)
    vec3 partialDx = dFdx(vWorldPosition);
    vec3 partialDy = dFdy(vWorldPosition);
    vec3 normal = normalize(cross(partialDx, partialDy)); //Cross product to get normals
    if (normal.y < 0.0) normal = -normal;

    //VECTORAL DIRECTIONS
    vec3 viewDirection = normalize(vViewDirection); //We need to normalize again
    vec3 lightDirection = normalize(uSunPosition);

    //FRESNEL
    float fresnelFactor = calculateFresnel(viewDirection, normal, 0.02, 1.0); //F0 for water is around 0.02, F90 is 1.0
    finalColor = mix(waterColor, uSkyColor, fresnelFactor); 

    //SPECULAR
    vec3 halfVector = normalize(lightDirection + viewDirection); //Calculate half vector for specular highlights
    float specular = pow(max(dot(halfVector, normal), 0.0), uSpecularPower);
    specular = smoothstep(uSpecularMin, uSpecularMax, specular);

    vec3 specularColor = uSunColor * specular * uSpecularIntensity; 

    ///SUBSURFACE SCATTERING (SSS)
    float sssAlignment = max(0.0, dot(viewDirection, -lightDirection)); //Opposite direction of the sun. 
    float sssTerm = pow(sssAlignment, uSssPower) * uSssScale;  //Elevate and scale
    
    float sssMask = smoothstep(uSssMinHeight, uSssMaxHeight, vHeight); //Mask, only for high waves (we could use uColorMaxHeight)
    float sssLightEmmission = max(0.0, dot(normal, -lightDirection) + uSssWrap); //calculate if the sun is pointing to the back of the wave
    sssMask *= sssLightEmmission; //multiply for enveloping lighting

    vec3 sssColor = uWaterSSS * sssTerm * sssMask;

    //COMBINE
    finalColor += specularColor;
    finalColor += sssColor;

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