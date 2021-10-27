import assert from "../utilities/assert";
import { normalizeAngle, toRadians } from "./utils";

const MAX_PREDICTION_TIME = 1.0 / 15;
const MAX_CHANGE = MAX_PREDICTION_TIME * toRadians(100); // TODO tim-we
const MAX_DIFF = toRadians(20);

export default class PredictedAngle {
    private dataTime: number;
    private targetAngle: number;
    private currentAngle: number;
    private lastKnownAngle: number;

    public constructor(value: number, time = performance.now()) {
        this.currentAngle = value;
        this.targetAngle = value;
        this.lastKnownAngle = value;
        this.dataTime = time;
    }

    public predictValue(timeSinceLastUpdate: number): number {
        const t =
            Math.min(timeSinceLastUpdate, MAX_PREDICTION_TIME) /
            MAX_PREDICTION_TIME;
        const a = (1 - t) * this.currentAngle + t * this.targetAngle;

        const d = minDiff(this.lastKnownAngle, a);
        if (Math.abs(d) > MAX_DIFF) {
            return this.lastKnownAngle + Math.sign(d) * MAX_DIFF;
        }

        return a;
    }

    public update(angle: number, target: number, time: number): void {
        assert(time >= this.dataTime, "update from the past");
        const dt = time - this.dataTime;

        // set current angle to the current predicted angle
        this.currentAngle = normalizeAngle(this.predictValue(dt));

        this.lastKnownAngle = angle;
        this.dataTime = time;

        // update target angle
        let d = minDiff(this.currentAngle, target);
        if (Math.abs(d) > MAX_CHANGE) { // TODO tim-we
            d *= MAX_CHANGE / Math.abs(d);
        }
        this.targetAngle = this.currentAngle + d;
    }
}

/**
 * a + minDiff(a,b) = b
 */
function minDiff(a: number, b: number): number {
    let d = b - a;
    let d2 = d - Math.sign(d) * 2 * Math.PI;
    return Math.abs(d2) < Math.abs(d) ? d2 : d;
}
