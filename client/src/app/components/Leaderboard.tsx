import { Component } from "preact";
import GameData from "../data/GameData";
import { TopNList } from "../protocol";
import { TopNListEntry } from "../types/TopNListEntry";


type SLProps = {
    data: Readonly<GameData>;
};

export default class Highscore extends Component<SLProps> {
    private timer: number;


    public constructor(props: SLProps) {
        super(props);
    }

    public componentDidMount() {
        this.timer = window.setInterval(() => {
            this.forceUpdate();
        }, 500);
    }

    public componentWillUnmount() {
        window.clearInterval(this.timer);
    }


    public render() {
         const leaderboard = this.props.data.getTopNList();
         console.log(leaderboard);
         if(leaderboard != undefined){
            return (
                <div id="leaderboard">    
        
                {leaderboard.list.map((entry) => (
                    <Leaderboard key={entry.id} data={entry} />
                ))}

                </div>
            );
               
    }
    else{
        return(
            <div id="leaderboard">
                    <div id="entry"> No leaderboard data</div>
                </div>
        )
    }
}


}

type SOProps = {
    data: TopNListEntry;
};

function Leaderboard(props: Readonly<SOProps>) {
    const entry = props.data;

    return (
        <div id="entry">
            <div id="entry">id: {entry.id} score: {entry.score}</div>
        </div>
    );
}


