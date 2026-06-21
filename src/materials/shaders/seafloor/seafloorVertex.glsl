uniform float uTime;
uniform float uTextureScale;

varying vec3 vWorldPosition;
varying vec2 vUv;

void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);

    gl_Position = projectionMatrix * viewMatrix * worldPosition;

    // Varyings
    vWorldPosition = worldPosition.xyz;
    vUv = uv * uTextureScale;
}