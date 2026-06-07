out vec2 vUv; //Varying

void main() {
    vUv = uv;
    // No projection matrix, we are rendering a full-screen quad
    gl_Position = vec4(position, 1.0);
}