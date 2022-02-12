precision mediump float;

attribute vec2 aPosition;
attribute vec2 aLocalPos;
attribute float aColorIndex;

uniform mat3 uTransform;
uniform sampler2D uColorSampler;
uniform vec2 uAttractorPosition;

varying vec2 varPos;
varying lowp vec3 vColor;
varying lowp float vOpacity;

const float cMoveDist = 7.5;

void main(void) {
    varPos = aLocalPos;
    vColor = texture2D(uColorSampler, vec2(aColorIndex, 0.75)).rgb;

    float d = distance(aPosition, uAttractorPosition);
    float s = min(1.0, d * 0.25);
    vOpacity = min(1.0, d * 0.375);

    vec2 pos = (d < cMoveDist) ? mix(aPosition, uAttractorPosition, 1.0 - s) : aPosition;

    gl_Position = vec4(uTransform * vec3(pos, 1.0), 1.0);
}
