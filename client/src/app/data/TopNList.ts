export default class TopNList {
    public readonly ids: number[];
    public readonly scores: number[];

    public constructor(ids: Array<number>, scores: Array<number>) {
        this.ids = ids;
        this.scores = scores;
    }

    public printToConsole = () => {
        console.log("Printing highscore: ");

        let i: number = 0;
        this.ids.forEach((id) => {
            console.log("id = " + id + ", score = " + this.scores[i]);
            i++;
        });
    };
}
