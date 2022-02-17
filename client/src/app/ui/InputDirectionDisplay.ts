import * as UserInput from "../input/UserInput";

const container = document.createElement("div");
const ring = document.createElement("div");
const marker = document.createElement("div");

export function appendTo(parent: HTMLElement): void {
    parent.appendChild(container);
}

(function init() {
    ring.appendChild(marker);
    container.appendChild(ring);

    container.id = "input-container";
    ring.id = "input-viz-ring";
    ring.classList.add("hide");
    marker.id = "input-viz-marker";
})();

UserInput.addListener((_, direction) => {
    marker.style.transform = `rotate(${-direction}rad)`;
});

UserInput.addDeviceChangeListener((device) => {
    if (device === "keyboard") {
        ring.classList.remove("hide");
    } else {
        ring.classList.add("hide");
    }
});
