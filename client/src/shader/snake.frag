precision mediump float;

uniform sampler2D uColorSampler;
uniform lowp float uSkin;
uniform highp float uSnakeLength;

varying float pathOffset;
varying float normalOffset;

const vec3 darkGrey = vec3(0.1, 0.1, 0.1);

void main(void) {
	vec3 skinColor = texture2D(uColorSampler, vec2(uSkin, 0.25)).rgb;
	vec3 darkColor = mix(skinColor, darkGrey, 0.5);

	float co = abs(normalOffset);
	co = co * co;
	co = co * (1.0 + 0.25*sin(2.0*pathOffset));

	vec3 color = mix(skinColor, darkColor, co);

	gl_FragColor = vec4(color, pathOffset < uSnakeLength ? 1.0 : 0.0);
}
