precision mediump float;

uniform vec2 uCameraPosition;
uniform sampler2D uHeatMapTexture;

varying vec2 vPosition;

const float MARKER_SIZE = 0.0025;
const vec4 MARKER_COLOR = vec4(1.0, 1.0, 1.0, 1.0);

void main(void) {
	float heat = texture2D(uHeatMapTexture, vPosition).r;
	vec4 color = mix(vec4(0.5, 0.5, 0.5, 0.25), vec4(1.0, 0.0, 0.0, 1.0), heat);
	float d = distance(vPosition, uCameraPosition);
	gl_FragColor = d <= MARKER_SIZE ? MARKER_COLOR : color;
}
