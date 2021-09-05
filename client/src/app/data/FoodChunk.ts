import Food from "./Food";

export default class FoodChunk {
    public id: number;
    food: Food[];

    public constructor(id: number, food: Food[]) {
        this.id = id;
        this.food = food;
    }
}
