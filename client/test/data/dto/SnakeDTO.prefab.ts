import { SnakeDTO } from "../../../src/app/data/dto/SnakeDTO";

const snakeDTO: SnakeDTO = {
    id: 1,
    length: 8,
    width: 2,
    skin: 0,
    headPosition: { x: 0, y: 0 },
    headDirection: [0.0, 0.0], // [current direction, target direction]
    fast: false,
    fastHistory: [false, false, false, false, false, false, false, false],
    headChunkId: 0
};

export default snakeDTO;

export function createSnakeDTO(nonDefaults: Partial<SnakeDTO>): SnakeDTO {
    const dto = { ...snakeDTO, ...nonDefaults };
     if(nonDefaults.fast !== undefined) {
         dto.fastHistory[0] = nonDefaults.fast;
     }
    return dto;
}
