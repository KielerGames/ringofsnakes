import * as Preact from "preact";
import { TextDescriptor, TextLayer } from "../../ui/components/TextLayer";

let container: HTMLElement | null = null;
const textToRender: TextDescriptor[] = [];

export function init(textLayer: HTMLElement): void {
    container = textLayer;
}

export function addText(text: string, key: string, options: TextOptions): void {
    textToRender.push({ text, key, size: 12, ...options });
}

export function renderAll(): void {
    if (container === null) {
        throw new Error("Text renderer not initialized.");
    }

    Preact.render(Preact.createElement(TextLayer, { texts: textToRender }), container);

    textToRender.length = 0;
}

type RequiredTextOptions = { x: number; y: number };
type TextOptions = Partial<Omit<TextDescriptor, "text" | "x" | "y">> & RequiredTextOptions;
