type InputChangeListener = (change: Partial<InputState>) => void;

export type InputState = {
    wantsFast: boolean;
    direction: number;
};

export type DeviceName = "keyboard" | "pointer";

export default abstract class InputSource {
    private readonly listeners: Set<InputChangeListener> = new Set();
    private readonly _deviceName: DeviceName;

    protected constructor(deviceName: DeviceName) {
        this._deviceName = deviceName;
    }

    addListener(listener: InputChangeListener): void {
        this.listeners.add(listener);
    }

    protected set(newState: Partial<InputState>): void {
        this.notifyListeners(newState);
    }

    private notifyListeners(change: Partial<InputState>) {
        this.listeners.forEach((listener) => listener(change));
    }

    public getDeviceName(): DeviceName {
        return this._deviceName;
    }
}
