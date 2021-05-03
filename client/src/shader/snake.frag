precision mediump float;

uniform mediump vec3 uColor;
uniform float uSnakeLength;

varying float pathOffset;
varying float normalOffset;

const vec3 darkGrey = vec3(0.1, 0.1, 0.1);

void main(void) {
	if (pathOffset >= uSnakeLength) {
		// this might cause performance problems if depth testing is enabled
		discard;
	}

	vec3 darkColor = mix(uColor, darkGrey, 0.5);

	float co = abs(normalOffset);
	co = co * co;
	co = co * (1.0 + 0.25*sin(2.0*pathOffset));

	vec3 color = mix(uColor, darkColor, co);

	gl_FragColor = vec4(color, 1.0);
}
