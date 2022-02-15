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
    marker.id = "input-viz-marker";
})();

UserInput.addListener((_, direction) => {
    marker.style.transform = `rotate(${-direction}rad)`;
});
