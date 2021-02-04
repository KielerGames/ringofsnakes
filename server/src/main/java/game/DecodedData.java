package game;

public class DecodedData {
    public int direction;
    public boolean fast;
    public int steps;

    DecodedData(int direction, boolean fast, int steps) {
        this.direction = direction;
        this.fast = fast;
        this.steps = steps;
    }

    @Override
    public String toString(){
        String s = "";
        s += "fast: " + this.fast + "\n";
        s +=  "steps: " + this.steps + "\n";
        s += "direction: " + this.direction + "\n";
        return s;
    }
}


