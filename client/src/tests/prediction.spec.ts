import { assert } from "chai";
import { SnakeCamera } from "../app/data/Camera";
import Snake from "../app/data/Snake";

describe("Snake Prediction", () => {
    it("should move along the x-axis", () => {
        const snake = new Snake({
            id: 0,
            skin: 0,
            length: 0.0,
            width: 0.42,
            speed: 1.0,
            position: { x: 0, y: 0 },
            direction: 0.0,
            targetDirection: 0.0,
            offsetCorrection: 0,
            headChunkId: 0
        });

        for(let t=0; t<10; t++) {
            const pos = snake.getPredictedPosition(t);
            assert.approximately(pos.x, t, 1e-8);
        }
    });

    it("camera should follow the snake prediction", () => {
        const snake = new Snake({
            id: 0,
            skin: 0,
            length: 0.0,
            width: 0.42,
            speed: 1.0,
            position: { x: 0, y: 0 },
            direction: 0.0,
            targetDirection: 0.0,
            offsetCorrection: 0,
            headChunkId: 0
        });

        const camera = new SnakeCamera(snake);

        for(let t=0; t<10; t++) {
            camera.update(t);
            const pos = camera.position;
            assert.approximately(pos.x, t, 1e-8);
        }
    });
});
