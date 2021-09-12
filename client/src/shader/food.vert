precision mediump float;

attribute vec2 aPosition;
attribute vec2 aLocalPos;
attribute float aColorIndex;

uniform mat3 uTransform;
uniform sampler2D uColorSampler;
uniform vec2 uPlayerPosition;

varying vec2 varPos;
varying lowp vec3 vColor;

const float cMoveDist = 7.5;

void main(void) {
    varPos = aLocalPos;
    vColor = texture2D(uColorSampler, vec2(aColorIndex, 0.5)).rgb;

    float d = distance(aPosition, uPlayerPosition);
    float s = min(1.0, d * 0.25);

    vec2 pos = (d < cMoveDist) ? mix(aPosition, uPlayerPosition, 1.0 - s) : aPosition;

    gl_Position = vec4(uTransform * vec3(pos, 1.0), 1.0);
}
