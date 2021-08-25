precision mediump float;

uniform mediump vec3 uColor;

varying vec2 varPos;

void main(void) {
	float d2 = dot(varPos, varPos);
	gl_FragColor = vec4(uColor, d2 < 1.0 ? 1.0 : 0.0);
}
