import PointerInput from "./sources/PointerInput";
import KeyboardInput from "./sources/KeyboardInput";

export type UserInputListener = (wantsFast: boolean, direction: number) => void;

const listeners = new Set<UserInputListener>();

const pointerInput = new PointerInput();
const keyboardInput = new KeyboardInput();

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

function inputChangeHandler(wantsFast: boolean, direction: number): void {
    listeners.forEach((listener) => listener(wantsFast, direction));
}

pointerInput.addListener(inputChangeHandler);
keyboardInput.addListener(inputChangeHandler);
