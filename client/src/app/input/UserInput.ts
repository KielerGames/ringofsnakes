import PointerInput from "./sources/PointerInput";

export type UserInputListener = (wantsFast: boolean, direction: number) => void;

const listeners = new Set<UserInputListener>();

const pointerInput = new PointerInput();

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

pointerInput.addListener((wantsFast, direction) => {
    listeners.forEach((listener) => listener(wantsFast, direction));
});
