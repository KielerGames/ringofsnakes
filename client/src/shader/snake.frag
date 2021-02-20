precision mediump float;

uniform mediump vec3 uColor;
uniform float uSnakeLength;

varying float offset;
varying float length;

const vec3 CENTER  = vec3(0.5, 0.75, 1.0);

void main(void) {
	float co = abs(offset);
	co = co * co;
	co = co * (1.0 + 0.2*sin(2.0*length));
	if(length < uSnakeLength) {
		gl_FragColor = vec4(mix(CENTER, uColor.rgb, co), 1.0);
	} else {
		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
	}
	
}
