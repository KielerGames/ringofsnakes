declare const __DEBUG__: boolean;

function checkAndThrow(condition: boolean, msg:string = ""):void {
    if(!condition) {
        throw new Error(`AssertionError: ${msg}`);
    }
}

function noop():void {}

type AssertFunc = (condition: boolean, msg?:string) => void;

const assert: AssertFunc = __DEBUG__ ? checkAndThrow : noop;
export default assert;
