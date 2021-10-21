import { Component } from "preact";
import Game from "../Game";
import FPSStats from "./debug/FPSStats";
import SnakeList from "./debug/SnakeList";
import SnakeInfoUI from "./SnakeInfoUI";
import UserInput from "./UserInput";
import Scoreboard from "./Scoreboard";

type Props = {
    game: Game;
};

export default class GameUI extends Component<Props> {
    public render() {
        const game = this.props.game;
        
        return (
            <>
                <Scoreboard data={game.data} />
                <FPSStats />
                <SnakeInfoUI game={game} />
                {__DEBUG__ ? <SnakeList data={game.data} /> : null}
                <UserInput
                    initial={0.0}
                    onChange={game.updateUserData.bind(game)}
                />
                
            </>
        );
    }
}
