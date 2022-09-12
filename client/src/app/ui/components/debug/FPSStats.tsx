import { Component, createRef } from "preact";

const barWidth = 2;
const canvasUpdateFrequency = 3; // Hz

type Props = {
    maxFPS?: number;
};

type State = {
    fps?: number;
};

export default class FPSStats extends Component<Props, State> {
    #canvasRef = createRef<HTMLCanvasElement>();
    #ctx: CanvasRenderingContext2D;
    #rafHandle: number;
    #frameCountCanvas = 0;
    #frameCountText = 0;
    #lastCanvasUpdate: number;
    #lastTextUpdate: number;
    #maxFPS: number;

    constructor(props: Props) {
        super(props);
        this.#maxFPS = props.maxFPS ?? 60;
    }

    componentDidMount() {
        // init
        const ctx = this.#canvasRef.current!.getContext("2d", { alpha: false })!;
        this.#ctx = ctx;
        this.#lastCanvasUpdate = performance.now();
        this.#lastTextUpdate = this.#lastCanvasUpdate;

        // background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // start frame counting
        this.#rafHandle = window.requestAnimationFrame(this.#beforeFrame.bind(this));
    }

    #beforeFrame() {
        const now = performance.now();
        const canvasDelta = now - this.#lastCanvasUpdate;
        const textDelta = now - this.#lastTextUpdate;
        const canvasUpdateInterval = 1000 / canvasUpdateFrequency;

        if (canvasDelta >= canvasUpdateInterval) {
            this.#updateCanvas();
            this.#lastCanvasUpdate = now - (canvasDelta - canvasUpdateInterval);
            this.#frameCountCanvas = 0;
        }

        if (textDelta >= 1000) {
            const fps = this.#frameCountText;
            this.#frameCountText = 0;
            this.#lastTextUpdate = now - (textDelta - 1000);
            this.setState({ fps });
        }

        this.#frameCountCanvas++;
        this.#frameCountText++;

        this.#rafHandle = window.requestAnimationFrame(this.#beforeFrame.bind(this));
    }

    #updateCanvas() {
        const ctx = this.#ctx;
        const canvas = ctx.canvas;

        const fps = this.#frameCountCanvas * canvasUpdateFrequency;

        if (fps > this.#maxFPS) {
            // update scale
            const height = Math.round((canvas.height * this.#maxFPS) / fps);
            ctx.drawImage(canvas, 0, canvas.height - height, canvas.width, height);

            // draw background
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height - height);

            this.#maxFPS = fps;
        }

        // shift left
        const oldWidth = canvas.width - barWidth;
        ctx.drawImage(
            canvas,
            // source x & y
            barWidth,
            0,
            // source width & height
            oldWidth,
            canvas.height,
            // destination x & y
            0,
            0,
            // destination width & height
            oldWidth,
            canvas.height
        );

        // add new bar
        ctx.fillStyle = "black";
        ctx.fillRect(canvas.width - barWidth, canvas.height, barWidth, canvas.height);
        const h = Math.floor((canvas.height * fps) / this.#maxFPS);
        ctx.fillStyle = "white";
        ctx.fillRect(canvas.width - barWidth, canvas.height - h, barWidth, h);
    }

    componentWillUnmount() {
        window.cancelAnimationFrame(this.#rafHandle);
    }

    render() {
        return (
            <div id="fps-stats">
                <canvas ref={this.#canvasRef} width={100} height={42} />
                <div id="fps-text">{`FPS: ${this.state.fps ?? "-"}`}</div>
            </div>
        );
    }
}
