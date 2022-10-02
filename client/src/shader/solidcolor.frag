#version 300 es

precision mediump float;

uniform lowp vec4 uColor;

out vec4 outputColor;

void main(void) {
	outputColor = uColor;
}
