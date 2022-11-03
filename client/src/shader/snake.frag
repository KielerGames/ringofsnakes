#version 300 es

precision mediump float;

uniform sampler2D uColorSampler;
uniform sampler2D uScalesTexture;
uniform lowp int uSkin;
uniform highp float uSnakeLength;
uniform lowp float uSnakeFast;

in float vPathOffset;
in float vNormalOffset;
flat in float vScaleSize;

const vec3 darkGrey = vec3(0.1, 0.1, 0.1);
const vec3 fastColorBoost = vec3(0.175, 0.175, 0.175);

out vec4 outputColor;

void main(void) {
	vec3 skinColor = texelFetch(uColorSampler, ivec2(uSkin, 0), 0).rgb;
	vec3 darkColor = mix(skinColor, darkGrey, 0.5);
	float texColor = texture(uScalesTexture, 0.5 * vec2(vScaleSize * vNormalOffset, 0.9 * vPathOffset)).r;

	float co = abs(vNormalOffset);
	co = co * co;

	skinColor = (0.3 + 0.7 * texColor) * skinColor;

	vec3 color = mix(skinColor + uSnakeFast * fastColorBoost, darkColor, co);

	outputColor = vec4(color, vPathOffset < uSnakeLength ? 1.0 : 0.0);
}
