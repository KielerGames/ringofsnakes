import { Component } from "preact";
import GameData from "../data/GameData";
import { TopNList } from "../protocol";
import { TopNListEntry } from "../types/TopNListEntry";
import WorkerGame from "../worker/WorkerGame";

type SLProps = {
    data: Readonly<WorkerGame>;
};

export default class Highscore extends Component<SLProps> {
    
    public constructor(props: SLProps) {
        super(props);
    }

    public render() {
        const highscore = this.props.data.getTopNList();

        return (
            <div id="snake-list" class="debug-ui">
                {
                   <div>
                      id =  {highscore.list[0].id}
                      score = {highscore.list[0].score}
                   </div>
                
                }
            </div>
        );
    }

}


