import React, { Component } from "react";

type Props = {
    initial?: number;
    onChange?: (newAlpha: number) => void;
};

type State = {
    alpha: number;
};

export default class UserInput extends Component<Props, State> {
    private ref = React.createRef<HTMLDivElement>();

    public constructor(props: Props) {
        super(props);
        this.state = { alpha: props.initial ?? 0.0 };

        this.clickHandler = this.clickHandler.bind(this);
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    }

    public render() {
        return (
            <div
                id="input-container"
                ref={this.ref}
                onClick={this.clickHandler}
            >
                <div id="input-viz-ring">
                    <div
                        id="input-viz-marker"
                        style={{ transform: `rotate(${this.state.alpha}rad)` }}
                    ></div>
                </div>
            </div>
        );
    }

    private clickHandler() {
        if (document.pointerLockElement !== this.ref.current) {
            this.ref.current!.requestPointerLock();
        }
    }

    private mouseMoveHandler(e: MouseEvent) {
        this.setState((state) => {
            if (document.pointerLockElement === this.ref.current) {
                let alpha = state.alpha;
                let x = 2*Math.cos(alpha);
                let y = 2*Math.sin(alpha);

                x += 0.01 * e.movementX;
                y += 0.01 * e.movementY;

                return {
                    alpha: x === 0.0 && y === 0.0 ? alpha : Math.atan2(y, x),
                };
            } else {
                const x = e.pageX - 0.5 * window.innerWidth;
                const y = e.pageY - 0.5 * window.innerHeight;

                return { alpha: Math.atan2(y, x) };
            }
        });
    }

    componentDidMount() {
        document.addEventListener("mousemove", this.mouseMoveHandler, false);
    }

    componentWillUnmount() {
        document.exitPointerLock();
        document.removeEventListener("mousemove", this.mouseMoveHandler, false);
    }
}
