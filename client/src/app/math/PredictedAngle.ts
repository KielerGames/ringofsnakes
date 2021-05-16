import assert from "../utilities/assert";
import { normalizeAngle } from "./utils";

const MAX_PREDICTION_TIME = 1 / 15;
const MAX_CHANGE = MAX_PREDICTION_TIME * (25 * 5 * Math.PI / 180);
const MAX_DIFF = 0.35;

export default class PredictedAngle {
    private dataTime: number;
    private targetAngle: number;
    private angle: number;
    private lastKnownAngle: number;

    public constructor(value: number, time = performance.now()) {
        this.angle = value;
        this.targetAngle = value;
        this.lastKnownAngle = value;
        this.dataTime = time;
    }

    public predict(timeSinceLastUpdate: number): number {
        const t =
            Math.min(timeSinceLastUpdate, MAX_PREDICTION_TIME) /
            MAX_PREDICTION_TIME;
        const a =  (1 - t) * this.angle + t * this.targetAngle;

        const d = minDiff(a, this.lastKnownAngle);
        if(Math.abs(d) > MAX_DIFF) {
            return this.lastKnownAngle + Math.sign(d) * MAX_DIFF;
        }

        return a;
    }

    public update(angle: number, target: number, time: number): void {
        assert(time >= this.dataTime, "update from the past");
        const dt = time - this.dataTime;
        this.angle = normalizeAngle(this.predict(dt));
        this.lastKnownAngle = angle;
        this.dataTime = time;
        let d = minDiff(this.angle, target);
        if (Math.abs(d) > MAX_CHANGE) {
            d *= MAX_CHANGE / Math.abs(d);
        }
        this.targetAngle = this.angle + d;
    }
}

function minDiff(a: number, b: number): number {
    let d = b - a;
    let d2 = d - Math.sign(d) * 2 * Math.PI;
    return Math.abs(d2) < Math.abs(d) ? d2 : d;
}
