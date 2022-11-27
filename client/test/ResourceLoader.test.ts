import { LoadingStage } from "../src/app/ResourceLoader";

global.fetch = jest.fn(() => Promise.reject(new Error("fetch called in test")));

beforeEach(() => {
    jest.mocked(fetch).mockClear();
});

const testObj = Object.freeze({
    a: 42,
    b: "snake"
});

describe("ResourceLoader", () => {
    test("no unexpected fetch requests", () => {
        expect.assertions(1);
        new LoadingStage();
        expect(jest.mocked(fetch)).not.toBeCalled();
    });

    test("loading valid JSON", async () => {
        expect.assertions(2);
        jest.mocked(fetch).mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(testObj)
            } as Response)
        );
        const stage = new LoadingStage();
        const json = await stage.loadJSON("https://example.com/api/json");
        expect(jest.mocked(fetch)).toBeCalledTimes(1);
        expect(json).toBe(testObj);
    });

    test("progress", async () => {
        expect.assertions(2);
        jest.mocked(fetch).mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(testObj)
            } as Response)
        );
        const stage = new LoadingStage();
        expect(stage.progress).toBe(0);
        await stage.loadJSON("https://example.com/api/json");
        expect(stage.progress).toBe(1);
    });
});
