import PointerInput from "./sources/PointerInput";
import KeyboardInput from "./sources/KeyboardInput";
import { normalizeAngle } from "../math/Angle";
import InputSource, { DeviceName, InputState } from "./sources/InputSource";
import { Consumer } from "../util/FunctionTypes";

export type UserInputListener = (wantsFast: boolean, direction: number) => void;
export type DeviceChangeListener = Consumer<DeviceName>;
type TickedInputSource = KeyboardInput;

const inputListeners = new Set<UserInputListener>();
const deviceChangeListeners = new Set<DeviceChangeListener>();
const tickedInputSources: TickedInputSource[] = [];

// input state
let lastFast: boolean = false;
let lastDirection: number = 0.0;
let lastSource: DeviceName | undefined = undefined;

/**
 * Listen for user input changes (fast & direction).
 */
export function addListener(listener: UserInputListener): void {
    inputListeners.add(listener);
}

/**
 * Listen for user input device changes.
 */
export function addDeviceChangeListener(listener: DeviceChangeListener): void {
    deviceChangeListeners.add(listener);
}

export function removeListener(listener: UserInputListener) {
    inputListeners.delete(listener);
}

export function removeAllListeners(): void {
    inputListeners.clear();
    deviceChangeListeners.clear();
}

/**
 * Initialize user input module.
 * @param clickCatcher A HTMLElement that catches click/touch events.
 */
export function init(clickCatcher: HTMLElement): void {
    tickedInputSources.length = 0;

    const pointerInput: PointerInput = new PointerInput();
    pointerInput.setClickCatcher(clickCatcher);

    addInputSource(pointerInput);
    addInputSource(new KeyboardInput(() => ({ wantsFast: lastFast, direction: lastDirection })));
}

/**
 * Should be called once per frame.
 */
export function tick(): void {
    tickedInputSources.forEach((source) => source.tick());
}

function createInputChangeHandler(device: InputSource) {
    return (state: Partial<InputState>) => {
        // unpack partial new input state
        const direction =
            state.direction !== undefined ? normalizeAngle(state.direction) : lastDirection;
        const wantsFast = state.wantsFast ?? lastFast;

        if (lastFast === wantsFast && lastDirection === direction) {
            return;
        }

        // update input state
        lastDirection = direction;
        lastFast = wantsFast;

        // notify listeners
        inputListeners.forEach((listener) => listener(wantsFast, direction));

        // did the device change?
        const source = device.getDeviceName();
        if (lastSource !== source) {
            lastSource = source;
            deviceChangeListeners.forEach((listener) => listener(source));
        }
    };
}

function addInputSource(source: InputSource): void {
    if (source instanceof KeyboardInput) {
        tickedInputSources.push(source);
    }
    source.addListener(createInputChangeHandler(source));
}
