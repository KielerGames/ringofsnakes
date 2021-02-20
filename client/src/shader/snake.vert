precision mediump float;

attribute vec2 vPosition;
attribute float vLength;
attribute float vCenterOffset;

uniform mat4 uTransform;
uniform mediump vec3 uColor;
uniform float uHeadOffset;
uniform float uChunkLength;

varying float length;
varying float offset;

void main(void) {
    offset = vCenterOffset;
    length = uHeadOffset + uChunkLength - vLength;
    gl_Position = uTransform * vec4(vPosition, 1.0, 1.0);
}
