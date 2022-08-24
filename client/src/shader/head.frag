precision mediump float;

uniform sampler2D uColorSampler;
uniform lowp float uSkin;
uniform lowp float uSnakeFast;

const vec4 fastColorBoost = vec4(0.15, 0.15, 0.15, 0.0);

void main(void) {
	vec4 skinColor = texture2D(uColorSampler, vec2(uSkin, 0.25));
	gl_FragColor = skinColor + uSnakeFast * fastColorBoost;
}
