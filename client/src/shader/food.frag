precision mediump float;

uniform mediump vec3 uColor;

varying vec2 varPos;

const vec3 centerColor = vec3(1.0, 1.0, 1.0);

void main(void) {
	float d2 = dot(varPos, varPos);
	float alpha = min(1.0, 1.0 - 2.0*(d2 - 0.5));
	vec3 color = mix(centerColor, uColor, 0.5 + 0.666 * d2);
	gl_FragColor = vec4(color, alpha);
}
