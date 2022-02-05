export type Consumer<T> = (data: T) => void;

export type BiConsumer<T1, T2> = (a: T1, b: T2) => void;

export type Supplier<T> = () => T;

export type Callback = () => void;
