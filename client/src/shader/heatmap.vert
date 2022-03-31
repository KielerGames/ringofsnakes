precision mediump float;

attribute vec2 aRelPosition;

uniform mat3 uTransform;

varying vec2 vPosition;

void main(void) {
    vPosition = aRelPosition;
    gl_Position = vec4(uTransform * vec3(aRelPosition, 1.0), 1.0);
}
