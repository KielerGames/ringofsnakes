precision mediump float;

attribute vec2 vPosition;
attribute vec2 vLocalPos;

uniform mat3 uTransform;

varying vec2 varPos;

void main(void) {
    varPos = vLocalPos;
    gl_Position = vec4(uTransform * vec3(vPosition, 1.0), 1.0);
}
