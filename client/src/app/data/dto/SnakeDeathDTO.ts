export type SnakeDeathDTO = {
    deadSnakeId: SnakeId;
    killerSnakeId?: SnakeId;
};

type SnakeId = number;
