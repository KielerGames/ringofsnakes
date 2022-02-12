type Color = [number, number, number];

export type Skin = Readonly<{
    snakeBody: Color;
    food: Color;
}>;

const skins: Skin[] = [
    {
        // blue
        snakeBody: [128, 191, 255],
        food: [0, 128, 255]
    },
    {
        // orange
        snakeBody: [255, 184, 114],
        food: [255, 134, 14]
    },
    {
        // green
        snakeBody: [191, 255, 128],
        food: [25, 255, 42]
    },
    {
        // yellow
        snakeBody: [250, 255, 80],
        food: [255, 255, 22]
    },
    {
        // pink
        snakeBody: [230, 67, 197],
        food: [255, 0, 255]
    },
    {
        // red
        snakeBody: [255, 81, 55],
        food: [255, 25, 12]
    },
    {
        // gray
        snakeBody: [112, 111, 110],
        food: [128, 182, 222]
    }
];

export function getSkin(idx: number): Skin {
    return skins[idx % skins.length];
}

export function getAllSkins(): Readonly<Skin[]> {
    return skins;
}
