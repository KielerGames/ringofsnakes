package server.protocol;

import game.Game;
import game.snake.Snake;
import java.util.*;
import java.util.stream.Collectors;

public class Leaderboard extends ServerToClientJSONMessage{

    private final List<LeaderboardEntry> list;

    public Leaderboard(Game game, int n){
        final var length = Math.min(n, game.snakes.size());
        list = (game.snakes.stream().filter(Snake::isAlive)
                .sorted(Comparator.comparing(Snake::getLength).reversed())
                .limit(length)
                .map(LeaderboardEntry::new)
                .collect(Collectors.toList()));
    }

    private class LeaderboardEntry {

        private final String name;
        private final int score;

        private LeaderboardEntry(Snake s){
            this.name = "Snake " + s.id;
            this.score = (int) s.getLength();
        }
    }
}

