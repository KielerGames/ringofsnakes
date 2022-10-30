import { getAllSkins } from "../../../src/app/data/misc/Skins";
import { NUM_SKINS } from "../../../src/app/worker/decoder/FoodDecoder";

describe("FoodDecoder", () => {
    test("correct constants", () => {
        expect(NUM_SKINS).toBe(getAllSkins().length);
    });
});
