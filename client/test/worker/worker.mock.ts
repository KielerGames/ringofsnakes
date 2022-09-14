import defaultGameInfo from "../data/dto/GameInfo.prefab";

const defaultRemoteMock = {
    init: () => Promise.resolve(defaultGameInfo),
    addEventListener: jest.fn(),
    onSpectatorChange: jest.fn(),
    getDataChanges: jest.fn()
};

export default defaultRemoteMock;
