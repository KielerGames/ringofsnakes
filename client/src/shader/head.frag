#version 300 es

precision mediump float;

uniform sampler2D uColorSampler;
uniform lowp int uSkin;
uniform lowp float uSnakeFast;

const vec4 fastColorBoost = vec4(0.175, 0.175, 0.175, 0.0);

out vec4 outputColor;

void main(void) {
	vec4 skinColor = texelFetch(uColorSampler, ivec2(uSkin, 0), 0);
	outputColor = skinColor + uSnakeFast * fastColorBoost;
}
