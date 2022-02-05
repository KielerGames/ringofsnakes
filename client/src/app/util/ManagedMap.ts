import assert from "./assert";
import { BiConsumer, Consumer } from "./FunctionTypes";

export interface ManagedObject<ID, DTO> {
    id: ID;
    update: BiConsumer<DTO, number>;
    destroy?: () => void;
}

type WithId<T> = { id: T };
type Factory<T, DTO> = (dto: DTO) => T;
type JunkDetector<T> = (obj: T) => boolean;

export class ManagedMap<DTO extends WithId<K>, K, V extends ManagedObject<K, DTO>> {
    private data: Map<K, V> = new Map();
    private factory: Factory<V, DTO>;

    constructor(factory: Factory<V, DTO>) {
        this.factory = factory;
    }

    addDTO(dto: DTO, ticks: number = 0): void {
        const storedValue = this.data.get(dto.id);

        if (storedValue) {
            storedValue.update(dto, ticks);
        } else {
            const value = this.factory(dto);
            assert(dto.id === value.id);
            this.data.set(dto.id, value);
        }
    }

    get(id: K): V | undefined {
        return this.data.get(id);
    }

    remove(id: K): V | undefined {
        const value = this.data.get(id);

        if (value) {
            this.data.delete(id);

            if (value.destroy) {
                value.destroy();
            }

            return value;
        }

        return undefined;
    }

    removeIf(isJunk: JunkDetector<V>, reporter?: Consumer<V[]>): void {
        // collect junk
        const removeList: V[] = [];
        for (const obj of this.data.values()) {
            if (isJunk(obj)) {
                removeList.push(obj);
            }
        }

        // remove junk
        for (const obj of removeList) {
            if (obj.destroy) {
                obj.destroy();
            }
            this.data.delete(obj.id);
        }

        if (reporter) {
            reporter(removeList);
        }
    }

    values(): IterableIterator<V> {
        return this.data.values();
    }

    entries(): IterableIterator<[K,V]> {
        return this.data.entries();
    }

    clear(): void {
        this.data.clear();
    }

    get size(): number {
        return this.data.size;
    }
}
