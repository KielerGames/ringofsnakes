import { Component } from "preact";
import { Consumer } from "../../util/FunctionTypes";
import { DialogOptions } from "../Dialogs";

type Props = {
    options: DialogOptions;
    onExit: Consumer<string>;
};

export default class DialogModal extends Component<Props> {
    render() {
        const options = this.props.options;
        const buttons = options.buttons ?? [];
        return (
            <div class="dialog-modal">
                {options.title ? <div class="dialog-title">{options.title}</div> : null}
                <div class="dialog-content">{options.content}</div>
                <div class="dialog-buttons">
                    {buttons.map((button) => (
                        <button
                            key={button.label}
                            onClick={() => {
                                let value = button.value;
                                if (button.action) {
                                    value = button.action();
                                }
                                let shouldClose = true;
                                if (button.shouldClose) {
                                    shouldClose = button.shouldClose();
                                }
                                if (shouldClose) {
                                    this.props.onExit(value!);
                                }
                            }}
                        >
                            {button.label}
                        </button>
                    ))}
                </div>
            </div>
        );
    }
}
