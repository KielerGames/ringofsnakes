import PointerInput from "./sources/PointerInput";
import KeyboardInput from "./sources/KeyboardInput";
import { normalizeAngle } from "../math/Angle";
import InputSource, { DeviceName, InputState } from "./sources/InputSource";
import { Consumer } from "../util/FunctionTypes";

export type UserInputListener = (wantsFast: boolean, direction: number) => void;
export type DeviceChangeListener = Consumer<DeviceName>;

const inputListeners = new Set<UserInputListener>();
const deviceChangeListeners = new Set<DeviceChangeListener>();

const pointerInput = new PointerInput();
const keyboardInput = new KeyboardInput(() => ({ wantsFast: lastFast, direction: lastDirection }));

let lastFast: boolean = false;
let lastDirection: number = 0.0;
let lastSource: DeviceName | "no-device" = "no-device";

export function addListener(listener: UserInputListener): void {
    inputListeners.add(listener);
}

export function addDeviceChangeListener(listener: DeviceChangeListener): void {
    deviceChangeListeners.add(listener);
}

// TODO this should be called
export function removeListener(listener: UserInputListener) {
    inputListeners.delete(listener);
}

export function removeAllListeners(): void {
    inputListeners.clear();
}

export function init(clickCatcher: HTMLElement): void {
    pointerInput.setClickCatcher(clickCatcher);
}

export function tick(): void {
    keyboardInput.tick();
}

function createInputChangeHandler(device: InputSource) {
    return (state: Partial<InputState>) => {
        const direction =
            state.direction !== undefined ? normalizeAngle(state.direction) : lastDirection;
        const wantsFast = state.wantsFast ?? lastFast;

        if (lastFast === wantsFast && lastDirection === direction) {
            return;
        }

        lastDirection = direction;
        lastFast = wantsFast;

        inputListeners.forEach((listener) => listener(wantsFast, direction));

        const source = device.getDeviceName();

        if (lastSource !== source) {
            lastSource = source;
            deviceChangeListeners.forEach((listener) => listener(source));
        }
    };
}

pointerInput.addListener(createInputChangeHandler(pointerInput));
keyboardInput.addListener(createInputChangeHandler(keyboardInput));
