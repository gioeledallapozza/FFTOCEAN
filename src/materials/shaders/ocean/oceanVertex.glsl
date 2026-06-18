uniform sampler2D uDisplacementY; //Height Y, FUTURE JACOBIAN TODO
uniform sampler2D uDisplacementX; //Choppy X, Slope X
uniform sampler2D uDisplacementZ; //Choppy Z, Slope Z

uniform float uScale;
uniform float uPatchSize;
uniform vec2 uViewerPos;
uniform float uResolution;
uniform float uBaseVertexSpacing;
uniform float uNormalScale;
uniform float uChoppyScale;

out vec2 vUv; //Varying
out vec3 vWorldPosition;
out vec3 vViewDirection;
out float vHeight;
out vec3 vNormal;
out float vJacobian;

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
    //vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    vec2 fftUv = finalWorldXZ / uPatchSize;

    // Read X,Y,Z displacements 
    float height = texture(uDisplacementY, fftUv).r;

    vec4 dataX = texture(uDisplacementX, fftUv);
    vec4 dataZ = texture(uDisplacementZ, fftUv);

    //Choppy
    float choppyX = dataX.x; 
    float choppyZ = dataZ.x;

    vec3 newPosition = vec3(finalWorldXZ.x, 0.0, finalWorldXZ.y);

    newPosition.y += height * uScale;
    newPosition.x -= choppyX * uScale * uChoppyScale;
    newPosition.z -= choppyZ * uScale * uChoppyScale;

    //Normals
    float slopeX = dataX.z; 
    float slopeZ = dataZ.z;

    float actualSlopeX = slopeX * uScale * uNormalScale;
    float actualSlopeZ = slopeZ * uScale * uNormalScale;

    vec3 worldNormal = normalize(vec3(-actualSlopeX, 1.0, -actualSlopeZ));
    // vec3 worldNormal = normalize(mat3(modelMatrix) * mathNormal);

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
    vJacobian = texture(uDisplacementY, fftUv).b; //Pass the jacobian so it can be interpolated
}