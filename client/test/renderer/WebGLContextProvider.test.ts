import * as ContextProvider from "../../src/app/renderer/WebGLContextProvider";

describe("WebGLContextProvider", () => {
    it("should throw if not initialized", () => {
        expect(() => ContextProvider.getContext()).toThrow();
    });
});
