import { Consumer } from "./FunctionTypes";

export class AppEvent<T = void> {
    readonly #listeners = new Set<Consumer<T>>();
    #done = false;

    addListener(listener: Consumer<T>): void {
        if (this.#done) {
            return;
        }
        this.#listeners.add(listener);
    }

    trigger(data: T): void {
        if (__DEBUG__ && this.#done) {
            throw new Error("Event cannot be triggered anymore.");
        }
        this.#listeners.forEach((listener) => listener(data));
    }

    done(): void {
        this.#listeners.clear();
        this.#done = true;
    }
}
