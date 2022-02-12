precision mediump float;

varying vec2 varPos;
varying lowp vec3 vColor;
varying lowp float vOpacity;

const vec3 centerColor = vec3(1.0, 1.0, 1.0);

float norm_clamp(float x) {
	return min(1.0, max(0.0, x));
}

void main(void) {
	float d2 = dot(varPos, varPos);
	float alpha = norm_clamp(1.0 - 1.5*(d2 - 0.333));
	alpha = alpha * alpha * vOpacity * vOpacity;
	vec3 color = mix(centerColor, vColor, 0.5 + 0.666 * d2);
	gl_FragColor = vec4(color, alpha);
}
