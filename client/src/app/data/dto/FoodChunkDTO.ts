export type FoodItemDTO = {
    x: number;
    y: number;
    size: number;
    color: number;
};

export type FoodChunkId = number;

export type FoodChunkDTO = {
    id: FoodChunkId;
    items: FoodItemDTO[];
    bounds: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    };
};
