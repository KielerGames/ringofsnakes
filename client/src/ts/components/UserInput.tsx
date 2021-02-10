import React, { Component } from "react";

type Props = {
    initial?: number;
    onChange?: (newAlpha: number) => void;
};

type State = {
    alpha: number;
    lastChange: number;
};

export default class UserInput extends Component<Props, State> {
    private ref = React.createRef<HTMLDivElement>();
    private timeout: number | undefined;

    public constructor(props: Props) {
        super(props);
        this.state = { alpha: props.initial ?? 0.0, lastChange: -Infinity };

        this.clickHandler = this.clickHandler.bind(this);
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    }

    public render() {
        const time = (performance.now() - this.state.lastChange) / 1000;
        return (
            <div
                id="input-container"
                ref={this.ref}
                onClick={this.clickHandler}
            >
                <div id="input-viz-ring" className={time > 1 ? "hide" : ""}>
                    <div
                        id="input-viz-marker"
                        style={{ transform: `rotate(${-this.state.alpha}rad)` }}
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
        this.setState(
            (state) => {
                if (document.pointerLockElement === this.ref.current) {
                    let alpha = state.alpha;
                    let x = 2 * Math.cos(alpha);
                    let y = 2 * Math.sin(alpha);

                    x += 0.01 * e.movementX;
                    y -= 0.01 * e.movementY;

                    return {
                        alpha:
                            x === 0.0 && y === 0.0 ? alpha : Math.atan2(y, x),
                        lastChange: performance.now(),
                    };
                } else {
                    const x = e.pageX - 0.5 * window.innerWidth;
                    const y = 0.5 * window.innerHeight - e.pageY;

                    return {
                        alpha: Math.atan2(y, x),
                        lastChange: performance.now(),
                    };
                }
            },
            () => {
                if (this.props.onChange) {
                    this.props.onChange(this.state.alpha);
                }
                if (this.timeout !== undefined) {
                    window.clearTimeout(this.timeout);
                    this.timeout = undefined;
                }
                this.timeout = window.setTimeout(() => {
                    this.timeout = undefined;
                    this.forceUpdate();
                }, 1000);
            }
        );
    }

    componentDidMount() {
        document.addEventListener("mousemove", this.mouseMoveHandler, false);
    }

    componentWillUnmount() {
        document.exitPointerLock();
        document.removeEventListener("mousemove", this.mouseMoveHandler, false);
    }
}
