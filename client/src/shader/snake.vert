precision mediump float;

attribute vec2 vPosition;
attribute vec2 vNormal;
attribute float vNormalOffset;
attribute float vRelativePathOffset;

uniform mat3 uTransform;
uniform highp float uSnakeMaxWidth;
uniform highp float uChunkPathOffset;
uniform highp float uSnakeLength;
uniform highp float uSnakeThinningStart;

varying highp float pathOffset;
varying float normalOffset;

void main(void) {
    normalOffset = vNormalOffset;

    // distance from the snake head (along the snake path)
    pathOffset = uChunkPathOffset + vRelativePathOffset;

    // thinning parameter t: 0 -> full width, 1 -> zero width
    float t = min(1.0, max(0.0, pathOffset - uSnakeThinningStart) / (uSnakeLength - uSnakeThinningStart));
    float u = 1.0 - (t * t * t);

    float size = 0.5 * u * uSnakeMaxWidth;
    vec2 position = vPosition + (vNormalOffset * size) * vNormal;
    gl_Position = vec4(uTransform * vec3(position, 1.0), 1.0);
}
