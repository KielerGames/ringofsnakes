precision mediump float;

uniform vec2 uCameraPosition;
uniform sampler2D uHeatMapTexture;

varying vec2 vPosition;

const float MARKER_SIZE = 0.015;
const vec4 MARKER_COLOR = vec4(1.0, 1.0, 1.0, 1.0);
const vec4 COOL_COLOR = vec4(0.25, 0.25, 0.25, 0.25);

void main(void) {
	float heat = texture2D(uHeatMapTexture, vPosition).r;
	vec4 hotColor = vec4(1.0, 0.4 * heat, max(0.0, 0.5 * heat - 0.4), 1.0);
	vec4 color = mix(COOL_COLOR, hotColor, 1.3 * heat);
	float d = distance(vPosition, uCameraPosition);
	gl_FragColor = d <= MARKER_SIZE ? MARKER_COLOR : color;
}
