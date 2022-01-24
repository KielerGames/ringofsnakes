import Matrix from "../../math/Matrix";
import { TransferableBox } from "../../math/Rectangle";
import assert from "../../util/assert";
import WebGLShaderProgram from "../webgl/WebGLShaderProgram";
import * as WebGLContextProvider from "../WebGLContextProvider";

declare const __VERTEXSHADER_SOLIDCOLOR__: string;
declare const __FRAGMENTSHADER_SOLIDCOLOR__: string;

let shader: WebGLShaderProgram;
let buffer: WebGLBuffer;
const vertexData = new Float32Array(4 * 2);
const boxesToDraw: { box: TransferableBox; color: RGBAColor }[] = [];

(async () => {
    const gl = await WebGLContextProvider.waitForContext();

    shader = new WebGLShaderProgram(
        gl,
        __VERTEXSHADER_SOLIDCOLOR__,
        __FRAGMENTSHADER_SOLIDCOLOR__
    );

    buffer = gl.createBuffer()!;
    assert(buffer !== null);
})();

export function addBox(box: TransferableBox, color: RGBAColor): void {
    boxesToDraw.push({ box, color });
}

export function renderAll(transform: Matrix): void {
    const gl = WebGLContextProvider.getContext();

    shader.use();
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    shader.setUniform("uTransform", transform.data);

    for (const { box, color } of boxesToDraw) {
        shader.setUniform("uColor", color);

        vertexData[0] = box.minX;
        vertexData[1] = box.minY;
        vertexData[2] = box.maxX;
        vertexData[3] = box.minY;
        vertexData[4] = box.maxX;
        vertexData[5] = box.maxY;
        vertexData[6] = box.minX;
        vertexData[7] = box.maxY;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STREAM_DRAW);

        shader.run(4, { mode: gl.LINE_LOOP });
    }

    boxesToDraw.length = 0;
}

type RGBAColor = [number, number, number, number];
