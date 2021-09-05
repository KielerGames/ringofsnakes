precision mediump float;

varying vec2 varPos;
varying lowp vec3 vColor;

const vec3 centerColor = vec3(1.0, 1.0, 1.0);

void main(void) {
	float d2 = dot(varPos, varPos);
	float alpha = min(1.0, 1.0 - 2.0*(d2 - 0.5));
	vec3 color = mix(centerColor, vColor, 0.5 + 0.666 * d2);
	gl_FragColor = vec4(color, alpha);
}
