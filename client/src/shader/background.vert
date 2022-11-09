#version 300 es

precision mediump float;

in vec2 aPosition;

uniform mat3 uInvTransform;

out vec2 vUV;

void main(void) {
    vec3 sc = vec3(2.0 * aPosition - vec2(1.0, 1.0), 1.0);
    vec3 wc = uInvTransform * sc;


    vUV = 0.42 * wc.xy;
    gl_Position = vec4(sc, 1.0);
}