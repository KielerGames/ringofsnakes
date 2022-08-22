export type SnakeDeathDTO = {
    deadSnakeId: SnakeId;
    killer?: {
        snakeId: SnakeId;
        name: string;
    };
};

type SnakeId = number;
