#version 300 es

precision mediump float;

in vec2 aPosition;

out vec2 vUV;

uniform mat3 uTransform;

void main(void) {
    vec3 sc = vec3(2.0 * aPosition - vec2(1.0, 1.0), 1.0);
    // TODO: compute inverse once
    vec3 wc = inverse(uTransform) * sc;


    vUV = 0.42 * wc.xy;
    gl_Position = vec4(sc, 1.0);
}