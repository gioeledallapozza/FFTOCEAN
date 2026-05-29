vec2 complexMultiply(vec2 a, vec2 b) {
    return vec2(
        a.x * b.x - a.y * b.y, 
        a.x * b.y + a.y * b.x
    );
}

// Euler: e^(i*theta) = cos(theta) + i*sin(theta)
vec2 complexExp(float theta) {
    return vec2(cos(theta), sin(theta));
}


vec2 complexConjugate(vec2 a) {
    return vec2(a.x, -a.y);
}