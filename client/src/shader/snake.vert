precision mediump float;

attribute vec2 aPosition;
attribute vec2 aNormal;
attribute float aNormalOffset;
attribute float aRelativePathOffset;

uniform mat3 uTransform;
uniform highp float uSnakeMaxWidth;
uniform highp float uChunkPathOffset;
uniform highp float uSnakeLength;
uniform highp float uSnakeThinningStart;

varying highp float vPathOffset;
varying float vNormalOffset;

void main(void) {
    vNormalOffset = aNormalOffset;

    // distance from the snake head (along the snake path)
    vPathOffset = uChunkPathOffset + aRelativePathOffset;

    // thinning parameter t: 0 -> full width, 1 -> zero width
    float t = min(1.0, max(0.0, vPathOffset - uSnakeThinningStart) / (uSnakeLength - uSnakeThinningStart));
    float u = (aRelativePathOffset < 0.0) ? 0.9 : 1.0 - (t * t * t);

    float size = 0.5 * u * uSnakeMaxWidth;
    vec2 position = aPosition + (aNormalOffset * size) * aNormal;
    gl_Position = vec4(uTransform * vec3(position, 1.0), 1.0);
}
