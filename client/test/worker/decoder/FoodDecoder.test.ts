import Rand from "rand-seed";
import { getAllSkins } from "../../../src/app/data/misc/Skins";

import * as FoodDecoder from "../../../src/app/worker/decoder/FoodDecoder";
import defaultConfig from "../../data/config/GameConfig.prefab";
import { createRandomFoodUpdateBuffer } from "./FoodChunkBuffer.testFactory";

describe("FoodDecoder", () => {
    test("correct constants", () => {
        expect(FoodDecoder.NUM_SKINS).toBe(getAllSkins().length);
    });

    test("vertex buffer should be deterministic", () => {
        const rand = new Rand("deterministic VB seed");
        for (let i = 0; i < 10; i++) {
            const buffer = createRandomFoodUpdateBuffer(rand);
            const decoded1 = FoodDecoder.decode(buffer, 0, defaultConfig).data;
            const decoded2 = FoodDecoder.decode(buffer, 0, defaultConfig).data;
            expect(decoded1.count).toBe(decoded2.count);
            expect(decoded1.vertexBuffer.byteLength).toBe(decoded2.vertexBuffer.byteLength);
            const a = new Int8Array(decoded1.vertexBuffer);
            const b = new Int8Array(decoded2.vertexBuffer);
            expect(a).toStrictEqual(b);
        }
    });
});
