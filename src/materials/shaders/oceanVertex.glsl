uniform sampler2D uDisplacementY;
uniform sampler2D uDisplacementX;
uniform sampler2D uDisplacementZ;
uniform float uScale;

out vec2 vUv; //Varying
out vec3 vWorldPosition;
out vec3 vViewDirection;
out float vHeight;
out vec3 vNormal;

void main()
{
    // Read X,Y,Z displacements 
    float height = texture(uDisplacementY, uv).r;

    vec4 dataX = texture(uDisplacementX, uv);
    vec4 dataZ = texture(uDisplacementZ, uv);

    float choppyX = dataX.x; 
    float choppyZ = dataZ.x;

    float slopeX = dataX.z * uScale; 
    float slopeZ = dataZ.z * uScale;

    vec3 newPosition = position;

    newPosition.y += height * uScale;
    newPosition.x += choppyX * uScale;
    newPosition.z += choppyZ * uScale;

    vec3 analyticalNormal = normalize(vec3(-slopeX, 1.0, -slopeZ));

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

    //Varyings
    vUv = uv;
    vWorldPosition = (modelMatrix * vec4(newPosition, 1.0)).xyz;
    vViewDirection = cameraPosition - vWorldPosition;
    vHeight = height * uScale;
    vNormal = normalMatrix * analyticalNormal;
}