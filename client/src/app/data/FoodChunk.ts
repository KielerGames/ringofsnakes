import Food from "./Food";

export default class FoodChunk {
    food: Food[];

    public constructor(food: Food[]) {
        this.food = food;
    }

    public static createRandom(): FoodChunk {
        const foods = new Array(20);

        for (let i = 0; i < foods.length; i++) {
            const x = (2 * Math.random() - 1) * 25;
            const y = (2 * Math.random() - 1) * 25;
            foods[i] = new Food(x, y, 0.5 + Math.random(), 0);
        }

        return new FoodChunk(foods);
    }
}
