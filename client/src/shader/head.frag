precision mediump float;

uniform mediump vec3 uColor;

void main(void) {
	gl_FragColor = vec4(uColor, 1.0);
}
