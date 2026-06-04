uniform sampler2D uDisplacementY;
uniform sampler2D uDisplacementX;
uniform sampler2D uDisplacementZ;
uniform float uScale;

varying vec2 vUv;

void main()
{
    // Read X,Y,Z displacements 
    float dy = texture2D(uDisplacementY, uv).r;
    float dx = texture2D(uDisplacementX, uv).r;
    float dz = texture2D(uDisplacementZ, uv).r;

    vec3 newPosition = position;

    newPosition.y += dy * uScale;
    newPosition.x += dx * uScale;
    newPosition.z += dz * uScale;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

    //Varyings
    vUv = uv;
}