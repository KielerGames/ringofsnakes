type InputChangeListener = (change: Partial<InputState>) => void;

export type InputState = {
    wantsFast: boolean;
    direction: number;
};

export default abstract class InputSource {
    private readonly listeners: Set<InputChangeListener> = new Set();

    addListener(listener: InputChangeListener): void {
        this.listeners.add(listener);
    }

    protected set(newState: Partial<InputState>): void {
        this.notifyListeners(newState);
    }

    private notifyListeners(change: Partial<InputState>) {
        this.listeners.forEach((listener) => listener(change));
    }
}
