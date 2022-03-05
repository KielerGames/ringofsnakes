import Setting from "../../src/app/settings/Setting";

describe("Settings", () => {
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

    test("persistence", () => {
        // test restore
        const setItemSpy = jest.spyOn(localStorage.__proto__, "setItem");
        const getItemSpy = jest.spyOn(localStorage.__proto__, "getItem");

        getItemSpy.mockReturnValueOnce("42");

        const testSetting = new Setting("test.setting", 13, "Test Setting");
        const valueListener = jest.fn();
        testSetting.subscribe(valueListener);
        expect(valueListener).toBeCalledTimes(1);
        expect(valueListener.mock.calls[0][0]).toBe(42);

        // test save
        expect(setItemSpy).not.toBeCalled();
        testSetting.setValue(7);
        expect(setItemSpy).toBeCalledTimes(1);
        expect(setItemSpy.mock.calls[0][1]).toBe("7");
    });
});
