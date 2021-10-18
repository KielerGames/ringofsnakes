

export default class TopNList {
    public readonly ids: Array<number>
    public readonly scores: Array<number>;

    public constructor(ids : Array<number>, scores : Array<number>) {
        this.ids = ids;
        this.scores = scores;
    }

    public printToConsole = () => {
        console.log("Printing highscore: ");

        var i : number = 0;
        this.ids.forEach(id  => {
            console.log("id = " + id + ", score = " + this.scores[i]); 
            i++;
        });
    }

}