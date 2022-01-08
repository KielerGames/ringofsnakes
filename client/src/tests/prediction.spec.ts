import { assert } from "chai";
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

        for(let i=0; i<10; i++) {
            const pos = snake.getPredictedPosition(i);
            assert.approximately(pos.x, i, 1e-6);
        }
    });

});
