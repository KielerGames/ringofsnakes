const checkAndThrow = (condition: boolean, msg: string = "") => {
    if (!condition) {
        throw new Error(`AssertionError: ${msg}`);
    }
};

const noop = () => {
    /* eslint no-empty: "off" */
};

type AssertFunc = (condition: boolean, msg?: string) => void;

const assert: AssertFunc = __DEBUG__ ? checkAndThrow : noop;
export default assert;
