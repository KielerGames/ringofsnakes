import { Consumer } from "./FunctionTypes";

export class AppEvent<T = void> {
    readonly #listeners = new Set<Consumer<T>>();

    addListener(listener: Consumer<T>): void {
        this.#listeners.add(listener);
    }

    trigger(data: T): void {
        this.#listeners.forEach((listener) => listener(data));
    }
}
