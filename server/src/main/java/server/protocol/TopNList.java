package server.protocol;

import game.Game;
import game.snake.Snake;
import java.util.*;
import java.util.stream.Collectors;

public class TopNList extends ServerToClientJSONMessage{

    public final TopNListEntry[] list;

    public TopNList(Game game, int n){
        final var length = Math.min(n, game.snakes.size());
        list = new TopNListEntry[length];
        final var topSnakes = game.snakes.stream().filter(Snake::isAlive)
                .sorted(Comparator.comparing(Snake::getLength)
                        .reversed()).limit(length).collect(Collectors.toList());

        int i = 0;
        for (Snake snake : topSnakes) {
            if(i < n) {
                list[i] = new TopNListEntry(snake.id, (int) snake.getLength());
            }
            i++;
        }
    }

    private class TopNListEntry {

        private final short id;
        private final int score;

        private TopNListEntry(short id, int score){
            this.id = id;
            this.score = score;
        }
    }
}

