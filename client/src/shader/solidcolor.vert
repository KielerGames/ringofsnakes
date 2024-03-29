#version 300 es

precision mediump float;

in vec2 vPosition;

uniform mediump mat3 uTransform;

void main(void) {
    gl_Position = vec4(uTransform * vec3(vPosition, 1.0), 1.0);
}
