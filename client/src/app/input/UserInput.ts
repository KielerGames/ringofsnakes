export type UserInputListener = (wantsFast: boolean, direction: number) => void;

const listeners = new Set<UserInputListener>();

export function addListener(listener: UserInputListener) {
    listeners.add(listener);

    if(__DEBUG__ && listeners.size > 1) {
        console.warn(`Multiple (${listeners.size}) user input listeners.`);
    }
}

export function removeListener(listener: UserInputListener) {
    listeners.delete(listener);
}
