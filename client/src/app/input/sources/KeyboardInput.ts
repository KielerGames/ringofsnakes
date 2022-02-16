import { Provider } from "../../util/FunctionTypes";
import InputSource, { InputState } from "./InputSource";

type Action = "left" | "right" | "fast";
type Key = string;

export default class KeyboardInput extends InputSource {
    private readonly pressed: Set<Key> = new Set();
    private readonly keyMappings: Map<Action, Set<Key>> = new Map();
    private readonly trackedKeys: Set<Key> = new Set();
    private readonly stateProvider: Provider<InputState>;
    private previousTickAnyPressed: boolean = false;

    constructor(provider: Provider<InputState>) {
        super();

        this.stateProvider = provider;

        this.addMappings("left", ["a", "ArrowLeft"]);
        this.addMappings("right", ["d", "ArrowRight"]);
        this.addMappings("fast", ["w", "ArrowUp", "Shift", " "]);

        window.addEventListener("keydown", (e) => {
            this.pressed.add(e.key.toLowerCase());
        });

        window.addEventListener("keyup", (e) => {
            this.pressed.delete(e.key.toLowerCase());
        });

        window.addEventListener("blur", () => {
            // when we lose keyboard focus no key should remain "pressed"
            this.pressed.clear();
        });
    }

    addMappings(action: Action, keys: Key[]): void {
        const keySet = this.keyMappings.get(action) ?? new Set();
        keys.forEach((key) => {
            const keyId = key.toLowerCase();
            keySet.add(keyId);
            this.trackedKeys.add(keyId);
        });
        this.keyMappings.set(action, keySet);
    }

    tick(): void {
        const anyPressed = this.anyPressed();

        if (!anyPressed && !this.previousTickAnyPressed) {
            return;
        }

        this.previousTickAnyPressed = anyPressed;

        const wantsFast = this.isPressed("fast");
        const direction = this.stateProvider().direction;
        let change = 0.0;

        if (this.isPressed("left")) {
            change += 0.05;
        } else if (this.isPressed("right")) {
            change -= 0.05;
        }

        this.set({ wantsFast, direction: direction + change });
    }

    private isPressed(action: Action): boolean {
        const keys = this.keyMappings.get(action);

        if (keys === undefined) {
            return false;
        }

        for (const key of keys) {
            if (this.pressed.has(key.toLowerCase())) {
                return true;
            }
        }

        return false;
    }

    private anyPressed(): boolean {
        for (const key of this.pressed) {
            if (this.trackedKeys.has(key)) {
                return true;
            }
        }

        return false;
    }
}
