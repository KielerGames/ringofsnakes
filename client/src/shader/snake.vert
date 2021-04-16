precision mediump float;

attribute vec2 vPosition;
attribute vec2 vNormal;
attribute float vNormalOffset;
attribute float vRelativePathOffset;

uniform mat4 uTransform;
uniform float uSnakeWidth;
uniform float uChunkPathOffset;

varying float pathOffset;
varying float normalOffset;

void main(void) {
    normalOffset = vNormalOffset;
    pathOffset = uChunkPathOffset + vRelativePathOffset;
    vec2 position = vPosition + (vNormalOffset * uSnakeWidth) * vNormal;
    gl_Position = uTransform * vec4(position, 0.0, 1.0);
}
