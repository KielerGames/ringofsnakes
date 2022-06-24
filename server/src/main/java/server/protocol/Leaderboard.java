package server.protocol;

import game.Game;
import game.snake.Snake;
import server.Player;

import java.util.*;

public class Leaderboard extends ServerToClientJSONMessage {

    final List<LeaderboardEntry> list;

    public Leaderboard(Game game, int n) {
        list = game.streamClients().filter(Player.class::isInstance)
                .map(client -> ((Player) client).snake)
                .filter(Snake::isAlive)
                .sorted(Comparator.comparing(Snake::getLength).reversed())
                .limit(n)
                .map(LeaderboardEntry::new)
                .toList();
    }

    private static class LeaderboardEntry {

        final String name;
        final int score;

        private LeaderboardEntry(Snake snake) {
            this.name = snake.name;
            this.score = (int) snake.getLength();
        }
    }
}

