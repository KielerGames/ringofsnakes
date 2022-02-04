import defaultGameInfo from "../data/dto/GameInfo.prefab";

const defaultRemoteMock = {
    init: () => defaultGameInfo,
    addEventListener: jest.fn(),
    getDataChanges: jest.fn()
};

export default defaultRemoteMock;

export function clearDefaultRemoteMock(): void {
    defaultRemoteMock.addEventListener.mockClear();
    defaultRemoteMock.getDataChanges.mockClear();
}