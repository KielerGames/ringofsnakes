import { ManagedMap, ManagedObject } from "../../src/app/util/ManagedMap";

type DTO = { id: number };

class TestObject implements ManagedObject<number, DTO> {
    static instanceCount = 0;
    id: number;
    updateCount = 0;

    constructor(id: number) {
        TestObject.instanceCount++;
        this.id = id;
    }

    update(): void {
        this.updateCount++;
    }
}

describe("ManagedMap", () => {
    let managedMap: ManagedMap<DTO, number, TestObject>;

    beforeEach(() => {
        managedMap = new ManagedMap((dto) => new TestObject(dto.id));
        TestObject.instanceCount = 0;
    });

    it("should create only 1 instance", () => {
        const id = 1;
        managedMap.add({ id });
        expect(TestObject.instanceCount).toBe(1);
        expect(managedMap.size).toBe(1);
        managedMap.add({ id });
        expect(TestObject.instanceCount).toBe(1);
        expect(managedMap.get(id)!.updateCount).toBe(1);
        expect(managedMap.size).toBe(1);
    });

    test("remove by id", () => {
        const id = 1;
        managedMap.add({ id });
        managedMap.remove(id);
        expect(managedMap.size).toBe(0);
    });
});
