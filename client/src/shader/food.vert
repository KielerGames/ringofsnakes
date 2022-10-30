#version 300 es

precision mediump float;

in vec2 aPosition;
in vec2 aLocalPos;
in vec2 aWiggleParams;
in int aColorIndex;
in float aSize;

uniform mat3 uTransform;
uniform sampler2D uColorSampler;
uniform vec2 uAttractorPosition;
uniform float uTime;

out vec2 vPos;
flat out lowp vec3 vColor;
out lowp float vOpacity;

const float cMoveDist = 7.5;
const float cWS = 0.8; // wiggle base speed

void main(void) {
    vPos = aLocalPos;
    vec2 worldPosition = aPosition + aSize * aLocalPos;
    vColor = texelFetch(uColorSampler, ivec2(aColorIndex, 1), 0).rgb;

    float d = distance(worldPosition, uAttractorPosition);
    float s = min(1.0, d * 0.25);
    vOpacity = min(1.0, d * 0.375);

    float t0 = 10.0 * fract(0.23 * aPosition.x + 0.21 * aPosition.y);
    vec2 wiggle = 0.3 * s * vec2(cos(aWiggleParams.x * cWS * uTime + t0), sin(aWiggleParams.y * cWS * uTime + t0));

    vec2 pos = (d < cMoveDist) ? mix(worldPosition, uAttractorPosition, 1.0 - s) : worldPosition;

    gl_Position = vec4(uTransform * vec3(pos + wiggle, 1.0), 1.0);
}
