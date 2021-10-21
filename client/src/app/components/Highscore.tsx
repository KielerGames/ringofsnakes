import { Component } from "preact";
import GameData from "../data/GameData";
import { TopNList } from "../protocol";


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
         let highscore = this.props.data.getTopNList();
         console.log(highscore);
         if(highscore != undefined){
        return (   
                   <div>
                      id =  {highscore.list[0].id}
                      score = {highscore.list[0].score}
                   </div>
        );
    }
    else{
        return(
            <div>
                no highscore
            </div>
        )
    }
}


}


