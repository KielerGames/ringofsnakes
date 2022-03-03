import { Consumer } from "../util/FunctionTypes";

const settings = new Map<SettingId, Setting>();
const currentValues = new Map<SettingId, unknown>();
const valueChangeListeners = new Map<SettingId, Consumer<unknown>[]>();

/**
 * Set a setting to specific value. Notifies listeners about changes.
 */
export function setValue<T>(id: SettingId, value: T): void {
    const current = getValue<T>(getSetting(id));
    if (current === value) {
        return;
    }

    // store new value
    currentValues.set(id, value);
    persist();

    notifyListeners(id, value);
}

/**
 * Reset a setting to the default value.
 */
export function resetValue(id: SettingId): void {
    const setting = getSetting(id);
    const current = getValue<unknown>(setting);

    if (currentValues.delete(id)) {
        persist();
    }

    if (current !== setting.default) {
        notifyListeners(id, setting.default);
    }
}

/**
 * Subscribe to a setting. The listener callback will be called immediately
 * with the current value and then once for every change.
 */
export function subscribe<T>(id: SettingId, listener: Consumer<T>): void {
    const setting = getSetting(id);

    if (!valueChangeListeners.has(id)) {
        valueChangeListeners.set(id, []);
    }

    // register change listener
    const listeners = valueChangeListeners.get(id)!;
    listeners.push(listener as Consumer<unknown>);

    // notify listener about current value
    listener(getValue(setting));
}

/**
 * Only to be used in SettingsDefinitions.ts.
 */
export function defineSetting(setting: Setting): void {
    settings.set(setting.id, setting);
}

function getSetting(id: SettingId): Readonly<Setting> {
    const setting = settings.get(id);

    if (setting === undefined) {
        throw new Error(`There is no setting "${id}".`);
    }

    return setting;
}

function getValue<T>(setting: Setting): T {
    if (currentValues.has(setting.id)) {
        return currentValues.get(setting.id) as T;
    } else {
        return setting.default as unknown as T;
    }
}

function notifyListeners<T>(id: string, value: T): void {
    const listeners = valueChangeListeners.get(id) ?? [];
    listeners.forEach((listener) => listener(value));
}

function persist() {
    const data = JSON.stringify([...currentValues]);
    window.localStorage.setItem("settings", data);
}

{
    // load changed values from local storage
    const changedValues = (() => {
        try {
            return JSON.parse(window.localStorage.getItem("settings") ?? "[]") as StoredSetting[];
        } catch (e) {
            console.error(e);
            return [];
        }
    })();

    changedValues.forEach(([id, value]) => currentValues.set(id, value));

    // notify listeners
    changedValues.forEach(([id, value]) => {
        notifyListeners(id, value);
    });
}

type Setting =
    | BaseSetting<boolean, "boolean">
    | BaseSetting<number, "float">
    | BaseSetting<number, "integer">;

type BaseSetting<T, TS extends string> = {
    id: string;
    label: string;
    default: T;
    type: TS;
};

type SettingId = Setting["id"];

type StoredSetting = [SettingId, Setting["default"]];
