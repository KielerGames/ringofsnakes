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
            <div class="dialog-container">
                <div class="dialog-shadow"></div>
                <div class="dialog-modal">
                    {options.title ? <div class="dialog-title">{options.title}</div> : null}
                    <div class="dialog-content">{options.content}</div>
                    <div class="dialog-buttons">
                        {buttons.map((button) => (
                            <button
                                key={button.label}
                                onClick={() => {
                                    const value = button.action ? button.action() : button.value;

                                    if (value !== undefined) {
                                        this.props.onExit(value);
                                    }
                                }}
                            >
                                {button.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}
