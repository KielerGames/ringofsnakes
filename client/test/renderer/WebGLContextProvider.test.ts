import * as ContextProvider from "../../src/app/renderer/webgl/WebGLContextProvider";

// jest >27 somehow fails to import/parse preact
jest.mock("../../src/app/ui/Dialogs", () => ({}));

describe("WebGLContextProvider", () => {
    it("should throw if not initialized", () => {
        expect(() => ContextProvider.getContext()).toThrow();
    });
});
