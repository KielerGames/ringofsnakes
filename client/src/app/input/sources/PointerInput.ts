import assert from "../../util/assert";
import InputSource from "./InputSource";

export default class PointerInput extends InputSource {
    private clickCatcher: HTMLElement | null = null;

    constructor() {
        super();

        this.pointerDownHandler = this.pointerDownHandler.bind(this);
        this.pointerUpHandler = this.pointerUpHandler.bind(this);

        window.addEventListener("pointermove", (e) => {
            const x = e.pageX - 0.5 * window.innerWidth;
            const y = 0.5 * window.innerHeight - e.pageY;
            if (x * x + y * y > 1) {
                const alpha = Math.atan2(y, x);
                this.set({ direction: alpha });
            }
        });
    }

    private pointerDownHandler(e: PointerEvent) {
        e.stopPropagation();
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
