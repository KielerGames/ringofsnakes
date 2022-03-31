precision mediump float;

uniform vec2 uCameraPosition;
uniform sampler2D uHeatMapTexture;

varying vec2 vPosition;

const float MARKER_SIZE = 0.015;
const vec4 MARKER_COLOR = vec4(1.0, 1.0, 1.0, 1.0);
const vec4 COOL_COLOR = vec4(0.33, 0.33, 0.33, 0.42);

void main(void) {
	// edge alpha falloff
	vec2 ed = 2.0 * (vec2(0.5, 0.5) - abs(vPosition - vec2(0.5, 0.5)));
	float med = min(ed.x, ed.y);
	float alpha = min(8.0 * med, 1.0);

	// heta map color
	float heat = texture2D(uHeatMapTexture, vPosition).r;
	vec4 hotColor = vec4(1.0, 0.4 * heat, max(0.0, 0.5 * heat - 0.4), alpha);
	vec4 color = mix(COOL_COLOR, hotColor, 1.3 * heat);

	// camera position marker
	float d = distance(vPosition, uCameraPosition);
	gl_FragColor = d <= MARKER_SIZE ? MARKER_COLOR : color;
}
