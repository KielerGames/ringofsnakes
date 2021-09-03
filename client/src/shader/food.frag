precision mediump float;

varying vec2 varPos;
varying vec3 vColor;

const vec3 centerColor = vec3(1.0, 1.0, 1.0);

void main(void) {
	vec3 testColor = vec3(1.0,0.1,0.1);
	float d2 = dot(varPos, varPos);
	float alpha = min(1.0, 1.0 - 2.0*(d2 - 0.5));
	vec3 color = mix(centerColor, testColor, 0.5 + 0.666 * d2);
	gl_FragColor = vec4(color, alpha);
}
