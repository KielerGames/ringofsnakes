import { assert } from "chai";
import Rand from "rand-seed";
import Snake from "../app/data/Snake";
import SnakeChunk from "../app/data/SnakeChunk";
import Rectangle from "../app/math/Rectangle";
import { SnakeChunkData } from "../app/worker/GameDataUpdate";

describe("MT Snake Chunk", () => {
    it("should change the path offset", () => {
        const data: SnakeChunkData = {
            id: 0,
            snakeId: 0,
            final: true,
            vertices: 0,
            data: new Float32Array(0),
            length: 0.0,
            boundingBox: new Rectangle(0, 1, 0, 1),
            offset: 0.0,
        };

        const snake = new Snake({
            id: 0,
            skin: 0,
            length: 0.0,
            speed: 1.0,
            position: { x: 0, y: 0 },
            direction: 0.0,
            offsetCorrection: 0
        });

        const chunk = new SnakeChunk(snake, data);

        snake.addChunk(chunk);

        assert.equal(chunk.offset(0.0), 0.0);
        assert.isAbove(chunk.offset(1.0), 0.0);

        chunk.addToOffset(42.0);
        assert.approximately(chunk.offset(0.0), 42.0, 1e-8);
        assert.isAbove(chunk.offset(1.0), 42.0);
    });
});
