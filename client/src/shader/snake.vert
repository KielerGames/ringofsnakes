precision mediump float;

attribute vec2 vPosition;
attribute vec2 vNormal;
attribute float vNormalOffset;
attribute float vRelativePathOffset;

uniform mat3 uTransform;
uniform float uSnakeMaxWidth;
uniform float uChunkPathOffset;

varying float pathOffset;
varying float normalOffset;

void main(void) {
    normalOffset = vNormalOffset;
    pathOffset = uChunkPathOffset + vRelativePathOffset;
    float size = 0.5 * uSnakeMaxWidth;
    vec2 position = vPosition + (vNormalOffset * size) * vNormal;
    gl_Position = vec4(uTransform * vec3(position, 1.0), 1.0);
}
