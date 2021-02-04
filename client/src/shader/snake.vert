precision mediump float;

attribute vec2 vPosition;
attribute float vCenterOffset;
attribute float vLength;

uniform mat4 uTransform;
uniform mediump vec3 uColor;

void main(void) {
	gl_Position = uTransform * vec4(vPosition, 0.0, 1.0);
}
