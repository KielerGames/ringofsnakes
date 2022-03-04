import Setting from "../../src/app/settings/Setting";

describe("Settings", () => {
    const storageMock = {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        length: 0,
        key: jest.fn()
    };

    beforeEach(() => {
        window.localStorage = storageMock;
        storageMock.setItem.mockClear();
        storageMock.getItem.mockClear();
        storageMock.removeItem.mockClear();
    });

    afterEach(() => {
        Setting.resetForTests();
    });

    test("default value", () => {
        const testSetting = new Setting("test.setting", 42, "Test Setting");
        const valueListener = jest.fn();
        testSetting.subscribe(valueListener);
        expect(valueListener).toBeCalledTimes(1);
        expect(valueListener.mock.calls[0][0]).toBe(testSetting.defaultValue);
    });

    test("value changes", () => {
        const testSetting = new Setting("test.setting", "value", "Test Setting");
        const valueListener = jest.fn();
        testSetting.subscribe(valueListener);
        expect(valueListener).toBeCalledTimes(1);

        // change value
        testSetting.setValue("Hello World");
        testSetting.setValue("1234");
        expect(valueListener).toBeCalledTimes(3);
        expect(valueListener.mock.calls[2][0]).toBe("1234");

        // reset
        testSetting.resetValue();
        expect(valueListener).toBeCalledTimes(4);
        expect(valueListener.mock.calls[3][0]).toBe(testSetting.defaultValue);
    });
});
