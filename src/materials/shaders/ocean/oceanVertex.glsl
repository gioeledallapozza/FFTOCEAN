uniform sampler2D uDisplacementY; //Height Y, Jacobian
uniform sampler2D uDisplacementX; //Choppy X, Slope X
uniform sampler2D uDisplacementZ; //Choppy Z, Slope Z

uniform float uScale;
uniform float uPatchSize;
uniform vec2 uViewerPos;
uniform float uResolution;
uniform float uBaseVertexSpacing;
uniform float uNormalScale;
uniform float uChoppyScale;

uniform float uDualScale;
uniform float uDualWeight;
uniform float uDualAngle;
uniform float uWindScale;

out vec2 vUv; //Varying
out vec3 vWorldPosition;
out vec3 vViewDirection;
out float vHeight;
out vec3 vNormal;
out float vJacobian;

#include ../includes/simple2dnoise.glsl

void main()
{
    //LOD CALCULATIONS
    float localDist = max(abs(position.x), abs(position.z)); //radial distance from center
    float lod0Radius = (uResolution / 2.0) * uBaseVertexSpacing; //Main central block with high resolution
    //Calculate LOD (ring)
    float lod = max(0.0, ceil(log2(localDist / lod0Radius) - 0.001));  //Epsilon = -0.001 prevents errors for vertices on the borders

    //Grid
    float gridSize = uBaseVertexSpacing * exp2(lod); //Distance beetween vertices in this LOD
    float nextGridSize = gridSize * 2.0;

    // SNAPPING
    vec2 snappedCamera = floor(uViewerPos / gridSize) * gridSize;
    vec2 worldXZ = position.xz + snappedCamera;

    // MORPHING
    vec2 worldXZ_next = floor((worldXZ + 0.001) / nextGridSize) * nextGridSize; //Where this vertex would fall if it were squashed onto the grid of the next LOD
    
    //Calculate the alpha factor (0.0 -> 1.0) for the last two outer cells of the LOD
    float currentRadius = lod0Radius * exp2(lod);
    float morphStart = currentRadius - 2.0 * gridSize; 
    
    // 0 = vertex inside the current LOD
    // 1 = merged with next LOD
    float morphAlpha = clamp((localDist - morphStart) / (2.0 * gridSize), 0.0, 1.0);

    //FINAL MATH WORLD POSITION
    vec2 finalWorldXZ = mix(worldXZ, worldXZ_next, morphAlpha);


    // --- FFT DISPLACEMENT ---
    vec2 fftUv = finalWorldXZ / uPatchSize;

    float derivativeMultiplier = uDualWeight * uDualScale;

    //rotation angle (37°)
    float cosA = cos(uDualAngle);
    float sinA = sin(uDualAngle);

    //rotation matrix
    mat2 rot = mat2(cosA, -sinA, sinA, cosA);
    mat2 invRot = mat2(cosA, sinA, -sinA, cosA);

    vec2 fftUv2 = rot * (fftUv * uDualScale);

    //WIND MASK
    vec2 windUv = finalWorldXZ / uWindScale;
    float windNoise = snoise(windUv);
    float windMask = smoothstep(-2.5, 1.5, windNoise);

    float dynamicDualWeight = uDualWeight * windMask;
    float dynamicDerivative = derivativeMultiplier * windMask;

    // Read X,Y,Z displacements 

    //Primary Wave
    float height1 = texture(uDisplacementY, fftUv).r;

    vec4 dataX1 = texture(uDisplacementX, fftUv);
    vec4 dataZ1 = texture(uDisplacementZ, fftUv);

    float jacobian1 = texture(uDisplacementY, fftUv).b;

    //Secondary Wave
    float height2 = texture(uDisplacementY, fftUv2).r;

    vec4 dataX2 = texture(uDisplacementX, fftUv2);
    vec4 dataZ2 = texture(uDisplacementZ, fftUv2);

    float jacobian2 = texture(uDisplacementY, fftUv2).b;

    //vector realignment
    vec2 choppy2 = invRot * vec2(dataX2.x, dataZ2.x);
    vec2 slope2 = invRot * vec2(dataX2.z, dataZ2.z);


    //Height
    float height = height1 + height2 * dynamicDualWeight;

    //Choppy
    float choppyX = dataX1.x + choppy2.x * dynamicDualWeight; 
    float choppyZ = dataZ1.x + choppy2.y * dynamicDualWeight;

    vec3 newPosition = vec3(finalWorldXZ.x, 0.0, finalWorldXZ.y);

    newPosition.y += height * uScale;
    newPosition.x -= choppyX * uScale * uChoppyScale;
    newPosition.z -= choppyZ * uScale * uChoppyScale;

    //Normals
    float slopeX = dataX1.z + slope2.x * dynamicDerivative; 
    float slopeZ = dataZ1.z + slope2.y * dynamicDerivative;

    float actualSlopeX = slopeX * uScale * uNormalScale;
    float actualSlopeZ = slopeZ * uScale * uNormalScale;

    vec3 worldNormal = normalize(vec3(-actualSlopeX, 1.0, -actualSlopeZ));

    //Jacobian
    // float finalJacobian = jacobian1 + jacobian2 * dynamicDualWeight;
     float finalJacobian = max(jacobian1, jacobian2 * dynamicDualWeight);

    // RENDERING
    // DO NOT USE modelMatrix finalWorldXZ it's already a final global position.
    gl_Position = projectionMatrix * viewMatrix * vec4(newPosition, 1.0);

    //Varyings
    vUv = fftUv;
    //vWorldPosition = (modelMatrix * vec4(newPosition, 1.0)).xyz;
    vWorldPosition = newPosition;
    vViewDirection = normalize(cameraPosition - vWorldPosition);
    vHeight = height * uScale;
    vNormal = normalize(worldNormal);
    vJacobian = finalJacobian; //Pass the jacobian so it can be interpolated
}