precision mediump float;

uniform sampler2D uColorSampler;
uniform lowp float uSkin;

void main(void) {
	gl_FragColor = texture2D(uColorSampler, vec2(uSkin, 0.25));
}
