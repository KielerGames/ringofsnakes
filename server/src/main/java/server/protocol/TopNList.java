package server.protocol;

import game.Game;
import game.snake.Snake;
import java.util.*;
import java.util.stream.Collectors;

public class TopNList extends ServerToClientJSONMessage{

    private final List<TopNListEntry> list;

    public TopNList(Game game, int n){
        final var length = Math.min(n, game.snakes.size());
        list = (game.snakes.stream().filter(Snake::isAlive)
                .sorted(Comparator.comparing(Snake::getLength).reversed())
                .limit(length)
                .map(snake -> new TopNListEntry(snake.id, (int) snake.getLength()))
                .collect(Collectors.toList()));
    }

    private class TopNListEntry {

        private final String name;
        private final int score;

        private TopNListEntry(short id, int score){
            this.name = "Snake" + id;
            this.score = score;
        }
    }
}

