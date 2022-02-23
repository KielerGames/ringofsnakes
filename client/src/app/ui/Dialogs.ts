import * as Preact from "preact";
import { ComponentChild } from "preact";
import { Callback, Consumer, Producer } from "../util/FunctionTypes";
import DialogModal from "./components/DialogModal";

const dialogQueue: QueuedDialog[] = [];
const dialogLayer: HTMLElement = document.createElement("div");
let current: QueuedDialog | null = null;

/**
 * Display a dialog to the user.
 * @param options
 * @returns A promise that resolves when the dialog is closed.
 */
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
    Preact.render(null, dialogLayer);
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
} & ({ value: string; action?: never } | { action: ButtonAction; value?: never });

type QueuedDialog = {
    options: DialogOptions;
    onExit: Consumer<string>;
};

/**
 * If the callback returns a string the dialog will close with that value.
 * If the callback returns undefined the dialog will not close.
 */
type ButtonAction = Producer<string | undefined> | Callback;
