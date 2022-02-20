import * as Preact from "preact";
import { ComponentChild } from "preact";
import { Consumer, Producer } from "../util/FunctionTypes";
import DialogModal from "./components/DialogModal";

const dialogQueue: QueuedDialog[] = [];
const dialogLayer: HTMLElement = document.createElement("div");
let current: QueuedDialog | null = null;

export function dialog(options: DialogOptions): Promise<string> {
    return new Promise<string>((resolve) => {
        dialogQueue.push({
            options: { buttons: [{ label: "Ok", value: "ok" }], ...options },
            onExit: (value) => {
                current = null;
                resolve(value);
                showNextDialog();
            }
        });
        showNextDialog();
    });
}

export function init(): void {
    dialogLayer.id = "dialogLayer";
    document.body.appendChild(dialogLayer);
}

function showNextDialog() {
    if (current !== null) {
        return;
    }
    const queuedDialog = dialogQueue.shift();
    dialogLayer.innerHTML = "";
    if (!queuedDialog) {
        dialogLayer.classList.remove("show");
        return;
    }
    current = queuedDialog;
    Preact.render(Preact.createElement(DialogModal, queuedDialog), dialogLayer);
    dialogLayer.classList.add("show");
}

export type DialogOptions = {
    title?: string;
    content: ComponentChild;
    buttons?: DialogButton[];
};

type DialogButton = {
    label: string;
    shouldClose?: Producer<boolean>;
} & ({ value: string; action?: never } | { action: Producer<string>; value?: never });

type QueuedDialog = {
    options: DialogOptions;
    onExit: Consumer<string>;
};
