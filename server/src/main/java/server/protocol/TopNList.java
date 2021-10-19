package server.protocol;

import game.Game;
import game.snake.Snake;
import java.util.*;
import java.util.stream.Collectors;

public class TopNList extends ServerToClientJSONMessage{

    public final short[] ids;
    public final int[] scores;

    public TopNList(Game game, int n){
        final var length = Math.min(n, game.snakes.size());
        ids = new short[length];
        scores = new int[length];

        final var topSnakes = game.snakes.stream().filter(Snake::isAlive)
                .sorted(Comparator.comparing(Snake::getLength)
                        .reversed()).limit(length).collect(Collectors.toList());

        int i = 0;
        for (Snake snake : topSnakes) {
            if(i < n) {
                ids[i] = snake.id;
                scores[i]= (int) snake.getLength();
            }
            i++;
        }
    }
}

