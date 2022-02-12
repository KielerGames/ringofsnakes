import * as SID from "../../../src/app/worker/decoder/SnakeInfoDecoder";
import defaultConfig from "../../data/config/GameConfig.prefab";

describe("SnakeInfoDecoder", () => {
    it("should accept valid buffers", () => {
        const buffer = new Uint8Array(SID.SNAKE_INFO_SIZE).buffer;
        expect(() => SID.decode(buffer, 0, defaultConfig)).not.toThrow();
    });
});
