import Camera from "../../data/camera/Camera";
import Game from "../../data/Game";
import Vector from "../../math/Vector";
import * as TextRenderer from "./TextRenderer";
import * as WebGLContextProvider from "../webgl/WebGLContextProvider";

const ctx = document.createElement("canvas").getContext("2d")!;
const snakeNameSize = 12;

export function render(game: Readonly<Game>): void {
    const canvas = WebGLContextProvider.getContext().canvas;

    for (const snake of game.snakes.values()) {
        if (snake.target || !snake.hasChunks() || !isVisible(game.camera, snake.position)) {
            continue;
        }

        const p = game.camera.computeScreenCoordinates(snake.position, canvas);
        const offset = 10 + 0.5 * snake.width;
        const text = snake.name;
        TextRenderer.addText(text, `snake${snake.id}`, {
            color: "white",
            x: p.x,
            y: p.y + offset,
            size: snakeNameSize,
            minWidth: measureTextWidth(text, snakeNameSize)
        });
    }
}

function measureTextWidth(text: string, size: number): number {
    ctx.font = `sans-serif ${size}px`;
    return ctx.measureText(text).width;
}

function isVisible(camera: Camera, position: Vector): boolean {
    return camera.viewBox.contains(position);
}
