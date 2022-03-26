precision mediump float;

attribute vec2 aAbsPosition;

varying vec2 vPosition;

void main(void) {
    vPosition = 0.5 * (aAbsPosition + vec2(1.0, 1.0));
    gl_Position = vec4(aAbsPosition, 1.0, 1.0);
}
