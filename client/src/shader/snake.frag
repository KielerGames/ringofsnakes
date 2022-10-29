#version 300 es

precision mediump float;

uniform sampler2D uColorSampler;
uniform lowp int uSkin;
uniform highp float uSnakeLength;
uniform lowp float uSnakeFast;

in float vPathOffset;
in float vNormalOffset;

const vec3 darkGrey = vec3(0.1, 0.1, 0.1);
const vec3 fastColorBoost = vec3(0.175, 0.175, 0.175);

out vec4 outputColor;

void main(void) {
	vec3 skinColor = texelFetch(uColorSampler, ivec2(uSkin, 0), 0).rgb;
	vec3 darkColor = mix(skinColor, darkGrey, 0.5);

	float co = abs(vNormalOffset);
	co = co * co;
	co = co * (1.0 + 0.25*sin(2.0*vPathOffset));

	vec3 color = mix(skinColor + uSnakeFast * fastColorBoost, darkColor, co);

	outputColor = vec4(color, vPathOffset < uSnakeLength ? 1.0 : 0.0);
}
