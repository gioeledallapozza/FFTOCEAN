uniform sampler2D uDisplacementY;
uniform sampler2D uDisplacementX;
uniform sampler2D uDisplacementZ;
uniform float uScale;

out vec2 vUv; //Varying
out vec3 vWorldPosition;
out vec3 vViewDirection;
out float vHeight;

void main()
{
    // Read X,Y,Z displacements 
    float dy = texture(uDisplacementY, uv).r;
    float dx = texture(uDisplacementX, uv).r;
    float dz = texture(uDisplacementZ, uv).r;

    vec3 newPosition = position;

    newPosition.y += dy * uScale;
    newPosition.x += dx * uScale;
    newPosition.z += dz * uScale;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

    //Varyings
    vUv = uv;
    vWorldPosition = (modelMatrix * vec4(newPosition, 1.0)).xyz;
    vViewDirection = cameraPosition - vWorldPosition;
    vHeight = dy * uScale;
}