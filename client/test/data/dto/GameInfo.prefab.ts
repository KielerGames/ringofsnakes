import { GameInfoDTO } from "../../../src/app/data/dto/GameInfoDTO";
import defaultConfig from "../config/GameConfig.prefab";

const defaultGameInfo: GameInfoDTO = {
    config: defaultConfig,
    targetSnakeId: 1,
    startPosition: {
        x: 0,
        y: 0
    }
};

export default defaultGameInfo;
