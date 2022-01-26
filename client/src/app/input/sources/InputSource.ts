type InputChangeListener = (wantsFast: boolean, direction: number) => void;

export default abstract class InputSource {
    private listeners: Set<InputChangeListener> = new Set();
    private wantsFast: boolean = false;
    private direction: number = 0.0;

    public addListener(listener: InputChangeListener): void {
        this.listeners.add(listener);
    }

    protected setWantsFast(value: boolean): void {
        if (value === this.wantsFast) {
            return;
        }

        this.wantsFast = value;
        this.notifyListeners();
    }

    protected setDirection(value: number): void {
        if (value === this.direction) {
            return;
        }

        this.direction = value;
        this.notifyListeners();
    }

    private notifyListeners() {
        this.listeners.forEach((listener) =>
            listener(this.wantsFast, this.direction)
        );
    }
}
