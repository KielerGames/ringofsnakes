import assert from "../../util/assert";
import InputSource, { InputState } from "./InputSource";
import { pointerLockSetting } from "../../settings/SettingsDefinitions";
import { Provider } from "../../util/FunctionTypes";

export default class PointerInput extends InputSource {
    private clickCatcher: HTMLElement | null = null;
    private lockPointer: boolean = false;

    constructor(provider: Provider<InputState>) {
        super("pointer");

        this.pointerDownHandler = this.pointerDownHandler.bind(this);
        this.pointerUpHandler = this.pointerUpHandler.bind(this);

        window.addEventListener("pointermove", (e) => {
            if (this.clickCatcher !== null && document.pointerLockElement === this.clickCatcher) {
                // locked pointer mode
                const alpha = provider().direction;
                let x = 2 * Math.cos(alpha);
                let y = 2 * Math.sin(alpha);

                x += 0.01 * e.movementX;
                y -= 0.01 * e.movementY;

                if (x !== 0 || y !== 0) {
                    this.set({ direction: Math.atan2(y, x) });
                }
            } else {
                // free pointer mode
                const x = e.pageX - 0.5 * window.innerWidth;
                const y = 0.5 * window.innerHeight - e.pageY;
                if (x * x + y * y > 1) {
                    const alpha = Math.atan2(y, x);
                    this.set({ direction: alpha });
                }
            }
        });

        pointerLockSetting.subscribe((value: boolean) => (this.lockPointer = value));
    }

    private pointerDownHandler(e: PointerEvent) {
        e.stopPropagation();
        if (this.lockPointer && document.pointerLockElement !== this.clickCatcher) {
            this.clickCatcher?.requestPointerLock();
        }
        this.set({ wantsFast: true });
    }

    private pointerUpHandler(e: PointerEvent) {
        e.stopPropagation();
        this.set({ wantsFast: false });
    }

    setClickCatcher(element: HTMLElement): void {
        assert(element !== null);

        if (this.clickCatcher !== null) {
            // remove previous event listeners
            this.clickCatcher.removeEventListener("pointerdown", this.pointerDownHandler);
            this.clickCatcher.removeEventListener("pointerup", this.pointerUpHandler);
            this.clickCatcher.removeEventListener("pointercancel", this.pointerUpHandler);
        }

        // setup event listeners on new element
        element.addEventListener("pointerdown", this.pointerDownHandler);
        element.addEventListener("pointerup", this.pointerUpHandler);
        element.addEventListener("pointercancel", this.pointerUpHandler);

        this.clickCatcher = element;
    }
}
