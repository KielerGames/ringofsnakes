declare module "java-random" {
    export default class JavaRandom {
        setSeed(seed: number): void;
        nextFloat(): number;
        nextBoolean(): boolean;
    }
}
