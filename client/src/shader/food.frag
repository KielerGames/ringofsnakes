precision mediump float;

uniform mediump vec3 uColor;

varying vec2 varPos;

void main(void) {
	float x = varPos.x;
	float y = varPos.y;
	float d2 = x*x + y*y;
	gl_FragColor = vec4(uColor, d2 > 1.0 ? 0.0 : 1.0);
}
