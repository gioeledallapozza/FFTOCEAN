uniform float uTime;
uniform sampler2D uDisplacementMap;

varying float vHeight;

void main()
{
    vec3 newPosition = position;

    float height = texture(uDisplacementMap, uv).r;
    newPosition.y += height; 
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

    //Varyings
    vHeight = height;
}