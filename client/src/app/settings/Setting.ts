import { Consumer } from "../util/FunctionTypes";

const prefix = "settings";
const usedIds = new Set<string>();

export default class Setting<T> {
    readonly id: string;
    readonly defaultValue: T;
    readonly label: string;

    private userValue: T | null;
    private hasUserValue: boolean = false;
    private listeners: Consumer<T>[] = [];

    public constructor(id: string, defaultValue: T, label: string) {
        this.id = id;
        this.defaultValue = defaultValue;
        this.label = label;

        if (__DEBUG__) {
            if (!/^[a-z.]+$/i.test(id)) {
                throw new Error(`Invalid id: ${id}`);
            }
            if (usedIds.has(id)) {
                throw new Error(`Setting Ids must be unique (${id}).`);
            }
            usedIds.add(id);
        }

        try {
            const result = window.localStorage.getItem(this.storageKey);

            if (result !== null) {
                this.userValue = JSON.parse(result);
                this.hasUserValue = true;
                if (__DEBUG__ && !__TEST__) {
                    console.info(`User setting loaded: ${id}:`, this.userValue);
                }
            }
        } catch (e) {
            console.warn(`Failed to load value from local storage.`);
        }
    }

    /**
     * Set the setting to specific value. Notifies listeners about changes.
     */
    setValue(newValue: T): void {
        const current = this.value;

        if (this.hasUserValue && current === newValue) {
            return;
        }

        this.userValue = newValue;
        this.hasUserValue = true;

        this.persist();
        this.notifyListeners(newValue);
    }

    /**
     * Reset the setting to the default value.
     */
    resetValue(): void {
        if (!this.hasUserValue) {
            return;
        }

        const oldValue = this.userValue;
        this.userValue = null;
        this.hasUserValue = false;
        this.persist();

        if (oldValue !== this.defaultValue) {
            this.notifyListeners(this.defaultValue);
        }
    }

    /**
     * Subscribe to changes to the value of this setting.
     * The listener callback will be called immediately with the current value.
     */
    subscribe(listener: Consumer<T>): void {
        this.listeners.push(listener);
        listener(this.value);
    }

    private get value(): T {
        if (this.hasUserValue) {
            return this.userValue!;
        }
        return this.defaultValue;
    }

    private notifyListeners(value: T): void {
        this.listeners.forEach((listener) => listener(value));
    }

    private get storageKey(): string {
        return prefix + "." + this.id;
    }

    private persist(): void {
        const key = this.storageKey;
        if (this.hasUserValue) {
            window.localStorage.setItem(key, JSON.stringify(this.value));
        } else {
            window.localStorage.removeItem(key);
        }
    }

    static resetForTests(): void {
        usedIds.clear();
    }
}
