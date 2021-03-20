precision mediump float;

uniform mediump vec3 uColor;
uniform float uSnakeLength;

varying float pathOffset;
varying float normalOffset;

const vec3 darkColor = mix(uColor, vec(0.1, 0.1, 0.1), 0.5);

void main(void) {
	float co = abs(normalOffset);
	co = co * co;
	co = co * (1.0 + 0.2*sin(2.0*pathOffset));

	float alpha = (pathOffset < uSnakeLength) ? 1.0 : 0.0;
	vec3 color = mix(uColor, darkColor, co);

	gl_FragColor = vec4(color, alpha);
}
