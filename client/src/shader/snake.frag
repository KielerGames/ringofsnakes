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
	
	// distort texture towards edge
	float dX = vNormalOffset + 0.42 * sign(vNormalOffset) * vNormalOffset * vNormalOffset;

	vec2 uv = vInvTexScale * vec2(dX * uSnakeMaxWidth, 1.25 * vPathOffset);
	vec3 texData = texture(uScalesTexture, uv).rgb;

	// brighten skin color if snake is boosting
	skinColor = skinColor + uSnakeFast * fastColorBoost;
	// darken skin color using the red channel
	skinColor = (0.2 + 0.8 * texData.r) * skinColor;
	// brighten skin color using the blue channel
	skinColor = skinColor + 0.8 * (1.0 - abs(vNormalOffset)) * texData.b;

	// brightness falloff towards the edge
	float co = vNormalOffset * vNormalOffset;
	vec3 color = mix(skinColor, darkColor, co);

	outputColor = vec4(color, vPathOffset < uSnakeLength ? 1.0 : 0.0);
}
