#version 300 es

precision mediump float;

in vec2 aPosition;
in vec2 aLocalPos;
in vec3 aWiggleParams;
in int aColorIndex;
in float aSize;

uniform mat3 uTransform;
uniform sampler2D uColorSampler;
uniform vec2 uAttractorPosition;
uniform float uTime;

out vec2 vPos;
flat out lowp vec3 vColor;
out lowp float vOpacity;

void main(void) {
    vPos = aLocalPos;
    vec2 worldPosition = aPosition + aSize * aLocalPos;
    vColor = texelFetch(uColorSampler, ivec2(aColorIndex, 1), 0).rgb;

    // distance factors
    float d = distance(worldPosition, uAttractorPosition);
    float s = min(1.0, d * 0.25);

    // wiggle
    float t0 = 10.0 * fract(0.23 * aPosition.x + 0.21 * aPosition.y);
    vec2 wiggle = 0.275 * s * vec2(cos(aWiggleParams.x * uTime + t0), sin(aWiggleParams.y * uTime + t0));

    // change opacity based on distance to attractor
    vOpacity = min(1.0, d * 0.375);

    // position with scale based on wiggle amount
    float ws = 1.0 + 0.11 * s * cos(1.75 * aWiggleParams.z * uTime + t0);
    vec2 pos = aPosition + ws * aSize * aLocalPos;

    // apply attraction effect
    pos = (d < 7.5) ? mix(pos, uAttractorPosition, 1.0 - s) : pos;

    gl_Position = vec4(uTransform * vec3(pos + wiggle, 1.0), 1.0);
}
