import PointerInput from "./sources/PointerInput";
import KeyboardInput from "./sources/KeyboardInput";
import { normalizeAngle } from "../math/Angle";
import { InputState } from "./sources/InputSource";

export type UserInputListener = (wantsFast: boolean, direction: number) => void;

const listeners = new Set<UserInputListener>();

const pointerInput = new PointerInput();
const keyboardInput = new KeyboardInput(() => ({ wantsFast: lastFast, direction: lastDirection }));

let lastFast: boolean = false;
let lastDirection: number = 0.0;

export function addListener(listener: UserInputListener) {
    listeners.add(listener);

    if (__DEBUG__ && listeners.size > 1) {
        console.warn(`Multiple (${listeners.size}) user input listeners.`);
    }
}

// TODO this should be called
export function removeListener(listener: UserInputListener) {
    listeners.delete(listener);
}

export function removeAllListeners(): void {
    listeners.clear();
}

export function init(clickCatcher: HTMLElement): void {
    pointerInput.setClickCatcher(clickCatcher);
}

export function tick(): void {
    keyboardInput.tick();
}

function inputChangeHandler(state: Partial<InputState>): void {
    const direction =
        state.direction !== undefined ? normalizeAngle(state.direction) : lastDirection;
    const wantsFast = state.wantsFast ?? lastFast;

    if (lastFast === wantsFast && lastDirection === direction) {
        return;
    }

    lastDirection = direction;
    lastFast = wantsFast;

    listeners.forEach((listener) => listener(wantsFast, direction));
}

pointerInput.addListener(inputChangeHandler);
keyboardInput.addListener(inputChangeHandler);
