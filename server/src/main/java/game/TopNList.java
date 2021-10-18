package game;

import com.google.gson.Gson;
import game.snake.Snake;

import java.util.*;
import java.util.stream.Collectors;

public class TopNList {

    public final short[] ids;
    public final int[] scores;

    Gson gson = new Gson();

    public TopNList(Game game, int n){
        final var length = Math.min(n, game.snakes.size());
        ids = new short[length];
        scores = new int[length];

        final var topSnakes = game.snakes.stream().filter(Snake::isAlive)
                .sorted(Comparator.comparing(Snake::getLength)
                        .reversed()).collect(Collectors.toList());

        int i = 0;
        for (Snake snake : topSnakes) {
            if(i < n) {
                ids[i] = snake.id;
                scores[i]= (int) snake.getLength();
            }
            i++;
        }
    }

    public String getJson = gson.toJson(this);

    @Override
    public String toString() {
        return "TopNList{" +
                "ids=" + Arrays.toString(ids) +
                ", scores=" + Arrays.toString(scores) +
                '}';
    }
}
