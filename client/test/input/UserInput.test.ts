import * as UserInput from "../../src/app/input/UserInput";
import * as FrameTime from "../../src/app/util/FrameTime";

describe("UserInput", () => {
    const windowEvents = jest.fn();
    window.addEventListener = windowEvents;

    beforeEach(() => {
        windowEvents.mockClear();
        UserInput.removeAllListeners();
        UserInput.init(document.createElement("div"));
        FrameTime.update(0.0);
        UserInput.tick();
    });

    function pressKey(key: string) {
        const event = new KeyboardEvent("keydown", { key });
        windowEvents.mock.calls
            .filter((args) => args[0] === "keydown")
            .forEach((args) => {
                const listener = args[1];
                listener(event);
            });
    }

    function releaseKey(key: string) {
        const event = new KeyboardEvent("keyup", { key });
        windowEvents.mock.calls
            .filter((args) => args[0] === "keyup")
            .forEach((args) => {
                const listener = args[1];
                listener(event);
            });
    }

    function tick() {
        FrameTime.update(FrameTime.now() + 20);
        UserInput.tick();
    }

    test("neutral keyboard inputs", () => {
        const listener = jest.fn();
        UserInput.addListener(listener);
        expect(listener).not.toBeCalled();

        console.log(windowEvents.mock.calls);

        pressKey("ArrowLeft");
        tick();
        expect(listener).toBeCalledTimes(1);

        pressKey("ArrowRight");
        tick();
        expect(listener).toBeCalledTimes(1);

        releaseKey("ArrowLeft");
        tick();
        expect(listener).toBeCalledTimes(2);
    });
});
