precision mediump float;

attribute vec2 aPosition;
attribute vec2 aLocalPos;
attribute float aColorIndex;

uniform mat3 uTransform;
uniform sampler2D uColorSampler;

varying vec2 varPos;
varying lowp vec3 vColor;

void main(void) {
    varPos = aLocalPos;
    vColor = texture2D(uColorSampler, vec2(aColorIndex, 0.5)).rgb;
    gl_Position = vec4(uTransform * vec3(aPosition, 1.0), 1.0);
}
