import InputSource from "./InputSource";

type Action = "left" | "right" | "fast";
type Key = string;

export default class KeyboardInput extends InputSource {
    private pressed: Set<Key> = new Set();
    private keyMappings: Map<Action, Set<Key>> = new Map();

    constructor() {
        super();

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
        keys.forEach((key) => keySet.add(key.toLowerCase()));
        this.keyMappings.set(action, keySet);
    }

    tick(): void {
        const wantsFast = this.isPressed("fast");
        const direction = this.getCurrentDirection();
        let change = 0.0;

        if (this.isPressed("left")) {
            change += 0.1;
        } else if (this.isPressed("right")) {
            change -= 0.1;
        }

        this.set(wantsFast, direction + change);
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
}
