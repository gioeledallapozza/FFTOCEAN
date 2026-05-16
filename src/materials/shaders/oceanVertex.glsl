uniform float uTime;

void main()
{
    vec3 newPosition = position;

    newPosition.y += sin(position.x + uTime) * 0.5;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}