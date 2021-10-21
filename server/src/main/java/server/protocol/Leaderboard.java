package server.protocol;

import game.Game;
import game.snake.Snake;
import server.Player;

import java.util.*;
import java.util.stream.Collectors;

public class Leaderboard extends ServerToClientJSONMessage {

    private final List<LeaderboardEntry> list;

    public Leaderboard(Game game, int n) {
        list = game.streamClients().filter(Player.class::isInstance)
                .map(client -> ((Player) client).snake)
                .filter(Snake::isAlive)
                .sorted(Comparator.comparing(Snake::getLength).reversed())
                .limit(Math.min(n, game.snakes.size()))
                .map(LeaderboardEntry::new)
                .collect(Collectors.toList());
    }

    private class LeaderboardEntry {

        private final String name;
        private final int score;

        private LeaderboardEntry(Snake s) {
            this.name = "Snake " + s.id;
            this.score = (int) s.getLength();
        }
    }
}

