precision mediump float;

uniform mediump vec3 uColor;

varying float offset;
varying float length;

const vec3 CENTER  = vec3(0.5, 0.75, 1.0);

void main(void) {
	float co = abs(offset);
	if(length < -0.42) {
		// this should never happen
		// this is just to avoid the attribute being optimized away
		gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	} else {
		gl_FragColor = vec4(mix(CENTER, uColor.rgb, co*co), 1.0);
	}
	
}
