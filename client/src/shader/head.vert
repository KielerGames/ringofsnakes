#version 300 es

precision mediump float;

in vec2 vRelPosition;

uniform mat3 uTransform;
uniform float uSnakeWidth;
uniform vec2 uHeadPosition;
uniform float uHeadRotation;

void main(void) {
    float c = cos(uHeadRotation);
    float s = sin(uHeadRotation);
    mat2 rotate = mat2(c,s,-s,c);
    float size = 0.5 * uSnakeWidth;
    vec2 position = uHeadPosition + size * rotate * vRelPosition;
    gl_Position = vec4(uTransform * vec3(position, 1.0), 1.0);
}
