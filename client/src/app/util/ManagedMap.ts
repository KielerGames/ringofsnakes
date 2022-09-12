import assert from "./assert";
import { BiConsumer, Consumer, Predicate } from "./FunctionTypes";

export interface ManagedObject<ID, DTO, COMMON_INFO = void> {
    id: ID;
    update: BiConsumer<DTO, COMMON_INFO>;
    destroy?: () => void;
}

type WithId<T> = { id: T };
type Factory<T, DTO> = (dto: DTO) => T;

export class ManagedMap<DTO extends WithId<K>, K, V extends ManagedObject<K, DTO, CI>, CI = void> {
    readonly #data: Map<K, V> = new Map();
    readonly #factory: Factory<V, DTO>;

    /**
     * @param factory A function to create values given a data transfer object.
     */
    constructor(factory: Factory<V, DTO>) {
        this.#factory = factory;
    }

    add(dto: DTO, info: CI): void {
        const storedValue = this.#data.get(dto.id);

        if (storedValue) {
            storedValue.update(dto, info);
        } else {
            const value = this.#factory(dto);
            assert(dto.id === value.id);
            this.#data.set(dto.id, value);
        }
    }

    addMultiple(dtos: Iterable<DTO>, info: CI): void {
        for (const dto of dtos) {
            this.add(dto, info);
        }
    }

    get(id: K): V | undefined {
        return this.#data.get(id);
    }

    has(id: K): boolean {
        return this.#data.has(id);
    }

    runIfPresent(id: K, consumer: Consumer<V>): boolean {
        const value = this.#data.get(id);
        if (value) {
            consumer(value);
        }
        return value !== undefined;
    }

    /**
     * Remove by id.
     * @param id
     * @returns The removed element or undefined if it does not exist.
     */
    remove(id: K): V | undefined {
        const value = this.#data.get(id);

        if (value) {
            this.#data.delete(id);

            if (value.destroy) {
                value.destroy();
            }
        }

        return value;
    }

    /**
     * Remove matching objects from the map.
     * @param isJunk A function that returns true if the object should be removed.
     * @returns An array of removed elements.
     */
    removeIf(isJunk: Predicate<V>): V[] {
        // collect junk
        const removeList: V[] = [];
        for (const obj of this.#data.values()) {
            if (isJunk(obj)) {
                removeList.push(obj);
            }
        }

        // remove junk
        for (const obj of removeList) {
            if (obj.destroy) {
                obj.destroy();
            }
            this.#data.delete(obj.id);
        }

        return removeList;
    }

    forEach(consumer: BiConsumer<V, K>): void {
        this.#data.forEach(consumer);
    }

    values(): IterableIterator<V> {
        return this.#data.values();
    }

    entries(): IterableIterator<[K, V]> {
        return this.#data.entries();
    }

    clear(): void {
        this.#data.clear();
    }

    get size(): number {
        return this.#data.size;
    }
}
