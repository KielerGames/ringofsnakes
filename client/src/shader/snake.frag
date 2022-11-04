#version 300 es

precision mediump float;

uniform sampler2D uColorSampler;
uniform sampler2D uScalesTexture;
uniform lowp int uSkin;
uniform highp float uSnakeLength;
uniform lowp float uSnakeFast;
uniform highp float uSnakeMaxWidth;

in float vPathOffset;
in float vNormalOffset;
flat in float vInvTexScale;

const vec3 darkGrey = 0.05 * vec3(1.0, 1.0, 1.0);
const vec3 fastColorBoost = 0.175 * vec3(1.0, 1.0, 1.0);

out vec4 outputColor;

void main(void) {
	vec3 skinColor = texelFetch(uColorSampler, ivec2(uSkin, 0), 0).rgb;
	vec3 darkColor = mix(skinColor, darkGrey, 0.64);
	
	vec2 uv = vInvTexScale * vec2(vNormalOffset * uSnakeMaxWidth, vPathOffset);
	vec3 texData = texture(uScalesTexture, uv).rgb;

	skinColor = skinColor + uSnakeFast * fastColorBoost;
	skinColor = (0.25 + 0.75 * texData.r) * skinColor + 0.85 * (1.0 - abs(vNormalOffset)) * texData.b;

	// brightness falloff towards the edge
	float co = vNormalOffset * vNormalOffset;
	vec3 color = mix(skinColor, darkColor, co);

	outputColor = vec4(color, vPathOffset < uSnakeLength ? 1.0 : 0.0);
}
