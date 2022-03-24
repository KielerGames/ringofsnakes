precision mediump float;

attribute vec2 aAbsPosition;

varying vec2 vPosition;

void main(void) {
    vPosition = aAbsPosition;
    gl_Position = vec4(aAbsPosition, 1.0, 1.0);
}
