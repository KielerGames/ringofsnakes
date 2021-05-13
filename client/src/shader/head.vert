precision mediump float;

attribute vec2 vRelPosition;

uniform mat4 uTransform;
uniform float uSnakeWidth;
uniform vec2 uHeadPosition;
uniform float uHeadRotation;

void main(void) {
    float c = cos(uHeadRotation);
    float s = sin(uHeadRotation);
    mat2 rotate = mat2(c,s,-s,c);
    vec2 position = uHeadPosition + uSnakeWidth * rotate * vRelPosition;
    gl_Position = uTransform * vec4(position, 0.0, 1.0);
}
