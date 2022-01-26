import assert from "../../util/assert";

let clickCatcher: HTMLElement = document.body;

export function setClickCatcher(element: HTMLElement): void {
    assert(element != null);
    // remove previous event listeners
    clickCatcher.removeEventListener("pointerdown", pointerDownHandler);
    clickCatcher.removeEventListener("pointerup", pointerUpHandler);
    clickCatcher.removeEventListener("pointercancel", pointerUpHandler);

    clickCatcher = element;

    // setup event listeners on new element
    clickCatcher.addEventListener("pointerdown", pointerDownHandler);
    clickCatcher.addEventListener("pointerup", pointerUpHandler);
    clickCatcher.addEventListener("pointercancel", pointerUpHandler);
}

function pointerDownHandler(e: PointerEvent) {}

function pointerUpHandler(e: PointerEvent) {}

window.addEventListener("pointermove", (e) => {});
