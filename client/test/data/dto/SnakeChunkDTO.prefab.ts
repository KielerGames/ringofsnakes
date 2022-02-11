import { SnakeChunkDTO } from "../../../src/app/data/dto/SnakeChunkDTO";
import Rectangle from "../../../src/app/math/Rectangle";
import Vector from "../../../src/app/math/Vector";

const chunkDTO: SnakeChunkDTO = {
    id: 0,
    snakeId: 0,

    data: new Float32Array(0),
    vertices: 0,
    boundingBox: Rectangle.createAt(new Vector(0, 0), 4, 4),
    end: { x: 0, y: 0 },

    length: 4,
    offset: 0,
    full: false
};

export function createSnakeChunkDTO(nonDefaults: Partial<SnakeChunkDTO>): SnakeChunkDTO {
    return { ...chunkDTO, ...nonDefaults };
}
