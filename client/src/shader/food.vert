precision mediump float;

attribute vec2 aPosition;
attribute vec2 aLocalPos;
attribute vec3 aColor;

uniform mat3 uTransform;

varying vec2 varPos;
varying vec3 vColor;

void main(void) {
    varPos = aLocalPos;
    vColor = aColor;
    gl_Position = vec4(uTransform * vec3(aPosition, 1.0), 1.0);
}
