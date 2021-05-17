import { Component } from "preact";
import Game from "../Game";
import SnakeList from "./debug/SnakeList";
import UserInput from "./UserInput";

type Props = {
    game: Game;
};

export default class GameUI extends Component<Props> {
    public render() {
        const game = this.props.game;

        return (
            <>
                {__DEBUG__ ? <SnakeList data={game.data} /> : null}
                <UserInput
                    initial={0.0}
                    onChange={game.updateUserInput.bind(game)}
                />
            </>
        );
    }
}
