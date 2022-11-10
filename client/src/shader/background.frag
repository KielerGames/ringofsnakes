#version 300 es

precision mediump float;

in vec2 vUV;

uniform sampler2D uTexture;

out vec4 outputColor;

void main(void) {
    outputColor = texture(uTexture, vUV);
}
