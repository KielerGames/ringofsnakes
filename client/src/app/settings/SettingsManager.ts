import { Consumer } from "../util/FunctionTypes";

const settings = new Map<SettingId, Setting>();
const currentValues = new Map<SettingId, unknown>();
const valueChangeListeners = new Map<SettingId, Consumer<unknown>[]>();

export function setValue<T>(id: SettingId, value: T): void {
    currentValues.set(id, value);
    const listeners = valueChangeListeners.get(id) ?? [];
    listeners.forEach((listener) => listener(value));
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
    if (currentValues.has(id)) {
        listener(currentValues.get(id) as T);
    } else {
        listener(setting.default as unknown as T);
    }
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

type Setting =
    | BaseSetting<boolean, "boolean">
    | BaseSetting<number, "float">
    | BaseSetting<number, "integer">;

type SettingId = Setting["id"];

type BaseSetting<T, TS extends string> = {
    id: string;
    label: string;
    default: T;
    type: TS;
};
