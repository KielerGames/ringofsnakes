precision mediump float;

uniform mediump vec3 uColor;
uniform float uSnakeLength;

varying float sideOffset;
varying float pathOffset;

const vec3 CENTER  = vec3(0.5, 0.75, 1.0);

void main(void) {
	float co = abs(sideOffset);
	co = co * co;
	co = co * (1.0 + 0.2*sin(2.0*pathOffset));
	if(pathOffset < uSnakeLength) {
		gl_FragColor = vec4(mix(CENTER, uColor.rgb, co), 1.0);
	} else {
		gl_FragColor = vec4(0.0, 0.0, 0.0, 0.5);
	}
}
