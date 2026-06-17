uniform sampler2D uDisplacementY; //Height Y, FUTURE JACOBIAN TODO
uniform sampler2D uDisplacementX; //Choppy X, Slope X
uniform sampler2D uDisplacementZ; //Choppy Z, Slope Z
uniform float uScale;

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
    // Read X,Y,Z displacements 
    float height = texture(uDisplacementY, uv).r;

    vec4 dataX = texture(uDisplacementX, uv);
    vec4 dataZ = texture(uDisplacementZ, uv);

    float choppyX = dataX.x; 
    float choppyZ = dataZ.x;

    float slopeX = dataX.z; 
    float slopeZ = dataZ.z;

    vec3 newPosition = position;

    newPosition.y += height * uScale;
    newPosition.x -= choppyX * uScale * uChoppyScale;
    newPosition.z -= choppyZ * uScale * uChoppyScale;

    float actualSlopeX = slopeX * uScale * uNormalScale;
    float actualSlopeZ = slopeZ * uScale * uNormalScale;

    vec3 mathNormal = vec3(-actualSlopeX, 1.0, actualSlopeZ);
    vec3 worldNormal = normalize(mat3(modelMatrix) * mathNormal);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

    //Varyings
    vUv = uv;
    vWorldPosition = (modelMatrix * vec4(newPosition, 1.0)).xyz;
    vViewDirection = normalize(cameraPosition - vWorldPosition);
    vHeight = height * uScale;
    vNormal = normalize(worldNormal);
    vJacobian = texture(uDisplacementY, vUv).b; //Pass the jacobian so it can be interpolated
}